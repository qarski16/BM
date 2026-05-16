const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Registrasi User Baru
router.post('/register', async (req, res) => {
  const { namaLengkap, email, password, role } = req.body; // Tambahkan role jika ingin set saat daftar

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Email sudah terdaftar' });
    }

    user = new User({
      namaLengkap,
      email,
      password,
      role: role || 'Kurir' // Default role jika tidak ditentukan
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.json({ msg: 'Registrasi berhasil!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Login User & Dapatkan Token
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
        role: user.role
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
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- FITUR BARU UNTUK MANAJEMEN KURIR ---

// @route   GET /api/auth/semua-kurir
// @desc    Ambil semua user dengan role Kurir untuk Admin
router.get('/semua-kurir', async (req, res) => {
  try {
    // Mencari user yang hanya memiliki role 'Kurir'
    // .select('-password') agar data password tidak ikut terkirim (keamanan)
    const kurirs = await User.find({ role: 'Kurir' }).select('-password');
    res.json(kurirs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error saat mengambil data kurir');
  }
});

module.exports = router;