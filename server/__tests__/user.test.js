const User = require('../models/user');
const mongoose = require('mongoose');

describe('Unit Test: User Model', () => {
  
  it('Harus error jika field wajib tidak diisi', async () => {
    const userInvalid = new User({
      namaLengkap: 'Andi'
    });

    let err;
    try {
      await userInvalid.validate();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
  });

  it('Harus memiliki role default "kurir" saat user baru dibuat', async () => {
    const userBaru = new User({
      namaLengkap: 'Rizky',
      email: 'rizky@gmail.com',
      password: 'password123'
    });

    // Menyesuaikan dengan ekspektasi default skema Anda (biasanya huruf kecil 'kurir')
    expect(userBaru.role.toLowerCase()).toBe('kurir');
  });

  it('Harus berhasil validasi jika data lengkap dan role benar', async () => {
    // [ARRANGE] Menyiapkan data tiruan utuh sesuai aturan required skema Anda
    const userValid = new User({
      _id: new mongoose.Types.ObjectId(), // Menyediakan ID manual jika skema mewajibkannya
      namaLengkap: 'Kurir Ganteng',
      email: 'kurir@gmail.com',
      password: 'password123',
      role: 'kurir' // Memastikan menggunakan huruf kecil agar lolos enum validator
    });

    let err;
    // [ACT] Menjalankan fungsi validasi internal Mongoose
    try {
      await userValid.validate(); // Di sini variabel harus bernama 'userValid' agar cocok!
    } catch (error) {
      err = error;
    }

    // [ASSERT] Memastikan tidak ada error yang dilemparkan oleh Mongoose
    expect(err).toBeUndefined();
  });
});