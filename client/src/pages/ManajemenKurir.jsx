import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar'; // Panggil file Sidebar pusat

const ManajemenKurir = () => {
  const navigate = useNavigate();
  const [kurirs, setKurirs] = useState([]);

  useEffect(() => {
    const fetchKurir = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/semua-kurir');
        setKurirs(res.data);
      } catch (err) {
        console.error("Gagal mengambil data kurir");
      }
    };
    fetchKurir();
  }, []);

  return (
    <div style={containerStyle}>
      {/* 1. SEKARANG HANYA PANGGIL INI */}
      <Sidebar />

      {/* 2. MAIN CONTENT - Dengan marginLeft agar tidak tertutup sidebar */}
      <main style={mainContentStyle}>
        <h2 style={{ color: 'white', marginBottom: '30px', fontWeight: 'bold' }}>Manajemen Kurir</h2>
        
        {/* Search & Filter Bar */}
        <div style={filterBar}>
          <select style={selectStyle}><option>Semua Status</option></select>
          <div style={searchContainer}>
            <i className="fas fa-search" style={searchIcon}></i>
            <input type="text" placeholder="Search" style={searchInput} />
          </div>
        </div>

        {/* Grid Kartu Kurir */}
        <div style={kurirGrid}>
          {kurirs.length > 0 ? (
            kurirs.map((kurir) => (
              <div key={kurir._id} style={kurirCard}>
                <div style={cardHeader}>
                  <div style={avatarCircle}><i className="fas fa-user"></i></div>
                  <div>
                    <h4 style={{ margin: 0, color: 'white' }}>{kurir.namaLengkap}</h4>
                    <p style={{ ...statusLabel, color: kurir.status === 'Online' ? '#10b981' : '#ef4444' }}>
                      ● {kurir.status || 'Offline'}
                    </p> 
                  </div>
                </div>
                <div style={cardBody}>
                  <p>Tugas Aktif: <span style={{color: 'white'}}>{kurir.tugasAktif || 0}</span></p>
                  <p>Lokasi terakhir: <span style={{color: 'white'}}>{kurir.lokasiTerakhir || 'Parepare'}</span></p>
                  <div style={progressBarContainer}>
                     <div style={progressLabel}><span>Komisi Sistem</span><span>{kurir.komisi || 0}%</span></div>
                     <div style={progressBar}>
                        <div style={{...progressFill, width: `${kurir.komisi || 0}%`}}></div>
                     </div>
                  </div>
                </div>
                <div style={cardActions}>
                  <button style={btnAssign}><i className="fas fa-plus-circle"></i> Assign Tugas</button>
                  <button style={btnDetail}><i className="fas fa-eye"></i> Detail</button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#9ca3af' }}>Tidak ada kurir terdaftar.</p>
          )}
        </div>
      </main>
    </div>
  );
};

// --- STYLES (Tanpa Style Sidebar) ---
const containerStyle = { display: 'flex', backgroundColor: '#111827', minHeight: '100vh' };
const mainContentStyle = { flex: 1, padding: '30px', marginLeft: '250px' };

const filterBar = { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', gap: '20px' };
const selectStyle = { backgroundColor: '#1f2937', color: 'white', border: '1px solid #374151', padding: '10px', borderRadius: '8px', outline: 'none' };
const searchContainer = { position: 'relative', flex: 1, maxWidth: '400px' };
const searchIcon = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' };
const searchInput = { width: '100%', backgroundColor: '#1f2937', border: '1px solid #374151', padding: '10px 10px 10px 40px', borderRadius: '8px', color: 'white', outline: 'none' };

const kurirGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' };
const kurirCard = { backgroundColor: '#1f2937', padding: '20px', borderRadius: '15px', border: '1px solid #374151' };
const cardHeader = { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' };
const avatarCircle = { width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' };
const statusLabel = { margin: 0, fontSize: '12px', fontWeight: 'bold', marginTop: '4px' };

const cardBody = { fontSize: '13px', color: '#9ca3af', marginBottom: '20px' };
const progressBarContainer = { marginTop: '15px' };
const progressLabel = { display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '11px' };
const progressBar = { width: '100%', height: '6px', backgroundColor: '#111827', borderRadius: '10px', overflow: 'hidden' };
const progressFill = { height: '100%', backgroundColor: '#3b82f6', transition: '0.3s' };

const cardActions = { display: 'flex', gap: '10px' };
const btnAssign = { flex: 1, backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' };
const btnDetail = { backgroundColor: 'transparent', color: 'white', border: '1px solid #374151', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' };

export default ManajemenKurir;