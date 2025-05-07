\# 🏠 Aplikasi Rental Properti (Apartemen, Kos, Rumah)

Aplikasi web untuk membantu pemilik properti memasarkan apartemen,
rumah, atau kos-kosan, serta memungkinkan penyewa mencari dan
menghubungi pemilik properti.

\## ✨ Fitur Utama

\- \*\*Autentikasi dan Otorisasi\*\* (JWT)  - Role: Pemilik Properti &
Penyewa - \*\*Manajemen Properti\*\*  - CRUD Properti: Tipe, Nama,
Deskripsi, Harga, Lokasi, Gambar - \*\*Pencarian dan Listing\*\*  -
Filter berdasarkan tipe & lokasi  - Halaman detail properti - \*\*Fitur
Kontak\*\*  - Penyewa bisa mengirim pesan ke pemilik  - Pesan tersimpan
dalam database

\-\--

\## 📦 Teknologi yang Digunakan

\| Layer \| Teknologi \|
\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\|\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--\| \|
Backend \| ExpressJS \| \| Frontend \| ReactJS \| \| Styling \|
TailwindCSS \| \| Database \| PostgreSQL \| \| Autentikasi \| JWT \|

\-\--

\## 🚀 Menjalankan Aplikasi Secara Lokal

\### 1. Clone Repositori

\`\`\`bash git clone -b master
https://github.com/Jeonjareinji/rental-app.git cd rental-app npm install

2\. Setup ENV DB_HOST=localhost DB_PORT=yourdbport DB_USER=yourusername
DB_PASSWORD=yourpassword DB_NAME=yourdbname JWT_SECRET=yourjwtsecretname

\# Server Configuration PORT=5000 NODE_ENV=development

3\. Menyiapkan Database npx drizzle-kit generate npx drizzle-kit push
npm run db:seed

4\. Menjalankan Aplikasi npm run dev

👥 Sample Akun 1. Akun Pemilik Properti (Owner):

Email: owner@example.com

Password: password123

2\. Akun Penyewa (Tenant):

Email: tenant@example.com

Password: password123
