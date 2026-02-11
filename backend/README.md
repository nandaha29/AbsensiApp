# Absensi Backend API

Backend API untuk sistem absensi karyawan yang dibangun dengan Node.js, Express, dan Prisma ORM.

## 🚀 Tech Stack

- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **Prisma** - ORM untuk database
- **MySQL** - Database utama
- **JWT** - Authentication
- **BCrypt.js** - Password hashing
- **PDFKit** - Generate PDF reports
- **Json2CSV** - Export CSV reports

## 📋 Prerequisites

- Node.js (v16 atau lebih baru)
- MySQL Server
- npm atau yarn

## 🛠️ Setup & Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd absensi-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Buat file `.env` di root folder:
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/absensi_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development
```

### 4. Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# Seed data awal
npm run db:seed
```

### 5. Jalankan Server
```bash
# Development mode (dengan nodemon)
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:5000`

## 📊 Database Schema

### Models Utama:
- **User** - Authentication (Admin & Employee)
- **Pegawai** - Master data karyawan
- **Absensi** - Record absensi harian
- **HariLibur** - Hari libur nasional
- **RequestJamBulanan** - Request jam kerja bulanan (freelancer)
- **RequestJamBulananDetail** - Detail harian request jam kerja

### Sample Data:
- 1 Admin user: `admin@absensi.com` / `admin123`
- 10 Employee dengan berbagai skenario
- Data absensi 2025-2026 (2 tahun)
- Hari libur nasional lengkap

## 🔐 API Endpoints

### Authentication
```
POST /api/auth/login          - Login user
GET  /api/auth/me            - Get current user info
PUT  /api/auth/change-password - Change password
```

### Pegawai (Admin Only)
```
GET    /api/pegawai           - List pegawai (dengan pagination, filter, search)
GET    /api/pegawai/:id       - Detail pegawai
POST   /api/pegawai           - Tambah pegawai
PUT    /api/pegawai/:id       - Update pegawai
DELETE /api/pegawai/:id       - Hapus pegawai
```

### Absensi
```
GET    /api/absensi           - List absensi (dengan filter)
POST   /api/absensi/checkin   - Check-in absensi
PUT    /api/absensi/checkout  - Check-out absensi
GET    /api/absensi/:id       - Detail absensi
PUT    /api/absensi/:id       - Update absensi (admin only)
```

### Laporan
```
GET /api/laporan/bulanan      - Laporan bulanan per pegawai
GET /api/laporan/rekap        - Rekap absensi keseluruhan
GET /api/laporan/export/csv   - Export laporan ke CSV
GET /api/laporan/export/pdf   - Export laporan ke PDF
```

### Hari Libur (Admin Only)
```
GET    /api/hari-libur        - List hari libur
POST   /api/hari-libur        - Tambah hari libur
PUT    /api/hari-libur/:id    - Update hari libur
DELETE /api/hari-libur/:id    - Hapus hari libur
```

### Request Jam Bulanan (Freelancer)
```
GET    /api/request-jam-bulanan           - List request
POST   /api/request-jam-bulanan           - Buat request baru
PUT    /api/request-jam-bulanan/:id       - Update request
GET    /api/request-jam-bulanan/:id/approve - Approve request (admin)
GET    /api/request-jam-bulanan/:id/reject  - Reject request (admin)
```

## 🔒 Authentication

API menggunakan JWT (JSON Web Token) untuk authentication:

1. **Login** untuk mendapatkan token
2. Sertakan token di header: `Authorization: Bearer <token>`
3. Token berlaku 7 hari (dapat dikonfigurasi)

### Middleware:
- `authMiddleware` - Validasi JWT token
- `adminMiddleware` - Validasi role admin

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js           # Sample data seeder
├── src/
│   ├── config/
│   │   └── database.js   # Prisma client setup
│   ├── controllers/      # Business logic
│   │   ├── auth.controller.js
│   │   ├── pegawai.controller.js
│   │   ├── absensi.controller.js
│   │   ├── laporan.controller.js
│   │   ├── hariLibur.controller.js
│   │   └── requestJamBulanan.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── routes/           # API routes
│   │   ├── auth.routes.js
│   │   ├── pegawai.routes.js
│   │   ├── absensi.routes.js
│   │   ├── laporan.routes.js
│   │   ├── hariLibur.routes.js
│   │   └── requestJamBulanan.routes.js
│   └── index.js          # Main server file
├── .env                  # Environment variables
└── package.json
```

## 🧪 Testing API

### Menggunakan cURL:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@absensi.com","password":"admin123"}'

# Get current user (gunakan token dari response login)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Sample Login Credentials:

**Admin:**
- Email: `admin@absensi.com`
- Password: `admin123`

**Employees:**
- Email: `emp001@absensi.com` sampai `emp010@absensi.com`
- Password: `employee123`

## 📊 Data Dummy

Database sudah diisi dengan data dummy yang realistis:

- **10 Karyawan** dengan berbagai departemen dan jabatan
- **Data absensi 2 tahun** (2025-2026) dengan variasi:
  - Pola kehadiran yang berbeda per karyawan
  - Status: Hadir, Izin, Sakit, Alfa
  - Variasi jam kerja, keterlambatan, lembur
- **Hari libur nasional** lengkap
- **Request jam bulanan** untuk freelancer

## 🚀 Deployment

### Environment Variables untuk Production:
```env
NODE_ENV=production
DATABASE_URL="mysql://user:pass@host:port/dbname"
JWT_SECRET="strong-secret-key"
PORT=5000
```

### Build & Run:
```bash
npm run db:generate
npm run db:push
npm start
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

This project is licensed under the MIT License.</content>
<parameter name="filePath">d:\my-code\1_home\test-code-cubiconiaaa\backend\README.md