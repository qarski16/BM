import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const PesananMasuk = () => {
  const [orders, setOrders] = useState([]);
  const [daftarKurir, setDaftarKurir] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [selectedKurirId, setSelectedKurirId] = useState(''); 
  const [showModal, setShowModal] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    kurirTersedia: 0,
    ditolak: 0 
  });

  // 1. Ambil data pesanan dan hitung statistik secara akurat (Realtime Client-Side Hit)
  const fetchData = async () => {
    try {
      const resStats = await axios.get('http://localhost:5000/api/pesanan/summary');
      const resOrders = await axios.get('http://localhost:5000/api/pesanan/semua');
      const resKurir = await axios.get('http://localhost:5000/api/auth/semua-kurir');
      
      const semuaPesanan = resOrders.data || [];

      // Filter hanya menampilkan pesanan yang statusnya masih 'Pending' atau belum ada status
      const pesananPending = semuaPesanan.filter(order => order.status === 'Pending' || !order.status);
      setOrders(pesananPending);
      setDaftarKurir(resKurir.data || []);

      // Menghitung jumlah pesanan ditolak langsung dari seluruh array data database pesanan
      const jumlahDitolakRealtime = semuaPesanan.filter(order => order.status === 'Ditolak').length;

      setStats({
        total: resStats.data.pesananMasuk + resStats.data.dalamProses + resStats.data.pesananSelesai || semuaPesanan.length,
        kurirTersedia: resStats.data.kurirAktif || 0,
        // Jika data summary backend 0 atau tidak terbaca, gunakan hitungan filter realtime di atas
        ditolak: resStats.data.pesananDitolak || resStats.data.ditolak || jumlahDitolakRealtime
      });
    } catch (err) {
      console.error("Gagal mengambil data database:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Sinkronisasi otomatis setiap 15 detik
    return () => clearInterval(interval);
  }, []);

  // 2. Buka Modal Detail
  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setSelectedKurirId(order.kurirId?._id || ''); 
    setShowModal(true);
  };

  // 3. Aksi Tugaskan Kurir
  const handleAssignKurir = async () => {
    if (!selectedOrder || !selectedOrder._id) return alert("Data pesanan tidak valid.");
    if (!selectedKurirId) return alert("Silahkan pilih kurir terlebih dahulu!");
    
    try {
      await axios.put(`http://localhost:5000/api/pesanan/update/${selectedOrder._id}`, {
        kurirId: selectedKurirId,
        status: 'Dalam Proses'
      });
      
      alert("Kurir berhasil ditugaskan! Pesanan berpindah ke halaman 'Dalam Proses'.");
      setShowModal(false);
      fetchData(); 
    } catch (err) {
      console.error("Gagal menugaskan kurir:", err);
      alert("Gagal menugaskan kurir. Periksa terminal backend.");
    }
  };

  // 4. Aksi Tolak Pesanan
  const handleTolakPesanan = async (orderId) => {
    if (!orderId) return alert("ID Pesanan tidak ditemukan.");
    
    if (window.confirm("Apakah Anda yakin ingin menolak pesanan ini?")) {
      try {
        await axios.put(`http://localhost:5000/api/pesanan/update/${orderId}`, {
          status: 'Ditolak'
        });
        
        alert("Pesanan telah ditolak.");
        fetchData(); // Memperbarui tabel dan memicu kalkulasi ulang statistik
      } catch (err) {
        console.error("Gagal update status:", err);
        alert("Gagal memperbarui status pesanan.");
      }
    }
  };

  return (
    <div style={containerStyle}>
      <Sidebar />

      <main style={mainContentStyle}>
        <h2 style={{ color: 'white', marginBottom: '30px', fontWeight: 'bold' }}>Pesanan Masuk</h2>

        {/* 3 KOTAK STATISTIK MINIMALIS */}
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
                <th style={thStyle}>Nama Pelanggan</th>
                <th style={thStyle}>Alamat Tujuan</th>
                <th style={thStyle}>Waktu Masuk</th>
                <th style={thStyle}>Status</th>
                <th style={{...thStyle, textAlign: 'center'}}>Aksi</th>
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
                    <td style={{ ...tdStyle, textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleOpenDetail(order)} style={btnDetail}>
                        <i className="fas fa-eye"></i> Detail / Proses
                      </button>
                      <button onClick={() => handleTolakPesanan(order._id)} style={btnTolak}>
                        <i className="fas fa-times"></i> Tolak
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    <i className="fas fa-box-open" style={{fontSize: '24px', display:'block', marginBottom: '10px'}}></i>
                    Saat ini tidak ada pesanan baru yang berstatus antrean (Pending).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL POP-UP DETAIL & PENUGASAN KURIR */}
        {showModal && selectedOrder && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <div style={modalHeader}>
                <h3>Detail Pemrosesan Pesanan</h3>
                <button onClick={() => setShowModal(false)} style={btnCloseModal}>&times;</button>
              </div>
              
              <div style={modalBody}>
                <div style={infoGroup}>
                  <span style={infoLabel}>Nama Pelanggan:</span>
                  <p style={infoValue}>{selectedOrder.namaLengkap}</p>
                </div>
                <div style={infoGroup}>
                  <span style={infoLabel}>Nomor Telepon:</span>
                  <p style={infoValue}>{selectedOrder.noTelpon || selectedOrder.telepon || '-'}</p>
                </div>
                <div style={infoGroup}>
                  <span style={infoLabel}>Alamat Pengiriman:</span>
                  <p style={infoValue}>{selectedOrder.alamat}</p>
                </div>
                <div style={infoGroup}>
                  <span style={infoLabel}>Isi Paket / Detail Pesanan:</span>
                  <p style={{...infoValue, color: '#f59e0b'}}>{selectedOrder.detailPesanan || 'Paket Umum'}</p>
                </div>

                <hr style={{border: '0', borderTop: '1px solid #374151', margin: '20px 0'}} />

                <div style={infoGroup}>
                  <label style={{...infoLabel, color: '#3b82f6', fontWeight: 'bold', marginBottom: '8px', display:'block'}}>
                    Pilih Kurir untuk Pengantaran:
                  </label>
                  <select 
                    value={selectedKurirId} 
                    onChange={(e) => setSelectedKurirId(e.target.value)} 
                    style={selectKurirStyle}
                  >
                    <option value="">-- Hubungkan dengan Kurir Aktif --</option>
                    {daftarKurir.map(kurir => (
                      <option key={kurir._id} value={kurir._id}>
                        {kurir.namaLengkap} ({kurir.status || 'Aktif'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={modalFooter}>
                <button onClick={() => setShowModal(false)} style={btnBatalModal}>Batal</button>
                <button onClick={handleAssignKurir} style={btnKonfirmasiModal}>
                  <i className="fas fa-motorcycle"></i> Konfirmasi & Kirim
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- CSS STYLES ---
const containerStyle = { display: 'flex', backgroundColor: '#111827', minHeight: '100vh' };
const mainContentStyle = { flex: 1, padding: '30px', marginLeft: '250px', color: 'white' };
const statsRow = { display: 'flex', gap: '20px', marginBottom: '30px' };
const miniCard = { backgroundColor: '#1f2937', padding: '25px 20px', borderRadius: '12px', flex: 1, border: '1px solid #2d3748' };
const cardLabel = { color: '#9ca3af', fontSize: '14px', margin: '0 0 12px 0', fontWeight: '500' };
const cardValue = { color: 'white', fontSize: '28px', margin: 0, fontWeight: 'bold' };
const tableWrapper = { backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151', overflow: 'hidden' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const headerRow = { backgroundColor: '#374151' };
const thStyle = { padding: '15px', fontSize: '14px', color: '#9ca3af', fontWeight: '500' };
const bodyRow = { borderBottom: '1px solid #374151' };
const tdStyle = { padding: '15px', fontSize: '14px', verticalAlign: 'middle' };
const statusBadge = { backgroundColor: '#d97706', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' };
const btnDetail = { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' };
const btnTolak = { backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalBox = { backgroundColor: '#1f2937', borderRadius: '12px', width: '500px', border: '1px solid #374151', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #374151', color: 'white' };
const btnCloseModal = { background: 'none', border: 'none', color: '#9ca3af', fontSize: '24px', cursor: 'pointer' };
const modalBody = { padding: '20px' };
const infoGroup = { marginBottom: '12px' };
const infoLabel = { fontSize: '12px', color: '#9ca3af' };
const infoValue = { fontSize: '14px', color: 'white', margin: '4px 0 0 0', fontWeight: '500' };
const selectKurirStyle = { width: '100%', backgroundColor: '#111827', color: 'white', border: '1px solid #374151', padding: '10px', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '13px' };
const modalFooter = { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '15px 20px', backgroundColor: '#111827', borderTop: '1px solid #374151' };
const btnBatalModal = { backgroundColor: '#374151', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' };
const btnKonfirmasiModal = { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', gap: '6px', alignItems: 'center' };

export default PesananMasuk;