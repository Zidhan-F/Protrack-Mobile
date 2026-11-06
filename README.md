# 📋 ProTrack Mobile

> **Sistem Monitoring Alur Kerja Produksi Percetakan Berbasis Mobile**

ProTrack Mobile adalah aplikasi monitoring proses produksi percetakan yang dirancang untuk memantau status Surat Perintah Kerja (SPK) secara *real-time*, melacak alur kerja antar departemen produksi, dan mengintegrasikan data transaksi secara efisien melalui impor file XML dari sistem Accurate.

Repositori ini mencakup:
- **`mobile/`**: Aplikasi mobile berbasis React Native & Expo.
- **`backend/`**: Layanan backend RESTful API berbasis Laravel & Sanctum.

---

## 🔑 Akun Demo (Demo Credentials)

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
- **📋 Manajemen & Pelacakan SPK**: Pemantauan detail SPK, pelanggan, spesifikasi produk, prioritas pengerjaan, dan *history log* tahapan pengerjaan.
- **🔄 Impor Transaksi XML**: Kemudahan mengimpor file data XML *Delivery Order* hasil ekspor dari software akuntansi Accurate.
- **🔔 Sistem Notifikasi**: Peringatan otomatis mengenai SPK yang mendekati batas waktu (*deadline*) atau mengalami keterlambatan.
- **🏢 Multi-Departemen**: Alur kerja terstruktur untuk 5 departemen produksi (*Develop, Offset, Plotter, UV, Finishing*).
- **👤 Profil & Keamanan**: Informasi profil pengguna, pengalihan peran, dan penggantian kata sandi (*Change Password*).

---

## 🛠️ Arsitektur & Teknologi

### 📱 Frontend Mobile (`/mobile`)
- **Framework**: [React Native](https://reactnative.dev/) dengan [Expo](https://expo.dev/) (Expo Router)
- **Bahasa**: TypeScript & JavaScript
- **State & Storage**: `@react-native-async-storage/async-storage`
- **Komunikasi Data**: [Axios](https://axios-http.com/) (REST API)
- **Visualisasi & Grafik**: `react-native-chart-kit` & `react-native-svg`
- **Ikon & Desain**: `@expo/vector-icons` (Ionicons) & Modern Dynamic Theme

### ⚙️ Backend API (`/backend`)
- **Framework**: [Laravel](https://laravel.com/)
- **Autentikasi & Otorisasi**: Laravel Sanctum & Role-based Middleware
- **Database**: MySQL / MariaDB

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Menjalankan Backend
Buka terminal pada direktori `backend`:
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

### 2. Menjalankan Aplikasi Mobile
Buka terminal baru pada direktori `mobile`:
```bash
cd mobile
npm install
npx expo start
```

### 3. Konfigurasi Alamat API
Aplikasi mobile sudah dilengkapi dengan deteksi IP host otomatis melalui Expo Metro Bundler pada file [`mobile/src/services/api.js`](mobile/src/services/api.js).

> **Catatan Penting**: Pastikan smartphone dan laptop/PC berada dalam **satu jaringan Wi-Fi yang sama**. Jika menggunakan IP statis manual, Anda dapat memperbarui nilai fallback di `mobile/src/services/api.js`:
> ```javascript
> const BASE_URL = "http://<IP_LAPTOP_ANDA>:8000/api";
> ```

---

## 👥 Tim Pengembang

Proyek ini dikembangkan oleh:
- **Nayla Raina Nazhirah** - NIM 411231018
- **Brigita Juniati Mendrofa** - NIM 411231153
- **Muhammad Zidhan Fadillah** - NIM 411231016

---

## 📄 Lisensi & Hak Cipta
Hak cipta dilindungi undang-undang. Proyek ini dikembangkan untuk kebutuhan operasional sistem pemantauan alur produksi percetakan.

