const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); 
const passport = require('passport'); 
const GoogleStrategy = require('passport-google-oauth20').Strategy; 

const User = require('../models/User');
const Pesanan = require('../models/Pesanan'); 

// DAFTAR GMAIL SPESIFIK YANG DIIZINKAN MENJADI ADMIN UTAMA
const GMAIL_ADMIN = ['admin@bmkurir.com']; 

// =========================================================================
// 🌐 STRATEGI GOOGLE OAUTH 2.0
// =========================================================================
passport.use(new GoogleStrategy({
    clientID: "994702628214-ot1pb27i271spmvidectvjgle7lqtmhs.apps.googleusercontent.com",
    clientSecret: "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", 
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      if (!profile.emails || profile.emails.length === 0) {
        return done(new Error("Akun Google Anda tidak menyediakan data email publik."), null);
      }

      const emailGoogle = profile.emails[0].value;
      const namaGoogle = profile.displayName;

      let user = await User.findOne({ email: emailGoogle.toLowerCase() });

      if (!user) {
        const roleOtomatis = GMAIL_ADMIN.includes(emailGoogle.toLowerCase()) ? 'admin' : 'kurir';

        const lastUser = await User.findOne({ _id: { $regex: /^BM/ } })
                                   .sort({ _id: -1 })
                                   .exec();

        let nextNumber = 1;

        if (lastUser && lastUser._id) {
          const lastNumber = parseInt(lastUser._id.replace('BM', ''), 10);
          if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
          }
        }

        const idKustomBaru = `BM${String(nextNumber).padStart(3, '0')}`;

        const randomPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        user = new User({
          _id: idKustomBaru,
          namaLengkap: namaGoogle,
          email: emailGoogle.toLowerCase(),
          password: hashedPassword,
          role: roleOtomatis,
          statusOnline: 'Offline'
        });

        await user.save();
        console.log(`[Google Auth] User baru sukses terdaftar otomatis: ${namaGoogle} (${idKustomBaru})`);
      }

      return done(null, user);
    } catch (err) {
      console.error("❌ Error di dalam Passport Google Strategy:", err.message);
      return done(err, null);
    }
  }
));

// =========================================================================
// 🌐 RUTE PENGALIKAN & CALLBACK GOOGLE AUTH
// =========================================================================
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  (req, res, next) => {
    const loginGagalURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    passport.authenticate('google', { 
      session: false, 
      failureRedirect: `${loginGagalURL}/login?error=google_failed` 
    })(req, res, next);
  },
  (req, res) => {
    const payload = {
      user: {
        id: req.user._id,
        role: req.user.role.toLowerCase()
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'rahasia_kurir_123',
      { expiresIn: '24h' },
      (err, token) => {
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        if (err) return res.redirect(`${frontendURL}/login?error=jwt_error`);
        
        res.redirect(`${frontendURL}/login?token=${token}&id=${req.user._id}&nama=${encodeURIComponent(req.user.namaLengkap)}&role=${req.user.role}`);
      }
    );
  }
);

