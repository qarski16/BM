const express = require('express');
const router = express.Router();
const Pesanan = require('../models/Pesanan');

// 1. Tambah Pesanan Baru (Untuk Pembeli)
router.post('/tambah', async (req, res) => {
  const { namaLengkap, noTelpon, alamat, detailPesanan } = req.body;
  try {
    const pesananBaru = new Pesanan({
      namaLengkap,
      noTelpon,
      alamat,
      detailPesanan
    });
    const pesanan = await pesananBaru.save();
    res.status(201).json(pesanan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. Ambil Ringkasan Statistik (Untuk Kotak Dashboard)
router.get('/summary', async (req, res) => {
  try {
    const countPending = await Pesanan.countDocuments({ status: 'Pending' });
    const countProses = await Pesanan.countDocuments({ status: 'Proses' });
    const countSelesai = await Pesanan.countDocuments({ status: 'Selesai' });

    res.json({
      pesananMasuk: countPending,
      dalamProses: countProses,
      pesananSelesai: countSelesai,
      kurirAktif: 0 // Sementara 0, nanti dihitung dari data User Kurir
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 3. Ambil Semua Daftar Pesanan (Untuk Aktivitas Terbaru)
router.get('/semua', async (req, res) => {
  try {
    const pesanans = await Pesanan.find().sort({ createdAt: -1 }).limit(10);
    res.json(pesanans);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Endpoint untuk data laporan
router.get('/laporan-detail', async (req, res) => {
  try {
    // Di sini kita mengambil pesanan yang statusnya sudah 'Selesai'
    const laporan = await Pesanan.find({ status: 'Selesai' }).populate('kurirId', 'namaLengkap');
    res.json(laporan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;