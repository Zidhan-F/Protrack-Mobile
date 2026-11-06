# 📋 ProTrack Mobile

> **Sistem Monitoring Alur Kerja Produksi Percetakan Berbasis Mobile**

ProTrack Mobile adalah aplikasi monitoring proses produksi percetakan yang dirancang untuk memantau status Surat Perintah Kerja (SPK) secara *real-time*, melacak alur kerja antar departemen produksi, dan mengintegrasikan data transaksi secara efisien melalui impor file XML dari sistem Accurate.

---

## 🔐 Akun Demo (Demo Credentials)

Gunakan akun berikut untuk mencoba aplikasi:

| Peran (Role) | Email | Password | Hak Akses & Keterangan |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@protrack.com` | `password` | Akses penuh: dashboard seluruh departemen, buat/edit SPK, impor XML, kelola akun |
| **Operator Develop** | `develop@protrack.com` | `password` | Digital printing (DokuPrint A3): brosur, flyer, kartu nama, booklet — volume kecil–menengah |
| **Operator Offset** | `offset@protrack.com` | `password` | Cetak offset volume besar: brosur, katalog, leaflet, kemasan |
| **Operator Plotter** | `plotter@protrack.com` | `password` | Large format: banner, albatros, duratrans, sticker, backlite, vinyl |
| **Operator UV** | `uv@protrack.com` | `password` | Cetak UV pada media non-kertas (akrilik, PVC, board, material rigid) & efek varnish |
| **Operator Finishing** | `finishing@protrack.com` | `password` | Tahap akhir: laminasi, cutting, pond, lipat, lem, pemasangan material, packing |

> Password di atas sesuai `php artisan db:seed` (`DatabaseSeeder`). Jika akun admin dibuat lewat `AdminSeeder`, passwordnya `admin123`. Segera ganti pada lingkungan produksi.

### 🛡️ Hak Akses per Role (RBAC)

| Aksi | Administrator | Operator Develop / Offset / Plotter / UV | Operator Finishing |
| :--- | :---: | :---: | :---: |
| Dashboard & daftar SPK | Semua departemen | Hanya SPK departemennya | Hanya SPK di Finishing |
| Lihat detail SPK & riwayat | ✅ | Hanya departemennya | Hanya di Finishing |
| Buat / edit SPK, hapus detail | ✅ | ❌ | ❌ |
| Impor XML Accurate | ✅ | ❌ | ❌ |
| Ubah status SPK | Semua status | `sedang_diproses`, `selesai`* | `sedang_finishing`, `selesai` |
| Buat akun Administrator | ✅ | ❌ | ❌ |

\* Saat operator departemen cetak menandai `selesai`, SPK otomatis diteruskan ke Finishing dengan status `menunggu_finishing`.

Penegakan hak akses dilakukan di backend (Laravel Sanctum + middleware `role`); UI mobile hanya menyembunyikan menu/tombol yang tidak relevan.

---

## ✨ Fitur Utama

- **📊 Dashboard Interaktif & Statistik**: Ringkasan total SPK, status pengerjaan, peringatan deadline (*urgent* & terlambat), serta diagram grafik status dan departemen (*Chart Kit*).
- **📑 Manajemen & Pelacakan SPK**: Pemantauan detail SPK, pelanggan, spesifikasi produk, prioritas pengerjaan, dan *history log* tahapan pengerjaan.
- **🔄 Impor Transaksi XML**: Kemudahan mengimpor file data XML *Delivery Order* hasil ekspor dari software akuntansi Accurate.
- **🔔 Sistem Notifikasi**: Peringatan otomatis mengenai SPK yang mendekati batas waktu (*deadline*) atau mengalami keterlambatan.
- **🏢 Multi-Departemen**: Alur kerja terstruktur untuk 5 departemen produksi (*Develop, Offset, Plotter, UV, Finishing*).
- **👤 Profil & Keamanan**: Informasi profil pengguna, pengalihan peran, dan penggantian kata sandi (*Change Password*).

---

## 🛠️ Teknologi & Dependensi

- **Framework**: [React Native](https://reactnative.dev/) dengan [Expo](https://expo.dev/) (Expo Router)
- **Bahasa**: TypeScript & JavaScript
- **State & Storage**: `@react-native-async-storage/async-storage`
- **Komunikasi Data**: [Axios](https://axios-http.com/) (REST API)
- **Visualisasi & Grafik**: `react-native-chart-kit` & `react-native-svg`
- **Ikon & Desain**: `@expo/vector-icons` (Ionicons) & Modern Dynamic Theme
- **Backend Service**: [Laravel RESTful API](https://laravel.com/)

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Prasyarat
- **Node.js** (versi 18 LTS atau lebih baru)
- **NPM** atau **Yarn**
- Aplikasi **Expo Go** terpasang di smartphone (Android/iOS) atau Emulator Android Studio
- Backend Laravel ProTrack telah dijalankan (`php artisan serve`)

### 2. Instalasi Dependensi
Buka terminal pada direktori `mobile`, lalu jalankan:
```bash
npm install
```

### 3. Konfigurasi Alamat API
Aplikasi sudah dilengkapi dengan deteksi IP host otomatis melalui Expo Metro Bundler pada file [`src/services/api.js`](src/services/api.js).

> **Catatan Penting**: Pastikan smartphone dan laptop/PC berada dalam **satu jaringan Wi-Fi yang sama**. Jika menggunakan IP statis manual, Anda dapat memperbarui nilai fallback di `src/services/api.js`:
> ```javascript
> const BASE_URL = "http://<IP_LAPTOP_ANDA>:8000/api";
> ```

### 4. Menjalankan Aplikasi
Mulai server development Expo:
```bash
npx expo start
```
atau:
```bash
npm start
```

### 5. Membuka di Perangkat
- **Smartphone Fisik**: Buka aplikasi **Expo Go**, lalu scan QR code yang tampil di terminal.
- **Android Emulator**: Tekan tombol `a` pada keyboard di terminal.
- **Web Browser (Uji coba)**: Tekan tombol `w` pada keyboard di terminal.

---

## 👥 Tim Pengembang

Proyek ini dikembangkan oleh:
- **Nayla Raina Nazhirah** - NIM 411231018
- **Brigita Juniati Mendrofa** - NIM 411231153
- **Muhammad Zidhan Fadillah** - NIM 411231016

---

## 📄 Lisensi & Hak Cipta
Hak cipta dilindungi undang-undang. Proyek ini dikembangkan untuk kebutuhan operasional sistem pemantauan alur produksi percetakan.
