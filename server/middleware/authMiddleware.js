const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi apakah Token JWT valid atau tidak
module.exports = function (req, res, next) {
  // 1. Ambil token dari header HTTP request (Format standar: Bearer <token>)
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'Token tidak ditemukan, akses ditolak!' });
  }

  try {
    // 2. Jika token dikirim dengan kata 'Bearer ', kita potong untuk mengambil string tokennya saja
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    // 3. Verifikasi token menggunakan kunci rahasia JWT yang sama dengan saat login
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia_kurir_123');

    // 4. Menyimpan data user yang ter-decode (id & role) ke objek req agar bisa dibaca rute selanjutnya
    req.user = decoded.user;
    
    next(); // Lolos pemeriksaan, lanjut ke rute utama!
  } catch (err) {
    res.status(401).json({ msg: 'Token tidak valid atau telah kedaluwarsa!' });
  }
};