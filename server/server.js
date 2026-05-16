const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); 
require('dotenv').config();

const app = express();

// Panggil koneksi database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); 

// --- ROUTES ---

// Rute Otentikasi (Login/Register)
app.use('/api/auth', require('./routes/auth'));

// Rute Pesanan (Form Pesanan Publik)
app.use('/api/pesanan', require('./routes/pesanan')); 

// Cek status server (Root path)
app.get('/', (req, res) => {
    res.send('Server BM Kurir Aktif & Database Terkoneksi!');
});

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server jalan di port ${PORT}`);
});