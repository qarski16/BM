import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardAdmin from './pages/DashboardAdmin';
import FormPesanan from './pages/FormPesanan';
import PesananMasuk from './pages/PesananMasuk'; 
import ManajemenKurir from './pages/ManajemenKurir'; 
import Laporan from './pages/Laporan';
import Pengaturan from './pages/Pengaturan';  
import './index.css';

// --- KOMPONEN PROTEKSI ROUTE ---
// Memastikan hanya Admin yang sudah login (punya token) yang bisa masuk
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'Admin') {
    // Jika tidak ada token atau bukan Admin, lempar ke halaman login
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- ROUTES PUBLIK --- */}
        {/* Halaman Utama: Form untuk user memesan */}
        <Route path="/" element={<FormPesanan />} />
        
        {/* Halaman Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- ADMIN ROUTES (DILINDUNGI) --- */}
        
        {/* 1. Dashboard Utama */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardAdmin />
            </ProtectedRoute>
          } 
        />

        {/* 2. Halaman Pesanan Masuk */}
        <Route 
          path="/pesanan-masuk" 
          element={
            <ProtectedRoute>
              <PesananMasuk />
            </ProtectedRoute>
          } 
        />

        {/* 3. Halaman Manajemen Kurir */}
        <Route
          path="/kurir"
          element={
            <ProtectedRoute>
              <ManajemenKurir />
            </ProtectedRoute>
          } 
        />

        {/* 4. Halaman Laporan (PERBAIKAN: Path huruf kecil & Komponen Laporan) */}
        <Route
          path="/laporan"
          element={
            <ProtectedRoute>
              <Laporan />
            </ProtectedRoute>
          } 
        />

        {/* 4. Halaman Pengaturan (PERBAIKAN: Path huruf kecil & Komponen Laporan) */}
        <Route
          path="/pengaturan"
          element={
            <ProtectedRoute>
              <Pengaturan />
            </ProtectedRoute>
          } 
        />
        {/* ---------------------------------- */}

        {/* Redirect jika URL tidak ditemukan (Salah ketik URL) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;