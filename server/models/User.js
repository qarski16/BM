const User = require('../models/User'); // Sesuaikan dengan jalur file skema Anda

const updateStatusKurir = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Ambil data status dari frontend (baik dikirim sebagai 'status' atau 'statusOnline')
    let statusInput = req.body.statusOnline || req.body.status;

    if (!statusInput) {
      return res.status(400).json({ success: false, message: "Status tidak dikirim." });
    }

    // 2. OTOMATISASI FORMAT: Ubah text menjadi Huruf Kapital di awal (Capitalize)
    // Contoh: "online" atau "ONLINE" akan otomatis diubah menjadi "Online" agar lolos ENUM Mongoose
    const statusBaru = statusInput.charAt(0).toUpperCase() + statusInput.slice(1).toLowerCase();

    // 3. Validasi lokal sebelum dikirim ke MongoDB untuk memastikan kecocokan enum
    const enumValid = ['Online', 'Offline', 'Mengantar'];
    if (!enumValid.includes(statusBaru)) {
      return res.status(400).json({ 
        success: false, 
        message: `Status '${statusInput}' tidak valid. Harus salah satu dari: Online, Offline, atau Mengantar.` 
      });
    }

    // 4. Eksekusi paksa perubahan ke MongoDB Atlas menggunakan operator $set
    const kurirDiupdate = await User.findByIdAndUpdate(
      id,
      { $set: { statusOnline: statusBaru } },
      { new: true, runValidators: true } // runValidators memastikan dia mengecek enum skema Anda
    );

    if (!kurirDiupdate) {
      return res.status(404).json({ success: false, message: "Kurir tidak ditemukan." });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Database berhasil diperbarui menjadi ${statusBaru}!`, 
      data: kurirDiupdate 
    });

  } catch (error) {
    console.error("Error pada backend controller:", error.message);
    return res.status(500).json({ success: false, message: "Gagal memperbarui database", error: error.message });
  }
};

module.exports = { updateStatusKurir };