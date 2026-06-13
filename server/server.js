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
// 🗄️ STRATEGI PEMISAHAN DATABASE UTAMA VS DATABASE TESTING
// =========================================================================
if (process.env.NODE_ENV === 'test') {
    // Jika sedang dalam mode testing, bypass connectDB() bawaan dan arahkan ke database test khusus
    const dbTestURI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/bm_kurir_testing';
    
    // Menggunakan opsi standard Mongoose untuk menjaga stabilitas koneksi internal Jest
    mongoose.connect(dbTestURI)
      .then(() => {
          // Log dimatikan agar output terminal 'npm test' bersih dari teks log database
      })
      .catch(err => console.error('Gagal koneksi database testing:', err.message));
} else {
    // Jalankan koneksi database produksi/lokal bawaan Anda seperti biasa
    connectDB();
}

// Middleware dasar
app.use(cors());
app.use(express.json()); 

// --- 🌐 REGISTRASI RUTE API UTAMA ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pesanan', require('./routes/pesanan')); 


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
// 🚀 PENGONDISIAN LISTEN PORT (PENTING AGAR TIDAK SALING MENGUNCI PORT DENGAN JEST)
// =========================================================================
// Hanya jalankan server listen JIKA tidak sedang menjalankan pengujian (bukan mode test)
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server jalan di port ${PORT}`);
    });
}

// 🎯 SELESAI & WAJIB: Export instance 'app' agar bisa dieksekusi dari file pengujian Jest/Supertest
module.exports = app;