import React from 'react';
import Sidebar from '../components/Sidebar';

const Pengaturan = () => {
  return (
    <div style={containerStyle}>
      {/* Sidebar tetap di posisi fixed */}
      <Sidebar />

      {/* Konten Utama */}
      <main style={mainContentStyle}>
        
        {/* SECTION 1: TOPBAR */}
        <div style={topHeader}>
          <div style={searchWrapper}>
            <i className="fas fa-search" style={{ color: '#9ca3af' }}></i>
            <input type="text" placeholder="Search" style={searchInput} />
          </div>
          <div style={adminProfile}>
            <i className="fas fa-user-circle" style={{ fontSize: '24px' }}></i>
            <span>Admin <i className="fas fa-chevron-down" style={{ fontSize: '10px' }}></i></span>
          </div>
        </div>

        <h2 style={titleSection}>Pengaturan Sistem</h2>

        {/* SECTION 2: TABS */}
        <div style={tabContainer}>
          <button style={tabItem}><i className="fas fa-money-bill-wave"></i> Komisi</button>
          <button style={tabItem}><i className="fas fa-motorcycle"></i> Kurir</button>
          <button style={tabItem}><i className="fas fa-desktop"></i> Sistem</button>
          <button style={tabItemActive}><i className="fas fa-shield-alt"></i> Keamanan</button>
        </div>

        {/* SECTION 3: GRID ATAS (KOMISI, KURIR, SISTEM) */}
        <div style={gridRow3}>
          {/* Card Komisi */}
          <div style={card}>
            <h4 style={cardTitle}>Pengaturan Komisi</h4>
            <div style={infoRowInline}>
              <span style={cardSubtitle}>Komisi Sistem Per Pengantaran</span>
              <span style={badgeSmall}>2%</span>
            </div>
            <p style={descText}>Setiap Pengantaran Kurir Akan Menambahkan Komisi Sistem.</p>
            <button style={btnSmallGreen}>Simpan Pengaturan</button>
          </div>

          {/* Card Kurir */}
          <div style={card}>
            <h4 style={cardTitle}>Pengaturan Kurir</h4>
            <label style={labelStyle}>Jumlah Maksimal Order Per Kurir</label>
            <input type="number" defaultValue="5" style={inputField} />
            <div style={{ marginTop: '10px' }}>
              <p style={descText}>Status Kurir Otomatis: <span style={{ color: '#10b981' }}>Aktif</span></p>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '-12px' }}>Nonaktif</p>
            </div>
            <button style={btnSmallGreen}>Simpan Pengaturan</button>
          </div>

          {/* Card Sistem */}
          <div style={card}>
            <h4 style={cardTitle}>Pengaturan Sistem</h4>
            <div style={rowInfoBorder}><span>Nama Aplikasi</span> <span style={{color:'white'}}>BM Kurir</span></div>
            <div style={rowInfoBorder}><span>Zona Waktu</span> <span style={{color:'white'}}>Wita</span></div>
            <div style={rowInfoBorder}><span>Bahasa Sistem</span> <span style={{color:'white'}}>Indonesia</span></div>
            <button style={{...btnSmallGreen, marginTop: '15px'}}>Simpan Pengaturan</button>
          </div>
        </div>

        {/* SECTION 4: KEAMANAN (GRID 3 KOLOM) */}
        <div style={cardFull}>
          <h4 style={cardTitle}>Pengaturan Keamanan</h4>
          <p style={descText}>Atur keamanan akun admin dan sistem untuk melindungi data serta akses yang tidak sah</p>
          
          <div style={gridRow3Inner}>
            <div style={innerColumn}>
              <h5 style={innerTitle}>Verifikasi Login</h5>
              <p style={descSmall}>Aktifkan verifikasi dua langkah untuk keamanan tambahan saat login.</p>
              <label style={labelStyle}>Aktifkan/Verifikasi Login</label>
              <label style={labelStyle}>Metode Verifikasi</label>
              <select style={inputField}>
                <option>Kirim kode ke email</option>
              </select>
            </div>

            <div style={innerColumn}>
              <h5 style={innerTitle}>Batas Percobaan Login</h5>
              <p style={descSmall}>Tentukan jumlah maksimal percobaan login yang salah.</p>
              <label style={labelStyle}>Batas Percobaan Login</label>
              <div style={inputWithUnit}>
                <input type="number" defaultValue="5" style={inputInner} />
                <span style={unitTag}>Kali</span>
              </div>
              <p style={descTiny}>Akun akan diblokir jika mencapai batas ini.</p>
            </div>

            <div style={innerColumn}>
              <h5 style={innerTitle}>Waktu Blokir Akun</h5>
              <p style={descSmall}>Tentukan berapa lama akun akan diblokir setelah percobaan gagal.</p>
              <label style={labelStyle}>Waktu Blokir</label>
              <div style={inputWithUnit}>
                <input type="number" defaultValue="10" style={inputInner} />
                <span style={unitTag}>Menit</span>
              </div>
              <p style={descTiny}>Akun tidak dapat login selama waktu ini.</p>
            </div>
          </div>
        </div>

        {/* SECTION 5: PASSWORD & ACTIONS */}
        <div style={gridRowCustom}>
          <div style={card}>
            <h4 style={cardTitle}>Ubah Password Admin</h4>
            <p style={descSmall}>Gunakan form di bawah untuk mengganti password admin.</p>
            <div style={flexGroup}>
              <div style={{flex: 1}}>
                <label style={labelStyle}>Password Lama</label>
                <input type="password" placeholder="Masukkan password lama" style={inputField} />
              </div>
              <div style={{flex: 1}}>
                <label style={labelStyle}>Password Baru</label>
                <input type="password" placeholder="Masukkan password baru" style={inputField} />
              </div>
            </div>
            <div style={{marginTop: '15px'}}>
              <label style={labelStyle}>Konfirmasi Password Baru</label>
              <input type="password" placeholder="Ulangi password baru" style={inputField} />
            </div>
          </div>

          <div style={card}>
            <div style={{marginBottom: '20px'}}>
              <h4 style={cardTitle}>Reset Password Admin</h4>
              <p style={descSmall}>Kirim email reset password ke akun admin jika lupa.</p>
              <button style={btnBlue}><i className="fas fa-envelope"></i> Kirim email reset</button>
            </div>
            <div>
              <h4 style={cardTitle}>Logout Semua Perangkat</h4>
              <p style={descSmall}>Keluar dari semua perangkat yang sedang login.</p>
              <button style={btnRed}><i className="fas fa-sign-out-alt"></i> Logout Semua Session</button>
            </div>
          </div>
        </div>

        {/* SECTION 6: BACKUP DATABASE */}
        <div style={cardBackup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={cardTitle}>Backup Database</h4>
              <p style={descSmall}>Lakukan backup database sistem berkala.</p>
              <div style={backupMeta}>
                <span>Backup Terakhir: <b style={{color:'white'}}>21 April 2026</b></span>
                <span>Ukuran Backup: <b style={{color:'white'}}>128,3 MB</b></span>
                <span>Simpan di: <b style={{color:'white'}}>Server Lokasi</b></span>
              </div>
            </div>
            <button style={btnGreenBackup}><i className="fas fa-database"></i> Backup Database</button>
          </div>
        </div>

        {/* SECTION 7: FINAL ACTION */}
        <div style={footerAction}>
          <button style={btnGlobalSave}><i className="fas fa-check-circle"></i> Simpan Pengaturan</button>
          <p style={descTinyCenter}>Simpan semua perubahan pengaturan admin</p>
        </div>

      </main>
    </div>
  );
};

