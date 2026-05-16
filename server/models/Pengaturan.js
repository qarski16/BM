const mongoose = require('mongoose');

const PengaturanSchema = new mongoose.Schema({
  namaAplikasi: { 
    type: String, 
    required: true, 
    default: 'BM Kurir' 
  },
  zonaWaktu: { 
    type: String, 
    default: 'Wita' 
  },
  komisiSistem: { 
    type: Number, 
    default: 2 
  }
});

module.exports = mongoose.model('Pengaturan', PengaturanSchema);