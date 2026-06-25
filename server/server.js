const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoose = require('mongoose'); 
const connectDB = require('./config/db'); 

const app = express();

// =========================================================================
// 🔒 PERBAIKAN KEAMANAN 1: Helmet.js - Security Headers
// =========================================================================
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}));

// =========================================================================
// 🔒 PERBAIKAN KEAMANAN 2: express-rate-limit - Batasi Request
// =========================================================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // maksimal 100 request per IP
  message: {
    success: false,
    message: 'Terlalu banyak permintaan, silakan coba lagi dalam 15 menit'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Terapkan ke semua endpoint
app.use(generalLimiter);

// Rate limit khusus login (lebih ketat)
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: 5, // maksimal 5 percobaan login per IP
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login, silakan coba lagi dalam 5 menit'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =========================================================================
// 🌐 PERBAIKAN KEAMANAN 3: CORS - Batasi Origin
// =========================================================================
app.use(cors({
    // ✅ GANTI '*' dengan URL frontend Anda
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true
}));

app.use(express.json()); 

// =========================================================================
// 🗄️ MANAJEMEN KONEKSI DATABASE
// =========================================================================
const hubungkanDatabaseProduksi = async () => {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
        return;
    }
    try {
        const prodURI = process.env.MONGO_URI_PROD || process.env.MONGO_URI;
        if (!prodURI) {
            console.error('❌ Error: MONGO_URI_PROD tidak ditemukan di Environment Variables!');
            return;
        }
        
        console.log('⏳ Mencoba menyambungkan ke MongoDB Atlas...');
        await mongoose.connect(prodURI, {
            serverSelectionTimeoutMS: 5000 
        });
        
        console.log('✅ MongoDB Atlas (Production) Terkoneksi Sukses!');
    } catch (err) {
        console.error('❌ Gagal Connect ke MongoDB Atlas:', err.message);
    }
};

// Eksekusi pengondisian environment awal
if (process.env.NODE_ENV === 'test') {
    const dbTestURI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/bm_kurir_testing';
    mongoose.connect(dbTestURI).catch(() => {});
} else if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    hubungkanDatabaseProduksi().catch(() => {});
} else {
    connectDB();
}

// Middleware untuk menjamin database selalu siap sebelum route diproses
app.use(async (req, res, next) => {
    if ((process.env.NODE_ENV === 'production' || process.env.VERCEL) && mongoose.connection.readyState !== 1) {
        await hubungkanDatabaseProduksi();
    }
    next();
});

// --- 🌐 REGISTRASI RUTE API UTAMA ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pesanan', require('./routes/pesanan')); 

// Terapkan rate limit ketat untuk login
app.use('/api/auth/login', loginLimiter);

// =========================================================================
// 🩺 HEALTH CHECK ENDPOINT
// =========================================================================
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// =========================================================================
// 🔄 PENYESUAIAN RUTE UPDATE PESANAN
// =========================================================================
app.put('/api/pesanan/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, kurirId } = req.body; 

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Format ID Pesanan tidak valid' });
        }

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const collectionName = collections.find(c => c.name === 'pesanans' || c.name === 'orders' || c.name === 'pesanan')?.name || 'pesanans';

        const updateData = {};
        if (status) updateData.status = status;
        
        if (kurirId) {
            if (kurirId.startsWith('BM') || kurirId.startsWith('ADM')) {
                updateData.kurirId = kurirId; 
            } else if (mongoose.Types.ObjectId.isValid(kurirId)) {
                updateData.kurirId = new mongoose.Types.ObjectId(kurirId);
            }
        }

        const result = await db.collection(collectionName).updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Data pesanan tidak ditemukan di database' });
        }

        res.status(200).json({ success: true, message: 'Status pesanan berhasil diperbarui!' });
    } catch (err) {
        console.error('Error saat update pesanan di server.js:', err);
        res.status(500).json({ message: 'Terjadi kesalahan pada internal server', error: err.message });
    }
});

// Root path
app.get('/', (req, res) => {
    res.send('Server BM Kurir Aktif & Database Terkoneksi dengan Format ID Kustom!');
});

// =========================================================================
// 🚀 LISTEN PORT (HANYA JIKA BUKAN DI VERCEL)
// =========================================================================
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server berjalan di port ${PORT}`);
    });
}

// ⚠️ EKSPOR app untuk Vercel Serverless Functions
module.exports = app;
