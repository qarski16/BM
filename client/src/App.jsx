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
import DashboardKurir from './pages/DashboardKurir'; 
import './index.css';

// --- SATPAM PROTEKSI ROUTE (KHUSUS ADMIN) ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Mengubah ke huruf kecil agar kebal terhadap perbedaan penulisan kapital di database
  if (!token || !role || role.toLowerCase().trim() !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// --- SATPAM PROTEKSI ROUTE (KHUSUS KURIR) ---
const KurirProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || !role || role.toLowerCase().trim() !== 'kurir') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- ROUTES PUBLIK --- */}
        <Route path="/" element={<FormPesanan />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- ROUTE KHUSUS KURIR (DILINDUNGI) --- */}
        <Route 
          path="/kurir/dashboard" 
          element={
            <KurirProtectedRoute>
              <DashboardKurir />
            </KurirProtectedRoute>
          } 
        />

        {/* --- ADMIN ROUTES (DILINDUNGI) --- */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardAdmin />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/pesanan-masuk" 
          element={
            <ProtectedRoute>
              <PesananMasuk />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/kurir"
          element={
            <ProtectedRoute>
              <ManajemenKurir />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/laporan"
          element={
            <ProtectedRoute>
              <Laporan />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/pengaturan"
          element={
            <ProtectedRoute>
              <Pengaturan />
            </ProtectedRoute>
          } 
        />

        {/* Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;