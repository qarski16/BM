// =========================================================================
// ⚠️ WAJIB DI BARIS 1: Load file .env sebelum modul apa pun di-import!
// =========================================================================
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); 

const app = express();

// Panggil koneksi database
connectDB();

// Middleware dasar
app.use(cors());
app.use(express.json()); 

// --- 🌐 REGISTRASI RUTE API UTAMA ---
// Sekarang rute ini aman membaca GOOGLE_CLIENT_ID & SECRET dari .env
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pesanan', require('./routes/pesanan')); 


// =========================================================================
// 🔄 PENYESUAIAN RUTE UPDATE PESANAN (MENDUKUNG ID KURIR STRING "BM001")
// =========================================================================
app.put('/api/pesanan/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, kurirId } = req.body; 
        const mongoose = require('mongoose');

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

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server jalan di port ${PORT}`);
});