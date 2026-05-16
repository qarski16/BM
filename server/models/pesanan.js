const mongoose = require('mongoose');

const PesananSchema = new mongoose.Schema({
  namaLengkap: { type: String, required: true },
  noTelpon: { type: String, required: true },
  alamat: { type: String, required: true },
  detailPesanan: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Proses', 'Selesai'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pesanan', PesananSchema);