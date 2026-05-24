const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// @route   GET /api/setting
// @desc    Ambil konfigurasi global sistem
router.get('/', async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      // Jika database kosong, buat dokumen default pertama kali
      setting = new Setting({});
      await setting.save();
    }
    res.json(setting);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error saat mengambil pengaturan');
  }
});

// @route   POST /api/setting
// @desc    Simpan atau perbarui konfigurasi global
router.post('/', async (req, res) => {
  try {
    let setting = await Setting.findOne();
    
    if (setting) {
      // Perbarui data yang sudah ada
      setting = await Setting.findOneAndUpdate({}, req.body, { new: true });
    } else {
      // Buat baru jika belum ada
      setting = new Setting(req.body);
      await setting.save();
    }
    res.json({ msg: 'Pengaturan sistem berhasil disimpan!', data: setting });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error saat menyimpan pengaturan');
  }
});

module.exports = router;