// =========================================================================
// 1. POST: Registrasi User Baru (Manual)
// =========================================================================
router.post('/register', async (req, res) => {
  const { namaLengkap, email, password } = req.body; 

  try {
    if (!namaLengkap || !email || !password) {
      return res.status(400).json({ msg: 'Semua field wajib diisi' });
    }

    let userExist = await User.findOne({ email: email.toLowerCase() });
    if (userExist) {
      return res.status(400).json({ msg: 'Email sudah terdaftar' });
    }

    const roleOtomatis = GMAIL_ADMIN.includes(email.toLowerCase()) ? 'admin' : 'kurir';

    const lastUser = await User.findOne({ _id: { $regex: /^BM/ } })
                               .sort({ _id: -1 })
                               .exec();

    let nextNumber = 1;

    if (lastUser && lastUser._id) {
      const lastNumber = parseInt(lastUser._id.replace('BM', ''), 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const idKustomBaru = `BM${String(nextNumber).padStart(3, '0')}`;

    const user = new User({
      _id: idKustomBaru, 
      namaLengkap,
      email: email.toLowerCase(),
      password,
      role: roleOtomatis,
      statusOnline: 'Offline'
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user._id, 
        role: user.role.toLowerCase() 
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'rahasia_kurir_123', 
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          success: true,
          msg: `Registrasi berhasil sebagai ${roleOtomatis}!`,
          token,
          user: {
            id: user._id,
            namaLengkap: user.namaLengkap,
            email: user.email,
            role: user.role
          }
        });
      }
    );

  } catch (err) {
    console.log("\n================ ❌ DETAIL ERROR REGISTRASI ================");
    console.error("Pesan Error Asli :", err.message);
    console.log("============================================================\n");
    
    res.status(500).json({ 
      msg: `Gagal menyimpan ke database. Detail: ${err.message}`,
      error: err.message 
    });
  }
});

// =========================================================================
// 2. POST: Login User & Dapatkan Token JWT
// =========================================================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'Email atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Email atau password salah' });
    }

    const payload = {
      user: {
        id: user._id, 
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
            id: user._id,
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

// =========================================================================
// 3. READ: Ambil Semua Kurir + HITUNG KOMISI 2% OTOMATIS
// =========================================================================
router.get('/semua-kurir', async (req, res) => {
  try {
    const kurirs = await User.find({ role: 'kurir' }).select('-password').lean();

    const kurirDenganKomisi = await Promise.all(
      kurirs.map(async (kurir) => {
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

        const totalKomisi = jumlahSelesai * 2;

        return {
          ...kurir,
          komisiSistem: totalKomisi 
        };
      })
    );

    res.json(kurirDenganKomisi);
  } catch (err) {
    console.error("Error Hitung Komisi Kurir:", err.message);
    res.status(500).send('Server error saat mengambil data kurir dan kalkulasi komisi');
  }
});

// =========================================================================
// 4. READ: Ambil Data Profil Spesifik Kurir (Untuk Sinkronisasi Frontend)
// =========================================================================
router.get('/kurir/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Kurir tidak ditemukan' });
    }
    res.json(user);
  } catch (err) {
    console.error("Error Ambil Profil Kurir:", err.message);
    res.status(500).send('Server Error saat memuat profil kurir');
  }
});

// =========================================================================
// 5. UPDATE: Update status operasional kurir secara realtime (SINKRON FRONTEND)
// =========================================================================
router.put('/kurir/update-status/:id', async (req, res) => {
  // 💡 SINKRONISASI: Menerima 'statusOnline' dari frontend atau fallback ke 'status'
  const status = req.body.statusOnline || req.body.status;

  if (!status || !['Online', 'Offline', 'Mengantar'].includes(status)) {
    return res.status(400).json({ msg: 'Status kerja tidak valid. Harus Online, Offline, atau Mengantar.' });
  }

  if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null' || req.params.id === 'login') {
    console.warn(`[Database Sync Blocked] Terdeteksi request status dengan parameter ID tidak valid: "${req.params.id}"`);
    return res.status(400).json({ msg: 'ID Kurir tidak valid atau kosong. Silakan logout and login kembali.' });
  }

  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'Akun kurir tidak ditemukan di database' });
    }

    user.statusOnline = status;
    await user.save();

    console.log(`[Database Sync Success] Kurir ${user.namaLengkap} diubah ke: '${status}'`);
    res.json({ msg: 'Status berhasil disinkronkan ke database', statusOnline: user.statusOnline });
  } catch (err) {
    console.error(`[Database Sync Error Handled]: ${err.message}`);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Format ID Kurir salah atau tidak dikenali' });
    }
    res.status(500).send('Server Error saat memperbarui status operasional');
  }
});

module.exports = router;