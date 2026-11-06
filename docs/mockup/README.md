# Mockup UI ProTrack Mobile

`protrack-mockup.html` berisi 9 layar (lebar 390 px), satu `<section class="screen">` per layar.

| # | Layar | Status |
| :-: | :-- | :-- |
| 1 | Login | Kondisi sekarang (`app/login.tsx`) |
| 2 | Dashboard | Kondisi sekarang (`app/(tabs)/dashboard.tsx`) |
| 3 | Data SPK | Kondisi sekarang (`app/spk/index.tsx`) |
| 4 | Detail SPK (Operator) | Kondisi sekarang (`app/spk/detail/[id].tsx`) |
| 5 | Tambah SPK | Kondisi sekarang (`app/spk/create.tsx`) |
| 6 | Import XML | Kondisi sekarang (`app/import/index.tsx`) |
| 7 | Notifikasi | Kondisi sekarang (`app/notifications.tsx`) |
| 8 | Profil | Kondisi sekarang (`app/(tabs)/profile.tsx`) |
| 9 | Detail SPK (tombol aksi + konfirmasi) | **Usulan**, bertanda "USULAN" |

Teks, label, urutan field, dan warna diambil dari kode. Data isian (nomor SPK, nama customer, tanggal) adalah contoh buatan.
Layar *kondisi sekarang* belum memuat layar Edit SPK, Register, Ganti Password, dan Tentang. Chart pada Dashboard digambar ulang (bar dan pie sederhana), bukan keluaran `react-native-chart-kit`.

Ikon memakai path SVG **Ionicons 7.4.0 asli** (nama sama dengan yang dipakai kode, mis. `grid`, `document-text-outline`; terlihat di atribut `data-ionicon`). Set aktif/nonaktif pada tab memakai varian filled/outline seperti `app/(tabs)/_layout.tsx`. Path dibungkus `<g transform="scale(0.046875)">` di dalam `viewBox="0 0 24 24"` karena importer HTML→Figma tidak membaca `viewBox="0 0 512 512"`. Hanya pie chart Dashboard yang digambar sendiri. Font memakai Inter (aplikasi memakai font sistem).

Impor ke Figma: lihat file Figma pada ringkasan sesi, atau gunakan tool `html_to_figma` dengan `cssSelector=.screen`.
