// Contoh logika di Backend
router.get('/summary', async (req, res) => {
  try {
    const pesananMasuk = await Pesanan.countDocuments({ status: 'Pending' });
    const dalamProses = await Pesanan.countDocuments({ status: 'Proses' });
    const selesai = await Pesanan.countDocuments({ status: 'Selesai' });
    const kurirAktif = await User.countDocuments({ role: 'Kurir', status: 'Aktif' });

    res.json({ pesananMasuk, dalamProses, selesai, kurirAktif });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});