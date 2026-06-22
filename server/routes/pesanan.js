const express = require('express');
const router = express.Router();
const Pesanan = require('../models/Pesanan');
const User = require('../models/User'); 
const mongoose = require('mongoose'); 

// Middleware Autentikasi JWT
const auth = require('../middleware/authMiddleware');

// =========================================================================
// 1. CREATE: Tambah Pesanan Baru (Publik)
// =========================================================================
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

// =========================================================================
// 2. READ: Summary Dashboard Utama Admin (Anti-Crash Global & Filter Harian)
// =========================================================================
router.get('/summary', async (req, res) => {
  try {
    const awalHariIni = new Date();
    awalHariIni.setHours(0, 0, 0, 0);

    const akhirHariIni = new Date();
    akhirHariIni.setHours(23, 59, 59, 999);

    const filterHarian = { createdAt: { $gte: awalHariIni, $lte: akhirHariIni } };

    const countPending = await Pesanan.countDocuments({ status: 'Pending', ...filterHarian });
    const countProses = await Pesanan.countDocuments({ status: 'Proses', ...filterHarian });
    const countSelesai = await Pesanan.countDocuments({ status: 'Selesai', ...filterHarian });
    
    let countKurir = 0;
    let statusKurirDinamis = [];

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

// =========================================================================
// 3. READ: Mengambil Semua Pesanan Harian (Admin)
// =========================================================================
router.get('/semua', async (req, res) => {
  try {
    const awalHariIni = new Date();
    awalHariIni.setHours(0, 0, 0, 0);

    const akhirHariIni = new Date();
    akhirHariIni.setHours(23, 59, 59, 999);

    const pesanans = await Pesanan.find({
      createdAt: { $gte: awalHariIni, $lte: akhirHariIni }
    }).sort({ createdAt: -1 });

    res.json(pesanans);
  } catch (err) {
    console.error("Error ambil semua pesanan harian:", err.message);
    res.status(500).send('Server Error');
  }
});

// =========================================================================
// ⭐ 3b. READ: Ambil Detail Tunggal Pesanan (Untuk Pelacakan Live Stepper)
// =========================================================================
router.get('/detail/:id', async (req, res) => {
  try {
    const pesanan = await Pesanan.findById(req.params.id);
    if (!pesanan) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
    res.json(pesanan);
  } catch (err) {
    console.error("Error ambil detail pesanan:", err.message);
    res.status(500).send('Server Error');
  }
});

// =========================================================================
// 4. READ: Detail Laporan Selesai
// =========================================================================
router.get('/laporan-detail', async (req, res) => {
  try {
    const laporan = await Pesanan.find({ status: 'Selesai' }).populate({
      path: 'kurirId',
      select: 'namaLengkap',
      match: { _id: { $exists: true } } 
    });
    res.json(laporan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================================================================
// ⭐ 4b. BARU - READ: Ambil List Kurir + Hitung Komisi 2% untuk Manajemen Admin
// =========================================================================
router.get('/admin/manajemen-kurir', async (req, res) => {
  try {
    const listKurir = await User.find({ role: 'kurir' }).lean();

    const dataKurirDenganKomisi = await Promise.all(
      listKurir.map(async (kurir) => {
        let kriteriaPencarian = [
          { kurirId: kurir._id.toString() },
          { kurirId: kurir.namaLengkap }
        ];

        if (kurir.email) {
          kriteriaPencarian.push({ kurirId: kurir.email });
        }

        const jumlahSelesai = await Pesanan.countDocuments({
          status: { $regex: /^selesai$/i },
          $or: kriteriaPencarian
        });

        const persentaseKomisi = jumlahSelesai * 2;

        return {
          ...kurir,
          komisiSistem: persentaseKomisi
        };
      })
    );

    res.json(dataKurirDenganKomisi);
  } catch (err) {
    console.error("Error mengambil list kurir admin:", err.message);
    res.status(500).json({ message: "Gagal memuat data manajemen kurir." });
  }
});

// =========================================================================
// 5. UPDATE: Menugaskan Kurir ke Pesanan (Assign)
// =========================================================================
router.put('/assign/:id', async (req, res) => {
  try {
    const { kurirId } = req.body; 

    if (!kurirId) {
      return res.status(400).json({ success: false, message: 'Kurir ID harus disertakan!' });
    }

    const pesananTerupdate = await Pesanan.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Proses',
        kurirId: kurirId 
      },
      { returnDocument: 'after' } 
    );

    if (!pesananTerupdate) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    res.status(200).json({ 
      success: true,
      message: 'Kurir berhasil ditugaskan ke pesanan ini!', 
      data: pesananTerupdate 
    });
  } catch (err) {
    console.error("Error Assign Kurir:", err.message);
    res.status(500).json({ success: false, message: 'Server Error saat melakukan penugasan.' });
  }
});

// =========================================================================
// 6. UPDATE: Perbarui Status Pesanan Dinamis (Flow Tombol Kurir)
// =========================================================================
router.put('/update-status/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const statusValid = ['Pending', 'Proses', 'Ambil Barang', 'Dalam Perjalanan', 'Sampai Tujuan', 'Selesai'];

    if (!statusValid.includes(status)) {
      return res.status(400).json({ message: `Status '${status}' tidak valid.` });
    }

    console.log(`\n--- 🔄 PERUBAHAN STATUS PESANAN ---`);
    console.log(`Pesanan ID : ${req.params.id}`);
    console.log(`Status Baru : ${status}`);

    const pesananTerupdate = await Pesanan.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { returnDocument: 'after' } 
    );

    if (!pesananTerupdate) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    console.log(`Hasil       : Sukses diperbarui ke MongoDB.`);
    console.log(`-----------------------------------\n`);

    res.status(200).json({ 
      success: true,
      message: 'Status pesanan berhasil diperbarui!', 
      data: pesananTerupdate 
    });
  } catch (err) {
    console.error("Error Update Status:", err.message);
    res.status(500).send('Server Error');
  }
});

// =========================================================================
// ⭐ 6b. UPDATE: Kirim Rating dan Ulasan dari Pemesan untuk Kurir
// =========================================================================
router.put('/kirim-rating/:id', async (req, res) => {
  try {
    const { rating, catatanRating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating harus bernilai angka 1 sampai 5." });
    }

    const pesananTerating = await Pesanan.findByIdAndUpdate(
      req.params.id,
      { 
        rating: rating,
        catatanRating: catatanRating || ""
      },
      { returnDocument: 'after' }
    );

    if (!pesananTerating) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Rating pelayanan kurir berhasil disimpan ke cloud database!',
      data: pesananTerating 
    });
  } catch (err) {
    console.error("Error Simpan Rating Pemesan:", err.message);
    res.status(500).send('Server Error');
  }
});

