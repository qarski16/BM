const express = require('express');
const router = express.Router();

// --- 📥 IMPORT CONTROLLER & MIDDLEWARE ---
const authController = require('../controllers/authController');

// --- 🌐 DEFINISI RUTE API AUTHENTICATION ---

/**
 * @route   POST /api/auth/register
 * @desc    Mendaftarkan pengguna baru (Kurir otomatis dapat ID BM001, Admin dapat ADM001)
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Proses masuk log akun dan membuat token JWT bagi Admin / Kurir
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/semua-kurir
 * @desc    TAMBAHAN: Ambil semua user dengan role kurir untuk Dashboard Admin
 * @access  Public
 */
// Kita arahkan ke authController.getSemuaKurir yang akan kita buat di bawah
router.get('/semua-kurir', authController.getSemuaKurir);

/**
 * @route   GET /api/auth/kurir/:id
 * @desc    Mengambil data profil lengkap milik satu kurir spesifik berdasarkan ID
 * @access  Public 
 */
router.get('/kurir/:id', authController.getProfilKurir);

/**
 * @route   PUT /api/auth/kurir/update-status/:id
 * @desc    Mengubah status operasional kurir secara realtime (Online / Offline)
 * @access  Public 
 */
router.put('/kurir/update-status/:id', authController.updateStatus);

// --- 📤 EXPORT ROUTER ---
module.exports = router;