// --- STYLES (TOTAL RECOVERY - 200+ LINES) ---
const containerStyle = { 
  display: 'flex', 
  backgroundColor: '#0f172a', 
  color: 'white', 
  minHeight: '100vh', 
  width: '100%',
  fontFamily: "'Inter', sans-serif"
};

const mainContentStyle = { 
  flex: 1, 
  padding: '20px 40px', 
  marginLeft: '250px', // Ruang sidebar
  display: 'flex', 
  flexDirection: 'column',
  minHeight: '100vh' // Agar scroll terbaca sampai bawah
};

const topHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const searchWrapper = { backgroundColor: '#1e293b', padding: '10px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', width: '350px', border: '1px solid #334155' };
const searchInput = { background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%' };
const adminProfile = { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: '#1e293b', padding: '8px 15px', borderRadius: '8px' };

const titleSection = { fontSize: '24px', fontWeight: 'bold', marginBottom: '25px' };
const tabContainer = { display: 'flex', gap: '12px', marginBottom: '30px' };
const tabItem = { backgroundColor: '#1e293b', color: '#94a3b8', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px' };
const tabItemActive = { ...tabItem, backgroundColor: '#334155', color: 'white' };

const gridRow3 = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' };
const card = { backgroundColor: '#1e293b', padding: '25px', borderRadius: '12px', border: '1px solid #334155' };
const cardFull = { ...card, marginBottom: '25px' };
const cardTitle = { fontSize: '16px', fontWeight: '600', marginBottom: '15px' };
const cardSubtitle = { fontSize: '13px', color: '#94a3b8' };
const badgeSmall = { backgroundColor: '#0f172a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: '#fbbf24' };
const descText = { fontSize: '12px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.6' };
const descSmall = { fontSize: '12px', color: '#64748b', marginBottom: '15px' };

const labelStyle = { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' };
const inputField = { width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '13px' };
const rowInfoBorder = { display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px 0', borderBottom: '1px solid #334155', color: '#94a3b8' };

const infoRowInline = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' };
const btnSmallGreen = { backgroundColor: '#064e3b', color: '#10b981', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', marginTop: '10px' };

const gridRow3Inner = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' };
const innerColumn = { display: 'flex', flexDirection: 'column' };
const innerTitle = { fontSize: '15px', fontWeight: '600', marginBottom: '8px' };
const inputWithUnit = { display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', paddingRight: '12px' };
const inputInner = { ...inputField, border: 'none' };
const unitTag = { color: '#4b5563', fontSize: '12px' };
const descTiny = { fontSize: '10px', color: '#4b5563', marginTop: '5px' };

const gridRowCustom = { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginBottom: '25px' };
const flexGroup = { display: 'flex', gap: '15px' };
const btnBlue = { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', width: '100%', cursor: 'pointer', fontWeight: '600', display: 'flex', justifyContent: 'center', gap: '10px' };
const btnRed = { ...btnBlue, backgroundColor: '#dc2626' };

const cardBackup = { ...card, border: '1px dashed #3b82f6', marginBottom: '25px' };
const backupMeta = { display: 'flex', gap: '30px', fontSize: '12px', color: '#94a3b8', marginTop: '10px' };
const btnGreenBackup = { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' };

const footerAction = { textAlign: 'center', padding: '40px 0 80px 0' };
const btnGlobalSave = { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '15px 45px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' };
const descTinyCenter = { fontSize: '11px', color: '#4b5563', marginTop: '12px' };

export default Pengaturan;