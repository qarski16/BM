const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// @route   GET /api/setting
// @desc    Ambil konfigurasi global sistem
router.get('/', async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting({});
      await setting.save();
    }
    res.json(setting);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat mengambil pengaturan' });
  }
});

// @route   POST /api/setting
// @desc    Simpan atau perbarui konfigurasi global
router.post('/', async (req, res) => {
  const { namaAplikasi, alamatToko, kontak, tarifPerKm } = req.body;
  
  // ✅ PERBAIKAN: Validasi input sebelum proses
  if (!namaAplikasi) {
    return res.status(400).json({ message: 'Nama aplikasi wajib diisi' });
  }
  
  try {
    let setting = await Setting.findOne();
    
    if (setting) {
      setting = await Setting.findOneAndUpdate({}, req.body, { new: true });
    } else {
      setting = new Setting(req.body);
      await setting.save();
    }
    res.json({ msg: 'Pengaturan sistem berhasil disimpan!', data: setting });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat menyimpan pengaturan' });
  }
});

module.exports = router;
