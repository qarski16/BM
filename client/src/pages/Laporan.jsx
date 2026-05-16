import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; 
import Sidebar from '../components/Sidebar'; // Memanggil sidebar seragam

const Laporan = () => {
  const [dataLaporan, setDataLaporan] = useState([]);
  const [stats, setStats] = useState({ total: 0, komisi: 0, kurirAktif: 0 });

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/pesanan/laporan-data');
      const resSummary = await axios.get('http://localhost:5000/api/pesanan/summary');
      
      setDataLaporan(res.data.data || []);
      setStats({
        total: res.data.summary?.totalPengantaran || 0,
        komisi: res.data.summary?.totalKomisi || 0,
        kurirAktif: resSummary.data.kurirAktif || 0
      });
    } catch (err) {
      console.error("Gagal sinkronisasi data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportExcel = () => {
    if (dataLaporan.length === 0) return alert("Belum ada data untuk diexport");
    const excelData = dataLaporan.map(item => ({
      Tanggal: new Date(item.createdAt).toLocaleDateString('id-ID'),
      Kurir: item.kurirId?.namaLengkap || 'Fatwa',
      'Order ID': `ORD-${item._id.substring(18).toUpperCase()}`,
      Status: 'Selesai',
      Komisi: '2%'
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `Laporan_BM_Kurir.xlsx`);
  };

  return (
    <div style={containerStyle}>
      {/* 1. SIDEBAR PUSAT */}
      <Sidebar />

      {/* 2. MAIN CONTENT */}
      <main style={mainContentStyle}>
        <h2 style={{ color: 'white', marginBottom: '30px', fontWeight: 'bold' }}>Laporan Pengantaran</h2>

        {/* Filter Bar */}
        <div style={filterBar}>
          <input type="date" style={inputFilter} />
          <input type="date" style={inputFilter} />
          <select style={inputFilter}><option>Semua Kurir</option></select>
          <button style={btnTampilkan}>Tampilkan</button>
          <button onClick={handleExportExcel} style={btnExport}>Export Excel</button>
        </div>

        {/* 3 KOTAK STATISTIK */}
        <div style={statsRow}>
          <div style={miniCard}>
            <p style={cardLabel}>Total Pengantaran</p>
            <h3 style={cardValue}>{stats.total}</h3>
          </div>
          <div style={miniCard}>
            <p style={cardLabel}>Total Komisi Sistem</p>
            <h3 style={cardValue}>{stats.komisi}%</h3>
          </div>
          <div style={miniCard}>
            <p style={cardLabel}>Kurir Aktif</p>
            <h3 style={cardValue}>{stats.kurirAktif}</h3>
          </div>
        </div>

        {/* Tabel Laporan */}
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRow}>
                <th style={thStyle}>Tanggal</th>
                <th style={thStyle}>Kurir</th>
                <th style={thStyle}>Order ID</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Komisi</th>
              </tr>
            </thead>
            <tbody>
              {dataLaporan.length > 0 ? dataLaporan.map((item, index) => (
                <tr key={item._id || index} style={bodyRow}>
                  <td style={tdStyle}>{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                  <td style={tdStyle}>{item.kurirId?.namaLengkap || 'Fatwa'}</td>
                  <td style={tdStyle}>ORD-{item._id.substring(18).toUpperCase()}</td>
                  <td style={tdStyle}><span style={{color: '#10b981'}}>Selesai</span></td>
                  <td style={tdStyle}>2%</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#9ca3af'}}>Belum ada data laporan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

// --- STYLES (Hanya untuk Konten Laporan) ---
const containerStyle = { display: 'flex', backgroundColor: '#111827', minHeight: '100vh' };
const mainContentStyle = { flex: 1, padding: '30px', marginLeft: '250px', color: 'white' };

const filterBar = { display: 'flex', gap: '10px', marginBottom: '25px', alignItems: 'center' };
const inputFilter = { backgroundColor: '#1f2937', color: 'white', border: '1px solid #374151', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontSize: '13px' };
const btnTampilkan = { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const btnExport = { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

const statsRow = { display: 'flex', gap: '20px', marginBottom: '30px' };
const miniCard = { backgroundColor: '#1f2937', padding: '20px', borderRadius: '12px', flex: 1, border: '1px solid #374151' };
const cardLabel = { color: '#9ca3af', fontSize: '14px', margin: '0 0 10px 0' };
const cardValue = { color: 'white', fontSize: '24px', margin: 0, fontWeight: 'bold' };

const tableWrapper = { backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151', overflow: 'hidden' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const headerRow = { backgroundColor: '#374151' };
const thStyle = { padding: '15px', fontSize: '14px', color: '#9ca3af', fontWeight: '500' };
const bodyRow = { borderBottom: '1px solid #374151' };
const tdStyle = { padding: '15px', fontSize: '13px' };

export default Laporan;