// =========================================================================
// 7. DELETE: Hapus Pesanan Permanen (Terproteksi JWT)
// =========================================================================
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

// =========================================================================
// 8. READ: Ambil Tugas Aktif Kurir (LOGIKA ASLI ANDA YANG BERHASIL)
// =========================================================================
router.get('/kurir/aktif/:kurirId', async (req, res) => {
  try {
    const { kurirId } = req.params;
    let kriteriaPencarian = [{ kurirId: kurirId }];

    const dataUser = await User.findOne({ 
      $or: [{ _id: kurirId }, { kurirId: kurirId }, { namaLengkap: kurirId }] 
    });

    if (dataUser) {
      if (dataUser._id) kriteriaPencarian.push({ kurirId: dataUser._id });
      if (dataUser.kurirId) kriteriaPencarian.push({ kurirId: dataUser.kurirId });
      if (dataUser.namaLengkap) kriteriaPencarian.push({ kurirId: dataUser.namaLengkap });
    }

    if (mongoose.Types.ObjectId.isValid(kurirId)) {
      kriteriaPencarian.push({ kurirId: new mongoose.Types.ObjectId(kurirId) });
    }

    const tugasAktif = await Pesanan.find({ 
      status: { $in: ['Proses', 'Ambil Barang', 'Dalam Perjalanan', 'Sampai Tujuan'] },
      $or: kriteriaPencarian
    }).sort({ createdAt: -1 });

    res.json(tugasAktif);
  } catch (err) {
    console.error("Error Ambil Tugas Aktif:", err.message);
    res.status(500).json({ message: "Gagal mengambil data tugas." });
  }
});

