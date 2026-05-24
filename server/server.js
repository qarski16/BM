const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); 
require('dotenv').config();

const app = express();

// Panggil koneksi database
connectDB();

// Middleware dasar
app.use(cors());
app.use(express.json()); 

// --- 🌐 REGISTRASI RUTE API UTAMA ---

// Seluruh endpoint otentikasi, profil, dan status dialihkan ke routes/authRoutes.js
app.use('/api/auth', require('./routes/authRoutes'));

// Rute Pesanan (Form Pesanan Publik)
app.use('/api/pesanan', require('./routes/pesanan')); 


// =========================================================================
// 🔄 PENYESUAIAN RUTE UPDATE PESANAN (MENDUKUNG ID KURIR STRING "BM001")
// =========================================================================
// Rute ini tetap dipertahankan di server.js jika rute pesanan belum dipindah ke controller tersendiri
app.put('/api/pesanan/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, kurirId } = req.body; // kurirId yang dikirim sekarang berupa teks seperti "BM001"
        const mongoose = require('mongoose');

        // Validasi apakah ID pesanan berbentuk ObjectId MongoDB yang valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Format ID Pesanan tidak valid' });
        }

        const db = mongoose.connection.db;
        
        // Cari tahu nama collection pesanan secara dinamis (biasanya 'pesanans')
        const collections = await db.listCollections().toArray();
        const collectionName = collections.find(c => c.name === 'pesanans' || c.name === 'orders' || c.name === 'pesanan')?.name || 'pesanans';

        // Susun data pembaharuan
        const updateData = {};
        if (status) updateData.status = status;
        
        if (kurirId) {
            // 🛠️ PERBAIKAN PENTING: Jika kurirId diawali dengan 'BM', simpan sebagai STRING MURNI.
            // Jika bukan (misal id pesanan lain atau legacy data), baru dikonversi ke ObjectId.
            if (kurirId.startsWith('BM') || kurirId.startsWith('ADM')) {
                updateData.kurirId = kurirId; // Tersimpan rapi sebagai "BM001"
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