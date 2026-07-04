-- Database Schema for Sumo PlayStation (MySQL)
-- Cocok dijalankan pada phpMyAdmin / MySQL Server di XAMPP

CREATE DATABASE IF NOT EXISTS sumo_playstation;
USE sumo_playstation;

-- 1. Tabel users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- password hash terenkripsi (password_hash() PHP)
    nama_lengkap VARCHAR(100) NOT NULL,
    role ENUM('pegawai', 'pemilik') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel konsol_tv
CREATE TABLE IF NOT EXISTS konsol_tv (
    id_tv INT AUTO_INCREMENT PRIMARY KEY,
    nama_tv VARCHAR(20) NOT NULL,
    jenis_konsol VARCHAR(50) NOT NULL,
    status ENUM('kosong', 'digunakan', 'booking', 'maintenance') DEFAULT 'kosong'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel billing
CREATE TABLE IF NOT EXISTS billing (
    id_billing INT AUTO_INCREMENT PRIMARY KEY,
    id_tv INT NOT NULL,
    id_user INT NOT NULL,
    waktu_mulai DATETIME NOT NULL,
    waktu_selesai DATETIME DEFAULT NULL,
    durasi_menit INT DEFAULT 0,
    tarif_per_jam INT DEFAULT 10000,
    total_sewa INT DEFAULT 0,
    total_menu INT DEFAULT 0,
    total_bayar INT DEFAULT 0,
    status ENUM('aktif', 'selesai') DEFAULT 'aktif',
    FOREIGN KEY (id_tv) REFERENCES konsol_tv(id_tv),
    FOREIGN KEY (id_user) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel inventori
CREATE TABLE IF NOT EXISTS inventori (
    id_barang INT AUTO_INCREMENT PRIMARY KEY,
    nama_barang VARCHAR(100) NOT NULL,
    stok_saat_ini INT NOT NULL DEFAULT 0,
    safety_stock INT NOT NULL DEFAULT 0,
    harga_grosir INT NOT NULL DEFAULT 0,
    harga_eceran INT NOT NULL DEFAULT 0,
    jumlah_terjual INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel detail_transaksi_menu
CREATE TABLE IF NOT EXISTS detail_transaksi_menu (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_billing INT NOT NULL,
    id_barang INT NOT NULL,
    jumlah INT NOT NULL,
    subtotal INT NOT NULL,
    FOREIGN KEY (id_billing) REFERENCES billing(id_billing),
    FOREIGN KEY (id_barang) REFERENCES inventori(id_barang)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel transaksi
CREATE TABLE IF NOT EXISTS transaksi (
    id_transaksi INT AUTO_INCREMENT PRIMARY KEY,
    id_billing INT UNIQUE,
    total_sewa INT NOT NULL DEFAULT 0,
    total_menu INT NOT NULL DEFAULT 0,
    total_bayar INT NOT NULL DEFAULT 0,
    metode_pembayaran ENUM('cash', 'qris', 'transfer') NOT NULL,
    tanggal_transaksi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_billing) REFERENCES billing(id_billing)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabel log_aktivitas
CREATE TABLE IF NOT EXISTS log_aktivitas (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    aktivitas TEXT NOT NULL,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Data (Password default: 'pemilik123' dan 'pegawai123' terenkripsi password_hash)
INSERT INTO users (username, password, nama_lengkap, role) VALUES
('pemilik', '$2y$10$U5RscIeJ/7mfeP/QvXU0tOP7iMv6.QG1X6w/Yn0n9Pq1Gk0uM7U.2', 'Budi Santoso', 'pemilik'),
('pegawai', '$2y$10$7Rms9F5I6eXm8P.L/9vXUuL2iDv8.QG1X6w/Yn0n9Pq1Gk0uM7U.2', 'Agus Pratama', 'pegawai');

-- Seed 8 PlayStation TV Slots
INSERT INTO konsol_tv (nama_tv, jenis_konsol, status) VALUES
('TV-01', 'PlayStation 5', 'kosong'),
('TV-02', 'PlayStation 5', 'kosong'),
('TV-03', 'PlayStation 5', 'kosong'),
('TV-04', 'PlayStation 5', 'kosong'),
('TV-05', 'PlayStation 4 Pro', 'kosong'),
('TV-06', 'PlayStation 4 Pro', 'kosong'),
('TV-07', 'PlayStation 4 Pro', 'kosong'),
('TV-08', 'PlayStation 4 Pro', 'kosong');

-- Seed Starting Inventory
INSERT INTO inventori (nama_barang, stok_saat_ini, safety_stock, harga_grosir, harga_eceran, jumlah_terjual) VALUES
('Indomie Goreng + Telur', 14, 25, 3000, 7000, 142),
('Kopi Susu Es', 30, 15, 2000, 5000, 98),
('Teh Botol Sosro', 8, 20, 1500, 4000, 110),
('Coca Cola 250ml', 25, 15, 2500, 5000, 64),
('Kentang Goreng Sumo', 5, 15, 4000, 10000, 125);
