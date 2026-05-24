const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  // Bagian Komisi
  komisiSistem: { type: Number, default: 2 },
  
  // Bagian Kurir
  maxOrderPerKurir: { type: Number, default: 5 },
  
  // Bagian Sistem
  namaAplikasi: { type: String, default: "BM Kurir" },
  zonaWaktu: { type: String, default: "Wita" },
  bahasaSistem: { type: String, default: "Indonesia" },

  // Bagian Keamanan
  verifikasiLogin: { type: Boolean, default: false },
  metodeVerifikasi: { type: String, default: "Kirim kode ke email" },
  batasPercobaanLogin: { type: Number, default: 5 },
  waktuBlokir: { type: Number, default: 10 }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);