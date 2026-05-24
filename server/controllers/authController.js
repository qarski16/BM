const User = require('../models/user'); // Memanggil Model User dengan skema _id String
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- 🔑 1. REGISTRASI / DAFTAR AKUN BARU ---
exports.register = async (req, res) => {
  try {
    const { namaLengkap, email, password, role } = req.body;

    // Validasi input dasar
    if (!namaLengkap || !email || !password) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi!" });
    }

    // Tentukan role default jika tidak dikirim dari frontend
    const userRole = role || 'kurir';

    // Cek apakah email sudah terdaftar di database
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar!" });
    }

    // 🔢 LOGIKA PEMBUATAN ID KUSTOM (BM001 / ADM001)
    let customId = '';
    if (userRole === 'kurir') {
      const totalKurir = await User.countDocuments({ role: 'kurir' });
      customId = `BM${String(totalKurir + 1).padStart(3, '0')}`;
    } else if (userRole === 'admin') {
      const totalAdmin = await User.countDocuments({ role: 'admin' });
      customId = `ADM${String(totalAdmin + 1).padStart(3, '0')}`;
    }

    // Enkripsi / Hash Password sebelum disimpan
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat objek user baru dengan _id kustom murni String
    const userBaru = new User({
      _id: customId,
      namaLengkap,
      email,
      password: hashedPassword,
      role: userRole,
      statusOnline: 'Offline'
    });

    // Simpan ke database
    await userBaru.save();

    res.status(201).json({
      success: true,
      message: `${userRole === 'kurir' ? 'Kurir' : 'Admin'} berhasil didaftarkan!`,
      data: {
        id: userBaru._id,
        namaLengkap: userBaru.namaLengkap,
        email: userBaru.email,
        role: userBaru.role
      }
    });

  } catch (error) {
    console.error("Error di Register Controller:", error.message);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server!" });
  }
};

// --- 🚪 2. LOGIN USER (ADMIN & KURIR) ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password wajib diisi!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Akun tidak ditemukan!" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: "Password salah!" });
    }

    const jwtSecret = process.env.JWT_SECRET || 'RAHASIA_JWT_KUNCI'; 
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    if (user.role === 'kurir') {
      user.statusOnline = 'Online';
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Login Berhasil!",
      token,
      user: {
        id: user._id,
        namaLengkap: user.namaLengkap,
        role: user.role,
        statusOnline: user.statusOnline
      }
    });

  } catch (error) {
    console.error("Error di Login Controller:", error.message);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server!" });
  }
};

// --- 👤 3. GET PROFIL UTAMA (Untuk Fetch Data di ProfilKurir.jsx) ---
exports.getProfilKurir = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Data kurir tidak ditemukan!" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error di Get Profil:", error.message);
    res.status(500).json({ success: false, message: "Gagal memuat profil!" });
  }
};

// --- 🔄 4. UPDATE STATUS OPERASIONAL KURIR ---
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 🛠️ PERBAIKAN: Mengganti { new: true } menjadi { returnDocument: 'after' } untuk menghilangkan warning
    const user = await User.findByIdAndUpdate(
      id, 
      { statusOnline: status }, 
      { returnDocument: 'after' }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "Kurir tidak ditemukan!" });
    }

    res.status(200).json({ success: true, message: "Status berhasil diperbarui!", statusOnline: user.statusOnline });
  } catch (error) {
    console.error("Error di Update Status:", error.message);
    res.status(500).json({ success: false, message: "Gagal memperbarui status!" });
  }
};

// --- ✍️ 5. UPDATE DATA PROFIL UTAMA KURIR ---
exports.updateProfilKurir = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaLengkap, email, telepon } = req.body;

    // 🛠️ PERBAIKAN: Mengganti { new: true } menjadi { returnDocument: 'after' }
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { namaLengkap, email, telepon },
      { returnDocument: 'after' }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
    }

    res.status(200).json({ success: true, message: "Profil berhasil diperbarui!", data: updatedUser });
  } catch (error) {
    console.error("Error di Update Profil:", error.message);
    res.status(500).json({ success: false, message: "Gagal memperbarui profil!" });
  }
};

// --- 🔑 6. UBAH PASSWORD KURIR ---
exports.ubahPasswordKurir = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { returnDocument: 'after' } // 🛠️ Menghilangkan warning terminal
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
    }

    res.status(200).json({ success: true, message: "Password berhasil diperbarui!" });
  } catch (error) {
    console.error("Error di Ubah Password:", error.message);
    res.status(500).json({ success: false, message: "Gagal mengubah password!" });
  }
};

// --- 📷 7. UPLOAD FOTO SIM KURIR ---
exports.uploadSimKurir = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "File gambar tidak ditemukan!" });
    }

    // Menyimpan path file gambar/foto SIM yang diunggah ke database
    const pathFotoSim = req.file.path.replace(/\\/g, "/"); // Menormalkan garis miring path Windows

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { fotoSim: pathFotoSim },
      { returnDocument: 'after' } // 🛠️ Menghilangkan warning terminal
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
    }

    res.status(200).json({ success: true, message: "Foto SIM berhasil disimpan!", fotoSim: pathFotoSim });
  } catch (error) {
    console.error("Error di Upload SIM:", error.message);
    res.status(500).json({ success: false, message: "Gagal mengunggah foto SIM!" });
  }
};