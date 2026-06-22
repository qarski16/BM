const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // 🛠️ DEFINISI: _id menggunakan String kustom agar mendukung format seperti "BM001"
  _id: {
    type: String,
    required: true
  },
  namaLengkap: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  // 🔓 PERBAIKAN REGISTRASI: 'required' dilepas (false) agar pengguna yang mendaftar 
  // menggunakan Google Auth / OAuth tidak diblokir atau gagal simpan oleh Mongoose.
  password: {
    type: String,
    required: false 
  },
  role: {
    type: String,
    enum: ['admin', 'kurir'],
    default: 'kurir'
  },
  // Properti operasional kurir realtime (Case-Sensitive ketat)
  statusOnline: {
    type: String,
    enum: ['Online', 'Offline', 'Mengantar'],
    default: 'Offline',
    
    // 🛠️ FUNGSI SAKTI: Otomatis mengubah teks sebelum disimpan ke database
    set: function(nilaiBaru) {
      if (!nilaiBaru) return nilaiBaru;
      // Mengubah huruf pertama menjadi Kapital, sisanya huruf kecil
      // Contoh: "online" -> "Online", "OFFLINE" -> "Offline"
      return nilaiBaru.charAt(0).toUpperCase() + nilaiBaru.slice(1).toLowerCase();
    }
  },
  tanggalDibuat: {
    type: Date,
    default: Date.now
  }
}, { 
  _id: false, // 🚫 Matikan auto-generation ObjectId bawaan MongoDB karena kita pakai String kustom
  versionKey: false // Menghilangkan field __v bawaan MongoDB agar database lebih bersih
});

// 🛠️ PERBAIKAN CEGAH OVERWRITE: Memastikan model tidak bentrok saat server auto-reload/restart
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;