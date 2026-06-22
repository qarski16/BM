const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 1. Cek apakah ada variabel MONGO_URI_PROD (untuk Vercel/Production)
    // 2. Jika tidak ada, otomatis pakai fallback ke MongoDB Compass Lokal
    const dbURI = process.env.MONGO_URI_PROD || "mongodb://127.0.0.1:27017/bm_kurir_lokal";

    if (process.env.MONGO_URI_PROD) {
      console.log("[Database] Menyambungkan ke MongoDB Atlas (Production)...");
    } else {
      console.log("[Database] Menyambungkan ke MongoDB Lokal (Compass)...");
    }

    const conn = await mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 5000 // Berikan waktu tunggu 5 detik agar koneksi Atlas tidak terlalu ketat
    });

    console.log(`==================================================`);
    console.log(`DATABASE SUKSES TERHUBUNG: ${conn.connection.host}`);
    console.log(`==================================================`);
  } catch (error) {
    console.error(`GAGAL KONEKSI DATABASE: ${error.message}`);
    // Jangan langsung mematikan proses di Vercel agar log error terlihat jelas
    if (!process.env.MONGO_URI_PROD) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;