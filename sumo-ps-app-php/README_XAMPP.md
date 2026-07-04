# Panduan Migrasi & Menjalankan Sumo PlayStation di XAMPP (PHP & MySQL)

Halo! Sesuai permintaan Anda, kami telah memetakan seluruh arsitektur sistem backend Express lama ke **Backend PHP & MySQL murni** tanpa mengubah struktur frontend React Anda yang sudah siap pakai.

Dengan konfigurasi ini, Anda bisa langsung menjalankan aplikasi ini di **XAMPP** komputer lokal Anda.

---

## 📋 Langkah-langkah Persiapan (Setup di XAMPP)

### Langkah 1: Siapkan Database MySQL di phpMyAdmin
1. Buka **XAMPP Control Panel** Anda, lalu jalankan module **Apache** dan **MySQL**.
2. Buka browser Anda dan akses: `http://localhost/phpmyadmin/`.
3. Buat database baru dengan nama: `sumo_playstation`.
4. Pilih database `sumo_playstation` tersebut, masuk ke tab **Import**.
5. Pilih file `database.sql` yang ada di dalam folder proyek ini (`/sumo-ps-app-php/database.sql`) dan klik **Import** / **Go**.
6. Seluruh tabel default (User, Slot TV, Inventori, Transaksi, Log, Rental Bawa Pulang, Laporan Kerusakan) beserta data awal (*seeds*) akan otomatis terbuat.

---

### Langkah 2: Lakukan Build Frontend React Anda
Sebelum memindahkan file ke XAMPP, kita perlu mengompilasi file React menjadi aset statis HTML, CSS, dan JS yang siap disajikan oleh Apache (XAMPP).
1. Buka terminal di folder proyek utama ini.
2. Jalankan perintah kompilasi:
   ```bash
   npm run build
   ```
3. Proses build ini akan menghasilkan folder bernama `dist/` di root proyek Anda.

---

### Langkah 3: Pindahkan File ke Folder `htdocs` XAMPP
1. Buat folder baru di dalam `C:\xampp\htdocs\` dengan nama `sumo-playstation` (sehingga jalurnya menjadi `C:\xampp\htdocs\sumo-playstation\`).
2. Salin **seluruh isi** dari folder `dist/` hasil build Anda ke dalam folder `C:\xampp\htdocs\sumo-playstation\`.
3. Salin juga file-file PHP berikut dari folder `/sumo-ps-app-php/` langsung ke root folder `C:\xampp\htdocs\sumo-playstation\`:
   * `api.php` (Server API kita)
   * `.htaccess` (Konfigurasi URL Rewrite otomatis agar `/api/*` terbaca oleh PHP)
   * `models/` (Folder berisi logika perhitungan AHP - `models/AHP.php`)

Struktur folder akhir di dalam `C:\xampp\htdocs\sumo-playstation\` akan terlihat seperti ini:
```text
C:\xampp\htdocs\sumo-playstation\
├── assets/                  (Aset JS & CSS dari folder dist)
├── models/
│   └── AHP.php              (Logika algoritma AHP PHP)
├── .htaccess                (URL Router config)
├── api.php                  (File API Utama)
├── index.html               (File Entry Point Frontend)
└── ... (file statis lainnya)
```

---

## 🚀 Jalankan Aplikasi Anda!

Buka browser favorit Anda dan akses:
👉 **`http://localhost/sumo-playstation/`**

Aplikasi akan otomatis berjalan! 
* Apache akan menyajikan tampilan visual React Anda yang menawan.
* Ketika frontend memanggil `/api/*` (seperti saat Login, Check-out TV, Manajemen Inventori, atau Kalkulasi AHP), file `.htaccess` akan secara otomatis mengarahkannya ke `api.php` di latar belakang.
* Seluruh data Anda sekarang tersimpan secara permanen di database **MySQL XAMPP** Anda!

---

## 🔑 Akun Preset Default untuk Login
Anda bisa login menggunakan akun bawaan berikut:
1. **Role Pemilik:**
   * **Username:** `pemilik`
   * **Password:** `pemilik123`
2. **Role Pegawai:**
   * **Username:** `pegawai`
   * **Password:** `pegawai123`

---

## 🛠️ Konfigurasi Tambahan (Jika Diperlukan)
Jika Anda menggunakan username/password database MySQL yang berbeda di XAMPP Anda (bukan default `root` dan tanpa password), Anda hanya perlu menyesuaikan baris koneksi database di bagian atas file `api.php`:
```php
// baris 21-24 di api.php
$db_host = 'localhost';
$db_user = 'root';        // Ubah jika bukan root
$db_pass = '';            // Ubah dengan password database Anda
$db_name = 'sumo_playstation';
```

Selamat mencoba! Aplikasi Anda kini 100% siap dijalankan menggunakan XAMPP! 🎉