// =========================================================================
// 9. READ: AMBIL RIWAYAT TUGAS KURIR (DISAMAKAN PERSIS STRUKTURNYA DENGAN RUTE AKTIF)
// =========================================================================
router.get('/kurir/riwayat/:kurirId', async (req, res) => {
  try {
    const { kurirId } = req.params;
    let kriteriaPencarian = [{ kurirId: kurirId }];

    // Menyalin logika pencarian user dari rute aktif Anda yang sudah terbukti berhasil
    const dataUser = await User.findOne({ 
      $or: [{ _id: kurirId }, { kurirId: kurirId }, { namaLengkap: kurirId }] 
    });

    if (dataUser) {
      if (dataUser._id) kriteriaPencarian.push({ kurirId: dataUser._id });
      if (dataUser.kurirId) kriteriaPencarian.push({ kurirId: dataUser.kurirId });
      if (dataUser.namaLengkap) kriteriaPencarian.push({ kurirId: dataUser.namaLengkap });
    }

    if (mongoose.Types.ObjectId.isValid(kurirId)) {
      kriteriaPencarian.push({ kurirId: new mongoose.Types.ObjectId(kurirId) });
    }

    // Mengambil pesanan khusus status 'Selesai' menggunakan kriteria pencarian yang sama persis
    const riwayatPesanan = await Pesanan.find({ 
      status: { $regex: /^selesai$/i }, 
      $or: kriteriaPencarian
    }).sort({ createdAt: -1 });
    
    res.json(riwayatPesanan);
  } catch (err) {
    console.error("Error Ambil Riwayat Kurir:", err.message);
    res.status(500).json({ message: "Gagal mengambil data riwayat." });
  }
});

// =========================================================================
// ⭐ 10. READ: KOTAK SUMMARY HITUNG RATA-RATA RATING & KOMISI DINAMIS
// =========================================================================
router.get('/kurir/summary-performa/:kurirId', async (req, res) => {
  try {
    const { kurirId } = req.params;
    let kriteriaPencarian = [{ kurirId: kurirId }];

    const dataUser = await User.findOne({ 
      $or: [{ _id: kurirId }, { kurirId: kurirId }, { namaLengkap: kurirId }] 
    });

    if (dataUser) {
      if (dataUser._id) kriteriaPencarian.push({ kurirId: dataUser._id });
      if (dataUser.kurirId) kriteriaPencarian.push({ kurirId: dataUser.kurirId });
      if (dataUser.namaLengkap) kriteriaPencarian.push({ kurirId: dataUser.namaLengkap });
    }

    if (mongoose.Types.ObjectId.isValid(kurirId)) {
      kriteriaPencarian.push({ kurirId: new mongoose.Types.ObjectId(kurirId) });
    }

    const kueriFinal = { $or: kriteriaPencarian };

    const totalPengantaran = await Pesanan.countDocuments(kueriFinal);
    const selesai = await Pesanan.countDocuments({ status: { $regex: /^selesai$/i }, ...kueriFinal });
    const dalamProses = await Pesanan.countDocuments({ 
      status: { $in: ['Proses', 'Ambil Barang', 'Dalam Perjalanan', 'Sampai Tujuan'] }, 
      ...kueriFinal 
    });

    const totalKomisiPersen = selesai * 2;

    const pesananBerating = await Pesanan.find({ 
      rating: { $gt: 0 },
      ...kueriFinal
    });
    
    let rataRataRating = "-"; 
    
    if (pesananBerating.length > 0) {
      const totalBintang = pesananBerating.reduce((sum, item) => sum + item.rating, 0);
      rataRataRating = (totalBintang / pesananBerating.length).toFixed(1);
    }

    res.json({
      totalPengantaran,
      selesai,
      dalamProses,
      rating: rataRataRating,
      komisiSistem: totalKomisiPersen
    });

  } catch (err) {
    console.error("Error pada rute summary performa kurir:", err.message);
    res.status(500).json({ msg: "Server Error pada sistem kalkulasi rating." });
  }
});

module.exports = router;
