// =========================================================================
// ⚠️ WAJIB DI BARIS 1: Load file .env sebelum modul apa pun di-import!
// =========================================================================
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); 
const connectDB = require('./config/db'); 

const app = express();

// =========================================================================
// 🌐 KONFIGURASI CORS EKSPLISIT UNTUK PROD & DEV
// =========================================================================
app.use(cors({
    origin: '*', // Mengizinkan semua origin agar komunikasi antar-cloud Vercel lancar
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 

// =========================================================================
// 🗄️ MANAJEMEN KONEKSI DATABASE (OPTIMAL UNTUK VERCEL SERVERLESS)
// =========================================================================
const hubungkanDatabaseProduksi = async () => {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
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
        // Membuka koneksi dengan toleransi timeout tinggi untuk serverless cloud
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
} else if (process.env.NODE_ENV === 'production') {
    // Biarkan dipanggil pertama kali, jika lambat akan ditangani oleh middleware di bawah
    hubungkanDatabaseProduksi().catch(() => {});
} else {
    // Mode lokal/development
    connectDB();
}

// Middleware tambahan untuk menjamin database selalu siap sebelum rute diproses (Khusus Vercel)
app.use(async (req, res, next) => {
    if (process.env.NODE_ENV === 'production' && mongoose.connection.readyState !== 1) {
        await hubungkanDatabaseProduksi();
    }
    next();
});

// --- 🌐 REGISTRASI RUTE API UTAMA ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pesanan', require('./routes/pesanan')); 


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
// 🔄 PENYESUAIAN RUTE UPDATE PESANAN (MENDUKUNG ID KURIR STRING "BM001")
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

// Cek status server (Root path)
app.get('/', (req, res) => {
    res.send('Server BM Kurir Aktif & Database Terkoneksi dengan Format ID Kustom!');
});

// =========================================================================
// 🚀 PENGONDISIAN LISTEN PORT
// =========================================================================
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server jalan di port ${PORT}`);
    });
}

module.exports = app;