const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// DAFTAR GMAIL SPESIFIK YANG DIIZINKAN MENJADI ADMIN UTAMA
const GMAIL_ADMIN = ['admin@bmkurir.com']; 

// @route   POST /api/auth/register
// @desc    Registrasi User Baru (Kurir mendaftar mandiri)
router.post('/register', async (req, res) => {
  const { namaLengkap, email, password } = req.body; 

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Email sudah terdaftar' });
    }

    // Cek otomatis role berdasarkan domain email
    const roleOtomatis = GMAIL_ADMIN.includes(email.toLowerCase()) ? 'admin' : 'kurir';

    user = new User({
      namaLengkap,
      email,
      password,
      role: roleOtomatis
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.json({ msg: `Registrasi berhasil sebagai ${roleOtomatis}!` });
  } catch (err) {
    console.error("Error Registrasi:", err.message);
    res.status(500).send('Server Error saat melakukan registrasi');
  }
});

// @route   POST /api/auth/login
// @desc    Login User & Dapatkan Token JWT
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Email atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Email atau password salah' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role.toLowerCase() 
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'rahasia_kurir_123', 
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          msg: 'Login berhasil!',
          token,
          user: {
            id: user.id,
            namaLengkap: user.namaLengkap,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error("Error Login:", err.message);
    res.status(500).send('Server Error saat login');
  }
});

// @route   GET /api/auth/semua-kurir
// @desc    Ambil semua user dengan role kurir untuk Dashboard Admin
router.get('/semua-kurir', async (req, res) => {
  try {
    const kurirs = await User.find({ role: 'kurir' }).select('-password');
    res.json(kurirs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error saat mengambil data kurir');
  }
});

// @route   PUT /api/auth/kurir/update-status/:id
// @desc    Update status operasional kurir (Online / Offline / Mengantar) secara realtime
router.put('/kurir/update-status/:id', async (req, res) => {
  const { status } = req.body;

  // 1. Validasi string Enum resmi sesuai skema Mongoose
  if (!status || !['Online', 'Offline', 'Mengantar'].includes(status)) {
    return res.status(400).json({ msg: 'Status kerja tidak valid. Harus Online, Offline, atau Mengantar.' });
  }

  // 2. Proteksi ID: Mencegah crash jika frontend mengirim teks "login" atau "undefined" ke URL
  if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null' || req.params.id === 'login') {
    console.warn(`[Database Sync Blocked] Terdeteksi request status dengan parameter ID tidak valid: "${req.params.id}"`);
    return res.status(400).json({ msg: 'ID Kurir tidak valid atau kosong. Silakan logout dan login kembali.' });
  }

  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'Akun kurir tidak ditemukan di database' });
    }

    user.statusOnline = status;
    await user.save();

    console.log(`[Database Sync Success] Kurir ${user.namaLengkap} diubah ke: '${status}'`);
    res.json({ msg: 'Status berhasil disinkronkan ke database', status: user.statusOnline });
  } catch (err) {
    console.error(`[Database Sync Error Handled]: ${err.message}`);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Format ID Kurir salah atau tidak dikenali' });
    }
    res.status(500).send('Server Error saat memperbarui status operasional');
  }
});

module.exports = router;