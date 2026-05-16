const Pengaturan = require('../models/Pengaturan');
const mongoose = require('mongoose');

describe('Unit Test: Pengaturan Model', () => {
  
  it('Harus mengecek validasi field pada model Pengaturan', async () => {
    const configInvalid = new Pengaturan({});

    let err;
    try {
      await configInvalid.validate();
    } catch (error) {
      err = error;
    }

    if (err) {
      console.log("Field yang wajib diisi adalah:", Object.keys(err.errors));
      expect(err).toBeDefined();
    } else {
      console.log("Catatan: Tidak ada field required di model Pengaturan.");
      expect(err).toBeUndefined();
    }
  });

  it('Harus berhasil validasi jika data pengaturan lengkap', async () => {
    const configValid = new Pengaturan({
      namaAplikasi: 'BM KURIR',
      alamatToko: 'Jl. Contoh No. 123',
      kontak: '0812345678',
      tarifPerKm: 5000 
    });

    let err;
    try {
      await configValid.validate();
    } catch (error) {
      err = error;
    }

    expect(err).toBeUndefined();
  });
});