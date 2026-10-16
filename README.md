# Qur'an Harian — Web Offline

Versi proyek ini memuat 3 foto Mushaf uji coba dalam format WebP.

## Foto yang disertakan
- `assets/mushaf/002.webp` — nomor cetak 2 terlihat.
- `assets/mushaf/003.webp` — nomor cetak 3 terlihat.
- `assets/mushaf/004.webp` — foto lanjutan; verifikasi nomor cetaknya sebelum memastikan pemetaan.

## Fitur
- UI responsif HP dan komputer.
- Jadwal, target halaman, riwayat, ekspor CSV, cadangan/pemulihan JSON.
- Penyimpanan progres di browser.
- Service worker meng-cache aplikasi dan tiga gambar di atas.

## Batasan
Paket ini hanya berisi 3 halaman foto, bukan keseluruhan 604 halaman Mushaf Pojok Kudus. Gunakan gambar yang Anda berhak gunakan dan distribusikan. Halaman yang belum ada gambarnya akan menampilkan pemberitahuan.

## Unggah ke GitHub dari HP
1. Unduh ZIP lalu ekstrak di HP.
2. Buka repositori GitHub.
3. Pilih **Add file → Upload files**.
4. Unggah isi folder yang sudah diekstrak (file dan folder `assets`, bukan ZIP saja).
5. Tekan **Commit changes**.
6. Pastikan **Settings → Pages** memakai branch `main` dan folder `/(root)`.
7. Buka website saat online sekali agar aplikasi dan tiga gambar di dalam paket masuk ke cache offline.

Service Worker memerlukan HTTPS dan browser yang mendukungnya. Hanya halaman 002–004 yang otomatis di-cache pada versi ini.
