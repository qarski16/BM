import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero-kurir.png'; 

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // Pastikan backend Anda mengirimkan data user beserta role-nya
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // 1. Simpan Token dan Role ke localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role); // Mengambil role dari response backend

      alert('Login Berhasil!');

      // 2. Logika Pengalihan (Redirect) berdasarkan Role
      if (res.data.user.role === 'Admin') {
        navigate('/dashboard'); // Arahkan ke Dashboard Admin
      } else {
        navigate('/kurir-home'); // Arahkan ke halaman Kurir (nanti dibuat)
      }
      
    } catch (err) {
      alert(err.response?.data?.msg || 'Login Gagal. Periksa Email/Password.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, padding: 0, overflow: 'hidden' }}>
      
      {/* SISI KIRI - GAMBAR FULL */}
      <div style={{ 
        flex: 1.2, 
        position: 'relative', 
        height: '100%', 
        backgroundColor: '#2563eb' 
      }}>
        <img 
          src={heroImg} 
          alt="Hero" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'top', 
            display: 'block'
          }} 
        />
      </div>

      {/* SISI KANAN - FORM LOGIN */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#ffffff' 
      }}>
        <div style={{ width: '100%', maxWidth: '380px', padding: '20px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
            Login Akun
          </h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>Selamat datang kembali di BM Kurir!</p>
          
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={inputGroup}>
              <label style={labelStyle}>Email</label>
              <input 
                name="email" 
                type="email" 
                placeholder="Masukkan Email Anda" 
                value={email} 
                onChange={onChange} 
                style={inputStyle} 
                required 
              />
            </div>
            
            <div style={inputGroup}>
              <label style={labelStyle}>Password</label>
              <input 
                name="password" 
                type="password" 
                placeholder="Masukkan Password" 
                value={password} 
                onChange={onChange} 
                style={inputStyle} 
                required 
              />
            </div>

            <button type="submit" style={buttonStyle}>Login</button>
          </form>

          <div style={{ margin: '20px 0', textAlign: 'center', color: '#ccc', fontSize: '14px' }}>or</div>

          <button style={googleButtonStyle}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', marginRight: '10px' }} />
            Continue with Google
          </button>

          <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
            Belum punya akun? <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Styles
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#666' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', width: '100%', boxSizing: 'border-box', outline: 'none' };
const buttonStyle = { padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px' };
const googleButtonStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#444', fontWeight: '600', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default Login;