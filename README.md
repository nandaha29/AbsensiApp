# Web Absensi Karyawan

Sistem Absensi Karyawan dengan tampilan modern dan clean, dibangun menggunakan React + Tailwind CSS untuk frontend dan Node.js + Express + MySQL + Prisma untuk backend.

## 🚀 Tech Stack

### Frontend
- React 18
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React Icons
- Date-fns
- React Hot Toast

### Backend
- Node.js + Express
- MySQL
- Prisma ORM
- JWT Authentication
- BCrypt.js
- PDFKit
- Json2CSV

## 📋 Fitur

### 1. Master Data Pegawai (CRUD)
- Tambah, Edit, Hapus pegawai
- List pegawai dengan pagination
- Filter berdasarkan departemen
- Search nama, NIP, jabatan
- Field: NIP, Nama, Jabatan, Departemen, Jam Kerja, Status

### 2. Modul Absensi
- **Check-in / Check-out** - sekali per hari
- **Status Absensi**: Hadir, Izin (wajib keterangan), Sakit (wajib keterangan), Alfa
- **Perhitungan Otomatis**:
  - Jam kerja standar: 08:00 - 17:00
  - Deteksi keterlambatan (check-in > 08:00)
  - Perhitungan lembur (check-out > 17:00)
- **Notifikasi Badge**: Terlambat, Lembur
- **Riwayat Absensi**: filter tanggal, bulan, status

### 3. Laporan Bulanan
- Rekap absensi per pegawai
- Weekend (Sabtu & Minggu) tidak dihitung
- Hari libur nasional tidak dihitung
- Summary: Total hadir, izin, sakit, alfa, jam kerja, lembur
- **Export CSV & PDF**

### 4. Role-based Access
- **Admin**: Full access (CRUD pegawai, lihat semua absensi, laporan)
- **Employee**: Check-in/out, lihat absensi sendiri, laporan sendiri

## 🛠️ Instalasi & Setup

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm atau yarn

### 1. Clone Repository
```bash
cd d:\my-code\1_home\test-code-cubiconiaaa
```

### 2. Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env sesuai konfigurasi MySQL Anda
# DATABASE_URL="mysql://root:password@localhost:3306/absensi_db"

# Generate Prisma Client
npm run db:generate

# Push schema ke database (create tables)
npm run db:push

# Seed data awal
npm run db:seed

# Jalankan server backend
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

### 3. Setup Frontend

```bash
# Buka terminal baru, masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## 🔐 Demo Credentials

### Admin
- Email: `admin@absensi.com`
- Password: `admin123`

### Pegawai (contoh)
- Email: `emp001@absensi.com`
- Password: `employee123`

## 📁 Struktur Project

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Seed data
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js    # Prisma client
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── pegawai.controller.js
│   │   │   ├── absensi.controller.js
│   │   │   ├── laporan.controller.js
│   │   │   └── hariLibur.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── pegawai.routes.js
│   │   │   ├── absensi.routes.js
│   │   │   ├── laporan.routes.js
│   │   │   └── hariLibur.routes.js
│   │   └── index.js           # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Reusable components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── SearchInput.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   └── index.js
│   │   │   └── Layout.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Pegawai.jsx
│   │   │   ├── Absensi.jsx
│   │   │   └── Laporan.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Pegawai (Admin only for CUD)
- `GET /api/pegawai` - List all pegawai
- `GET /api/pegawai/:id` - Get pegawai by ID
- `POST /api/pegawai` - Create pegawai
- `PUT /api/pegawai/:id` - Update pegawai
- `DELETE /api/pegawai/:id` - Delete pegawai
- `GET /api/pegawai/departemen` - Get departemen list

### Absensi
- `POST /api/absensi/check-in` - Check in
- `POST /api/absensi/check-out` - Check out
- `GET /api/absensi/today/:pegawaiId` - Get today's status
- `GET /api/absensi/today` - Get all today's attendance (Admin)
- `GET /api/absensi/history` - Get attendance history
- `PUT /api/absensi/:id` - Update attendance (Admin)

### Laporan
- `GET /api/laporan/monthly` - Get monthly report
- `GET /api/laporan/dashboard` - Get dashboard stats
- `GET /api/laporan/export/csv` - Export to CSV
- `GET /api/laporan/export/pdf` - Export to PDF

### Hari Libur (Admin only)
- `GET /api/hari-libur` - Get all holidays
- `POST /api/hari-libur` - Create holiday
- `DELETE /api/hari-libur/:id` - Delete holiday

## 📊 Database Schema

### User
- id, email, password, role (ADMIN/EMPLOYEE)

### Pegawai
- id, nip, nama, jabatan, departemen, jamMasuk, jamPulang, statusAktif

### Absensi
- id, pegawaiId, tanggal, jamMasuk, jamPulang, status, keterangan, terlambat, lembur, totalJamKerja

### HariLibur
- id, tanggal, keterangan

## 📝 Notes

- Sistem menggunakan waktu lokal server
- Weekend (Sabtu & Minggu) otomatis tidak dihitung dalam laporan
- Hari libur nasional dapat dikelola oleh Admin
- Export PDF menggunakan landscape orientation untuk tabel yang lebih lebar

## 📄 License

Project created by Nanda Hafiza Y
