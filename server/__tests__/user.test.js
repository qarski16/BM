const mongoose = require('mongoose');
const User = require('../models/user');

describe('Unit Test: User Model', () => {
  
  it('Harus error jika field wajib (email, namaLengkap) tidak diisi', async () => {
    const userInvalid = new User({ 
      username: 'budi123'
    });
    
    let err;
    try {
      await userInvalid.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err.errors.email).toBeDefined();
    expect(err.errors.namaLengkap).toBeDefined();
  });

  it('Harus berhasil validasi jika data lengkap dan role benar', async () => {
    const userValid = new User({
      username: 'kurir_oke',
      password: 'password123',
      email: 'kurir@mail.com',
      namaLengkap: 'Budi Santoso',
      role: 'Kurir' 
    });
    
    let err;
    try {
      await userValid.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeUndefined();
  });
});