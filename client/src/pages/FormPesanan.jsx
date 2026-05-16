import React, { useState } from 'react';
import axios from 'axios';
import heroImg from '../assets/hero-kurir.png'; 

const FormPesanan = () => {
  const [formData, setFormData] = useState({
    namaLengkap: '',
    noTelpon: '',
    alamat: '',
    detailPesanan: ''
  });

  const { namaLengkap, noTelpon, alamat, detailPesanan } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // Pastikan backend server Anda sudah berjalan di port 5000
      await axios.post('http://localhost:5000/api/pesanan/tambah', formData);
      alert('Pesanan Berhasil Dikirim! Kurir kami akan segera menghubungi Anda.');
      setFormData({ namaLengkap: '', noTelpon: '', alamat: '', detailPesanan: '' });
    } catch (err) {
      // Jika muncul alert ini, periksa apakah server backend sudah running
      alert('Gagal mengirim pesanan. Periksa koneksi ke server.');
    }
  };

  return (
    <div style={containerStyle}>
      {/* SISI KIRI - HERO IMAGE (Perbaikan Gambar Terpotong) */}
      <div style={heroSide}>
        <img 
          src={heroImg} 
          alt="Hero BM Kurir" 
          style={imageStyle} 
        />
      </div>

      {/* SISI KANAN - FORM */}
      <div style={formSide}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '30px', fontWeight: 'bold', color: '#333', fontSize: '24px' }}>Form Pesanan</h2>
          
          <form onSubmit={onSubmit} style={formGrid}>
            <div style={inputGroup}>
              <label style={labelStyle}>Nama Lengkap</label>
              <input 
                name="namaLengkap" 
                placeholder="Masukkan Nama Lengkap" 
                value={namaLengkap} 
                onChange={onChange} 
                style={inputStyle} 
                required 
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>No Telpon</label>
              <input 
                name="noTelpon" 
                placeholder="Masukkan No Telpon" 
                value={noTelpon} 
                onChange={onChange} 
                style={inputStyle} 
                required 
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Alamat</label>
              <textarea 
                name="alamat" 
                placeholder="Alamat Lengkap" 
                value={alamat} 
                onChange={onChange} 
                style={{...inputStyle, height: '100px', resize: 'none'}} 
                required 
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Pesanan</label>
              <input 
                name="detailPesanan" 
                placeholder="Detail Pesanan" 
                value={detailPesanan} 
                onChange={onChange} 
                style={inputStyle} 
                required 
              />
            </div>

            <button type="submit" style={buttonStyle}>Pesan Sekarang</button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const containerStyle = { 
  display: 'flex', 
  height: '100vh', 
  width: '100vw', 
  overflow: 'hidden',
  fontFamily: '"Inter", sans-serif'
};

const heroSide = { 
  flex: 1.2, 
  backgroundColor: '#1e3a8a', // Biru gelap agar menyatu dengan bagian atas gambar
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const imageStyle = { 
  width: '100%', 
  height: '100%', 
  objectFit: 'contain', // Menghindari gambar terpotong di bagian atas (logo)
  objectPosition: 'center'
};

const formSide = { 
  flex: 1, 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  padding: '40px',
  backgroundColor: 'white'
};

const formGrid = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '15px' 
};

const inputGroup = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '8px' 
};

const labelStyle = { 
  fontSize: '14px', 
  color: '#4b5563', 
  fontWeight: '600' 
};

const inputStyle = { 
  padding: '12px 15px', 
  borderRadius: '8px', 
  border: '1.5px solid #e5e7eb', 
  outline: 'none',
  fontSize: '15px',
  transition: 'border-color 0.2s'
};

const buttonStyle = { 
  padding: '15px', 
  borderRadius: '10px', 
  border: 'none', 
  backgroundColor: '#2563eb', 
  color: 'white', 
  fontWeight: 'bold', 
  fontSize: '16px',
  cursor: 'pointer', 
  marginTop: '20px',
  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
};

export default FormPesanan;