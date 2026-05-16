const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Pastikan path model benar
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Cek apakah admin sudah ada
    const adminExists = await User.findOne({ email: 'admin@bmkurir.com' });
    if (adminExists) {
      console.log('Admin sudah terdaftar');
      process.exit();
    }

    // Hash password manual untuk Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      namaLengkap: 'Super Admin BM Kurir',
      email: 'admin@bmkurir.com',
      password: hashedPassword,
      role: 'Admin'
    });

    await admin.save();
    console.log('Superuser Admin Berhasil Dibuat!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();