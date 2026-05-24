import React, { useState } from 'react';
import axios from 'axios';
import heroImg from '../assets/hero-kurir.png'; 

const FormPesanan = () => {
  // Mengembalikan key ke 'noTelpon' agar sinkron dengan validasi skema database backend Anda
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
      // Mengirim POST request dengan payload yang sudah sesuai ekspektasi backend
      const res = await axios.post('http://localhost:5000/api/pesanan/tambah', formData);
      
      if (res.status === 200 || res.status === 201) {
        alert('Pesanan Berhasil Dikirim! Data Anda sudah masuk ke sistem antrean admin BM Kurir.');
        setFormData({ namaLengkap: '', noTelpon: '', alamat: '', detailPesanan: '' });
      }
    } catch (err) {
      console.error("Error submit pesanan:", err);
      alert('Gagal mengirim pesanan. Pastikan server backend Anda sudah berjalan di port 5000.');
    }
  };

  return (
    <div style={containerStyle}>
      {/* SISI KIRI - HERO IMAGE */}
      <div style={heroSide}>
        <img 
          src={heroImg} 
          alt="Hero BM Kurir" 
          style={imageStyle} 
        />
      </div>

      {/* SISI KANAN - FORM INPUT */}
      <div style={formSide}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1e293b', fontSize: '26px' }}>Form Pesanan</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Isi formulir di bawah untuk memanggil kurir logistik ke lokasi Anda.</p>
          </div>
          
          <form onSubmit={onSubmit} style={formGrid}>
            <div style={inputGroup}>
              <label style={labelStyle}>Nama Lengkap</label>
              <input 
                type="text"
                name="namaLengkap" 
                placeholder="Masukkan Nama Lengkap Anda" 
                value={namaLengkap} 
                onChange={onChange} 
                style={inputStyle} 
                required 
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>No. Telpon / WhatsApp</label>
              <input 
                type="tel"
                name="noTelpon" // Menggunakan 'noTelpon' kembali agar API backend tidak melempar error
                placeholder="Contoh: 081234567xxx" 
                value={noTelpon} 
                onChange={onChange} 
                style={inputStyle} 
                required 
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Alamat Penjemputan / Tujuan</label>
              <textarea 
                name="alamat" 
                placeholder="Tuliskan alamat lengkap beserta patokan lokasi..." 
                value={alamat} 
                onChange={onChange} 
                style={{...inputStyle, height: '90px', resize: 'none'}} 
                required 
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Detail Isi Paket</label>
              <input 
                type="text"
                name="detailPesanan" 
                placeholder="Contoh: Makanan, Dokumen, Pakaian, dll" 
                value={detailPesanan} 
                onChange={onChange} 
                style={inputStyle} 
                required 
              />
            </div>

            <button type="submit" style={buttonStyle}>
              <i className="fas fa-paper-plane" style={{ marginRight: '8px' }}></i> Pesan Sekarang
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const containerStyle = { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: '"Inter", sans-serif' };
const heroSide = { flex: 1.2, backgroundColor: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' };
const formSide = { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', backgroundColor: '#f8fafc' };
const formGrid = { display: 'flex', flexDirection: 'column', gap: '18px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle = { fontSize: '13px', color: '#475569', fontWeight: '600' };
const inputStyle = { padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', backgroundColor: 'white', color: '#1e293b', outline: 'none', fontSize: '14px', transition: 'all 0.2s ease', boxSizing: 'border-box' };
const buttonStyle = { padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.25)', display: 'flex', justifyContent: 'center', alignItems: 'center' };

export default FormPesanan;