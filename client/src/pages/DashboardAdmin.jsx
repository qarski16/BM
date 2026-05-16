import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar'; // Memanggil komponen sidebar seragam

const DashboardAdmin = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    pesananMasuk: 0,
    dalamProses: 0,
    pesananSelesai: 0,
    kurirAktif: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);

  const fetchData = async () => {
    try {
      const resStats = await axios.get('http://localhost:5000/api/pesanan/summary');
      setStats(resStats.data);
      const resOrders = await axios.get('http://localhost:5000/api/pesanan/semua');
      setRecentOrders(resOrders.data);
    } catch (err) {
      console.error("Gagal sinkronisasi dengan database:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={containerStyle}>
      {/* 1. SEKARANG MENGGUNAKAN SIDEBAR PUSAT */}
      <Sidebar />

      {/* 2. MAIN CONTENT - Diberi marginLeft agar tidak tertutup sidebar */}
      <main style={mainContentStyle}>
        <header style={headerStyle}>
          <div style={searchBar}>
            <i className="fas fa-search" style={{ color: '#9ca3af' }}></i>
            <input type="text" placeholder="Cari data..." style={searchInput} />
          </div>
          <div style={adminProfile}>
            <i className="fas fa-bell" style={{ marginRight: '15px', color: '#9ca3af', cursor: 'pointer' }}></i>
            <span style={{ marginRight: '15px' }}>Admin Utama</span>
            <div style={avatar}></div>
          </div>
        </header>

        <h2 style={{ marginBottom: '25px', fontWeight: 'bold' }}>Dashboard Overview</h2>

        {/* AREA KOTAK STATISTIK */}
        <div style={statsGrid}>
          <StatCard title="Pesanan Masuk" value={stats.pesananMasuk} icon="fa-archive" color="#3b82f6" />
          <StatCard title="Dalam Proses" value={stats.dalamProses} icon="fa-sync" color="#fbbf24" />
          <StatCard title="Pesanan Selesai" value={stats.pesananSelesai} icon="fa-check-double" color="#10b981" />
          <StatCard title="Kurir Aktif" value={stats.kurirAktif} icon="fa-user-check" color="#8b5cf6" />
        </div>

        {/* AREA DATA GRID */}
        <div style={dataMainGrid}>
          
          {/* Box 1: Grafik */}
          <div style={cardLayout}>
            <p style={cardTitle}>Grafik Pesanan Mingguan</p>
            <div style={chartContainer}>
              {[30, 50, 40, 85, 60, 75, (stats.pesananMasuk * 5) + 10].map((h, i) => (
                <div key={i} style={{ ...barStyle, height: `${h > 100 ? 100 : h}%`, backgroundColor: i === 6 ? '#3b82f6' : '#374151' }}></div>
              ))}
            </div>
          </div>

          {/* Box 2: Aktivitas Terbaru */}
          <div style={cardLayout}>
            <p style={cardTitle}>Aktivitas Pesanan Terbaru</p>
            <div style={listContainer}>
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order) => (
                  <div key={order._id} style={activityItemStyle}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{order.namaLengkap}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{order.alamat?.substring(0, 30)}...</div>
                    </div>
                    <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 'bold' }}>BARU</span>
                  </div>
                ))
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '13px' }}>Belum ada data pesanan.</p>
              )}
            </div>
          </div>

          {/* Box 3: Status Pesanan (Visual) */}
          <div style={cardLayout}>
            <p style={cardTitle}>Status Pesanan</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
               <div style={mockPie}></div>
               <div style={{fontSize: '12px', color: '#9ca3af'}}>
                  <div><span style={{color: '#10b981'}}>●</span> Selesai</div>
                  <div><span style={{color: '#fbbf24'}}>●</span> Proses</div>
                  <div><span style={{color: '#3b82f6'}}>●</span> Pending</div>
               </div>
            </div>
          </div>

          {/* Box 4: Status Kurir */}
          <div style={cardLayout}>
            <p style={cardTitle}>Status Kurir</p>
            <div style={listContainer}>
              <div style={activityItemStyle}><span>Anton</span><span style={{color: '#10b981'}}>● Online</span></div>
              <div style={activityItemStyle}><span>Budi</span><span style={{color: '#fbbf24'}}>● Mengantar</span></div>
              <div style={activityItemStyle}><span>Rudi</span><span style={{color: '#ef4444'}}>● Offline</span></div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// --- SUB KOMPONEN ---
const StatCard = ({ title, value, icon, color }) => (
  <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '15px', border: '1px solid #374151' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{ padding: '10px', backgroundColor: '#374151', borderRadius: '10px' }}>
        <i className={`fas ${icon}`} style={{ fontSize: '20px', color: color }}></i>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{title}</p>
        <h3 style={{ margin: 0, fontSize: '24px', color: 'white' }}>{value}</h3>
      </div>
    </div>
  </div>
);

// --- STYLES (Fokus pada Konten Dashboard) ---
const containerStyle = { display: 'flex', backgroundColor: '#111827', minHeight: '100vh', color: 'white' };
const mainContentStyle = { flex: 1, padding: '30px', marginLeft: '250px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const searchBar = { backgroundColor: '#1f2937', padding: '10px 15px', borderRadius: '10px', display: 'flex', alignItems: 'center', width: '300px' };
const searchInput = { background: 'none', border: 'none', color: 'white', marginLeft: '10px', outline: 'none', width: '100%' };
const adminProfile = { display: 'flex', alignItems: 'center' };
const avatar = { width: '35px', height: '35px', backgroundColor: '#3b82f6', borderRadius: '50%', marginLeft: '10px' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' };
const dataMainGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px' };
const cardLayout = { backgroundColor: '#1f2937', padding: '25px', borderRadius: '15px', border: '1px solid #374151' };
const cardTitle = { fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#e5e7eb' };

const chartContainer = { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', gap: '10px' };
const barStyle = { width: '30px', borderRadius: '5px 5px 0 0', transition: 'height 0.3s ease' };

const listContainer = { display: 'flex', flexDirection: 'column', gap: '15px' };
const activityItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #374151' };

const mockPie = { width: '80px', height: '80px', borderRadius: '50%', border: '8px solid #3b82f6', borderTopColor: '#10b981', borderRightColor: '#fbbf24' };

export default DashboardAdmin;