# 🏠 Aplikasi Rental Properti (Apartemen, Kos, Rumah)

Aplikasi web untuk membantu pemilik properti memasarkan apartemen, rumah, atau kos-kosan, dan memungkinkan penyewa mencari serta menghubungi pemilik.

## ✨ Fitur Utama

- **Autentikasi dan Otorisasi** (JWT)
  - Role: Pemilik Properti & Penyewa
- **Manajemen Properti**
  - CRUD Properti: Tipe, Nama, Deskripsi, Harga, Lokasi, Gambar
- **Pencarian dan Listing**
  - Filter berdasarkan tipe & lokasi
  - Halaman detail properti
- **Fitur Kontak**
  - Penyewa bisa mengirim pesan ke pemilik
  - Pesan tersimpan dalam database

---

## 📦 Teknologi yang Digunakan

| Layer     | Teknologi      |
|-----------|----------------|
| Backend   | ExpressJS      |
| Frontend  | ReactJS        |
| Styling   | TailwindCSS    |
| Database  | PostgreSQL     |
| Autentikasi | JWT          |

---

## 🚀 Menjalankan Aplikasi Secara Lokal

### 1. Clone Repositori

```bash
git clone https://github.com/Jeonjareinji/rental-app.git
cd rental-properti-app
npm install

Setup ENV :
DB_HOST=localhost
DB_PORT=yourdbport
DB_USER=yourusername
DB_PASSWORD=yourpassword
DB_NAME=yourdbname
JWT_SECRET=yourjwtsecretname

# Server Configuration
PORT=yourport
NODE_ENV=development

