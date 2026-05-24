const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("[Database] Menyambungkan ke MongoDB Lokal (Compass)...");

    // Menggunakan IP lokal 127.0.0.1 dengan target nama database: bm_kurir_lokal
    const URI_LOKAL = "mongodb://127.0.0.1:27017/bm_kurir_lokal"; 

    const conn = await mongoose.connect(URI_LOKAL, {
      serverSelectionTimeoutMS: 3000 // Batasi waktu tunggu maksimal 3 detik
    });

    console.log(`==================================================`);
    console.log(`DATABASE LOKAL SUKSES TERHUBUNG: ${conn.connection.host}`);
    console.log(`==================================================`);
  } catch (error) {
    console.error(`GAGAL KONEKSI DATABASE LOKAL: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;