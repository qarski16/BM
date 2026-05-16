const Pesanan = require('../models/pesanan');
const mongoose = require('mongoose');

describe('Unit Test: Pesanan Model', () => {
  
  it('Harus error jika field wajib (alamat, namaLengkap) tidak diisi', async () => {
    const pesananInvalid = new Pesanan({
      detailPesanan: 'Paket Skincare',
      noTelpon: '08123456789'
    });

    let err;
    try {
      await pesananInvalid.validate();
    } catch (error) {
      err = error;
    }

    expect(err.errors.alamat).toBeDefined();
    expect(err.errors.namaLengkap).toBeDefined();
  });

  it('Harus memiliki status default "Pending" saat pesanan baru dibuat', async () => {
    const pesananBaru = new Pesanan({
      detailPesanan: 'Buku Catatan',
      alamat: 'Jl. Ahmad Yani No. 1',
      noTelpon: '0811223344',
      namaLengkap: 'Rizky'
    });

    expect(pesananBaru.status).toBe('Pending');
  });

  it('Harus berhasil validasi jika semua data pesanan lengkap sesuai skema', async () => {
    const pesananLengkap = new Pesanan({
      detailPesanan: 'Kamera Mirrorless',
      alamat: 'Perumahan Indah Blok A5',
      noTelpon: '0855667788',
      namaLengkap: 'Santi Putrie',
      status: 'Pending'
    });

    let err;
    try {
      await pesananLengkap.validate();
    } catch (error) {
      err = error;
    }

    expect(err).toBeUndefined();
  });
});