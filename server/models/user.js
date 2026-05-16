const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  namaLengkap: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Kurir', 'User'], // Membatasi pilihan role
    default: 'Kurir' // Berdasarkan desain Anda, pendaftar baru biasanya kurir
  },
  
  // --- TAMBAHAN UNTUK FITUR KURIR ---
  
  status: {
    type: String,
    enum: ['Online', 'Offline', 'Mengantar'],
    default: 'Offline' // Status default saat pertama kali daftar
  },
  lokasiTerakhir: {
    type: String,
    default: 'Parepare' // Bisa diupdate koordinat atau nama daerah
  },
  tugasAktif: {
    type: Number,
    default: 0 // Jumlah pesanan yang sedang dibawa kurir
  },
  komisi: {
    type: Number,
    default: 0 // Untuk bar progress "Komisi Sistem" di desain Anda
  },
  
  // ----------------------------------

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);