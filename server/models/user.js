const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // 🛠️ DEFINISI: _id sebagai String kustom untuk menerima teks murni "BM001"
  _id: {
    type: String,
    required: true
  },
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
    enum: ['admin', 'kurir'],
    default: 'kurir'
  },
  // Properti operasional kurir realtime
  statusOnline: {
    type: String,
    enum: ['Online', 'Offline', 'Mengantar'],
    default: 'Offline' // ✅ Sinkron dengan aturan Enum
  },
  tanggalDibuat: {
    type: Date,
    default: Date.now
  }
}, { 
  _id: false // 🚫 Beritahu Mongoose untuk tidak membuat Auto-ObjectId bawaan pada schema ini
});

// 🛠️ PERBAIKAN UTAMA: Cegah OverwriteModelError saat server di-restart / auto-reload
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;