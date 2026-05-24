const express = require('express');
const router = express.Router();
const Pesanan = require('../models/Pesanan');
const User = require('../models/User'); 

// Middleware Autentikasi JWT
const auth = require('../middleware/authMiddleware');

// 1. CREATE: Tambah Pesanan Baru (Publik)
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

// 2. READ: Summary Dashboard Utama (Anti-Crash Global)
router.get('/summary', async (req, res) => {
  try {
    // Ambil kalkulasi data koleksi pesanan
    const countPending = await Pesanan.countDocuments({ status: 'Pending' });
    const countProses = await Pesanan.countDocuments({ status: 'Proses' });
    const countSelesai = await Pesanan.countDocuments({ status: 'Selesai' });
    
    let countKurir = 0;
    let statusKurirDinamis = [];

    // Isolasi sub-model User agar kegagalan pencarian skema Kurir tidak merusak rute utama
    try {
      countKurir = await User.countDocuments({ role: 'kurir' });
      const daftarKurirMongoose = await User.find({ role: 'kurir' }).select('namaLengkap statusOnline');
      statusKurirDinamis = daftarKurirMongoose.map(k => ({
        nama: k.namaLengkap,
        status: k.statusOnline || 'Offline'
      }));
    } catch (userError) {
      console.log("Catatan: Database Kurir/User kosong atau belum terhubung. Menggunakan array kosong.");
    }

    // Kalkulasi data Grafik Batang Mingguan (7 Hari Terakhir)
    const grafikMingguan = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);

      const jumlahPesananHariIni = await Pesanan.countDocuments({
        createdAt: { $gte: d, $lte: dEnd }
      });
      grafikMingguan.push(jumlahPesananHariIni);
    }

    res.json({
      pesananMasuk: countPending,
      dalamProses: countProses,
      pesananSelesai: countSelesai,
      kurirAktif: countKurir,
      listKurir: statusKurirDinamis,  
      dataGrafik: grafikMingguan      
    });

  } catch (err) {
    console.error("Fatal Error Rute Summary Backend:", err.message);
    res.status(500).json({ 
      pesananMasuk: 0, dalamProses: 0, pesananSelesai: 0, kurirAktif: 0, 
      listKurir: [], dataGrafik: [0,0,0,0,0,0,0], msg: "Server Error" 
    });
  }
});

// 3. READ: Mengambil Semua Pesanan (Aktivitas Terbaru)
router.get('/semua', async (req, res) => {
  try {
    const pesanans = await Pesanan.find().sort({ createdAt: -1 });
    res.json(pesanans);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 4. READ: Detail Laporan Selesai
router.get('/laporan-detail', async (req, res) => {
  try {
    const laporan = await Pesanan.find({ status: 'Selesai' }).populate('kurirId', 'namaLengkap');
    res.json(laporan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. UPDATE: Perbarui Status Pesanan (Terproteksi JWT)
router.put('/update-status/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Proses', 'Selesai'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const pesananTerupdate = await Pesanan.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );

    if (!pesananTerupdate) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    res.status(200).json({ message: 'Status pesanan berhasil diperbarui!', data: pesananTerupdate });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 6. DELETE: Hapus Pesanan Permanen (Terproteksi JWT)
router.delete('/hapus/:id', auth, async (req, res) => {
  try {
    const pesananTerhapus = await Pesanan.findByIdAndDelete(req.params.id);
    if (!pesananTerhapus) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
    res.status(200).json({ message: 'Pesanan berhasil dihapus dari database cloud!' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Menangkap data riwayat tugas kurir yang telah selesai atau diproses
router.get('/kurir/riwayat/:kurirId', async (req, res) => {
  try {
    const { kurirId } = req.params;
    
    // Mencari semua pesanan milik kurir ini di database
    const riwayatPesanan = await Pesanan.find({ kurirId: kurirId }).sort({ tanggal: -1 });
    
    res.json(riwayatPesanan);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data riwayat database." });
  }
});

module.exports = router;