import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar'; // Memanggil komponen sidebar seragam

const PesananMasuk = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    kurirTersedia: 0,
    ditolak: 0 
  });

  const fetchData = async () => {
    try {
      const resStats = await axios.get('http://localhost:5000/api/pesanan/summary');
      const resOrders = await axios.get('http://localhost:5000/api/pesanan/semua');
      
      setOrders(resOrders.data);
      setStats({
        total: resStats.data.pesananMasuk + resStats.data.dalamProses + resStats.data.pesananSelesai,
        kurirTersedia: resStats.data.kurirAktif,
        ditolak: resStats.data.pesananDitolak || 0 
      });
    } catch (err) {
      console.error("Gagal mengambil data database:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={containerStyle}>
      {/* 1. PEMANGGILAN SIDEBAR PUSAT */}
      <Sidebar />

      {/* 2. KONTEN UTAMA - Dengan marginLeft agar tidak tertutup sidebar */}
      <main style={mainContentStyle}>
        <h2 style={{ color: 'white', marginBottom: '30px', fontWeight: 'bold' }}>Pesanan Masuk</h2>

        {/* 3 KOTAK STATISTIK */}
        <div style={statsRow}>
          <div style={miniCard}>
            <p style={cardLabel}>Total Pesanan</p>
            <h3 style={cardValue}>{stats.total}</h3>
          </div>
          <div style={miniCard}>
            <p style={cardLabel}>Kurir Tersedia</p>
            <h3 style={cardValue}>{stats.kurirTersedia}</h3>
          </div>
          <div style={miniCard}>
            <p style={cardLabel}>Di Tolak Hari Ini</p>
            <h3 style={cardValue}>{stats.ditolak}</h3>
          </div>
        </div>

        {/* TABEL DATA */}
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRow}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Nama</th>
                <th style={thStyle}>Alamat</th>
                <th style={thStyle}>Waktu</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <tr key={order._id || index} style={bodyRow}>
                    <td style={tdStyle}>{String(index + 1).padStart(2, '0')}</td>
                    <td style={tdStyle}>{order.namaLengkap}</td>
                    <td style={tdStyle}>{order.alamat}</td>
                    <td style={tdStyle}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td style={tdStyle}>
                      <span style={statusBadge}>{order.status || 'Pending'}</span>
                    </td>
                    <td style={tdStyle}>
                      <select style={actionSelect}>
                        <option>Detail</option>
                        <option>Hapus</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>Belum ada data pesanan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

// --- STYLES (Hanya Fokus pada Konten) ---
const containerStyle = { display: 'flex', backgroundColor: '#111827', minHeight: '100vh' };
const mainContentStyle = { flex: 1, padding: '30px', marginLeft: '250px', color: 'white' };

const statsRow = { display: 'flex', gap: '20px', marginBottom: '30px' };
const miniCard = { backgroundColor: '#1f2937', padding: '20px', borderRadius: '12px', flex: 1, border: '1px solid #374151' };
const cardLabel = { color: '#9ca3af', fontSize: '14px', margin: '0 0 10px 0' };
const cardValue = { color: 'white', fontSize: '24px', margin: 0, fontWeight: 'bold' };

const tableWrapper = { backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151', overflow: 'hidden' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const headerRow = { backgroundColor: '#374151' };
const thStyle = { padding: '15px', fontSize: '14px', color: '#9ca3af', fontWeight: '500' };
const bodyRow = { borderBottom: '1px solid #374151' };
const tdStyle = { padding: '15px', fontSize: '14px' };

const statusBadge = { backgroundColor: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' };
const actionSelect = { backgroundColor: '#111827', color: 'white', border: '1px solid #374151', padding: '5px 10px', borderRadius: '6px', outline: 'none' };

export default PesananMasuk;