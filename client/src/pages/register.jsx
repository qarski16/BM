import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero-kurir.png'; 

const Register = () => {
  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const { namaLengkap, email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("Registrasi Berhasil!");
      navigate('/login'); 
    } catch (err) {
      alert(err.response?.data?.msg || "Terjadi kesalahan");
    }
  };

  return (
    // Container utama harus 100vw dan 100vh tanpa margin/padding
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, padding: 0, overflow: 'hidden' }}>
      
      {/* SISI KIRI - GAMBAR FULL */}
      <div style={{ 
        flex: 1.2, 
        position: 'relative', 
        height: '100%', 
        backgroundColor: '#2563eb' // Biru dasar
      }}>
        <img 
          src={heroImg} 
          alt="Hero" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', // Membuat gambar memenuhi seluruh area kiri tanpa spasi putih
            objectPosition: 'top', // Memastikan bagian atas (teks BM KURIR) menjadi prioritas
            display: 'block'
          }} 
        />
      </div>

      {/* SISI KANAN - FORM */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#ffffff' 
      }}>
        <div style={{ width: '100%', maxWidth: '380px', padding: '20px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', color: '#333' }}>
            Registrasi Akun
          </h2>
          
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={inputGroup}>
              <label style={labelStyle}>Nama Lengkap</label>
              <input name="namaLengkap" placeholder="Masukkan Nama Lengkap" value={namaLengkap} onChange={onChange} style={inputStyle} required />
            </div>
            
            <div style={inputGroup}>
              <label style={labelStyle}>Email</label>
              <input name="email" type="email" placeholder="Masukkan Email" value={email} onChange={onChange} style={inputStyle} required />
            </div>
            
            <div style={inputGroup}>
              <label style={labelStyle}>Password</label>
              <input name="password" type="password" placeholder="Buat Password" value={password} onChange={onChange} style={inputStyle} required />
            </div>

            <button type="submit" style={buttonStyle}>Register</button>
          </form>

          <div style={{ margin: '20px 0', textAlign: 'center', color: '#ccc', fontSize: '14px' }}>or</div>

          <button style={googleButtonStyle}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', marginRight: '10px' }} />
            Continue with Google
          </button>

          <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
            Sudah Punya Akun? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Styling Object untuk implementasi materi React (JSX & State) [cite: 19, 20]
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#666' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', width: '100%', boxSizing: 'border-box' };
const buttonStyle = { padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px' };
const googleButtonStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#444', fontWeight: '600', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default Register;