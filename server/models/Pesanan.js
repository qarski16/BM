const mongoose = require('mongoose');

const PesananSchema = new mongoose.Schema({
  namaLengkap: { 
    type: String, 
    required: true 
  },
  noTelpon: { 
    type: String, 
    required: true 
  },
  alamat: { 
    type: String, 
    required: true 
  },
  detailPesanan: { 
    type: String, 
    required: true 
  },
  // =========================================================================
  // ⭐ PERBAIKAN 1: FLUID STATUS UNTUK STEPPER TOMBOL KURIR
  // =========================================================================
  status: { 
    type: String, 
    enum: ['Pending', 'Proses', 'Ambil Barang', 'Dalam Perjalanan', 'Sampai Tujuan', 'Selesai'], 
    default: 'Pending' 
  },
  // =========================================================================
  // ⭐ PERBAIKAN 2: FIELD KURIR ID (Mendukung "BM001" / ObjectId)
  // =========================================================================
  kurirId: {
    type: String,
    default: null
  },
  // =========================================================================
  // ⭐ PERBAIKAN 3: MENAMBAHKAN FIELD RATING SISTEM UNTUK KURIR
  // =========================================================================
  // Menyimpan rating angka (1-5) dari pemesan setelah status 'Selesai'
  rating: {
    type: Number,
    default: 0
  },
  // Menyimpan ulasan teks/feedback opsional dari pemesan mengenai kurir
  catatanRating: {
    type: String,
    default: ""
  }
}, {
  // =========================================================================
  // 🕒 TIMESTAMPS BAWAAN MONGOOSE (Otomatis membuat 'createdAt' & 'updatedAt')
  // =========================================================================
  timestamps: true 
});

module.exports = mongoose.models.Pesanan || mongoose.model('Pesanan', PesananSchema);