# Web Absensi Karyawan

Sistem Absensi Karyawan dengan tampilan modern dan clean, dibangun menggunakan React + Tailwind CSS untuk frontend dan Node.js + Express + MySQL + Prisma untuk backend.

## 🚀 Tech Stack Lengkap

### Backend 🟢
- **Runtime**: Node.js 18+ dengan Express.js
- **Database**: MySQL 8.0+ dengan Prisma ORM
- **Authentication**: JWT (JSON Web Token) + BCrypt.js
- **Validation**: Express-validator untuk input sanitization
- **File Export**: PDFKit (PDF) + Json2CSV (CSV)
- **Date Handling**: Date-fns untuk manipulasi tanggal
- **Security**: CORS, Helmet, Rate limiting ready
- **Development**: Nodemon untuk hot reload

### Frontend 🔵
- **Framework**: React 18 dengan Vite (build tool)
- **Styling**: Tailwind CSS dengan custom design system
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **HTTP Client**: Axios dengan interceptors
- **Icons**: Lucide React (modern icon library)
- **Notifications**: React Hot Toast
- **Utilities**: clsx untuk conditional classes
- **Type Safety**: TypeScript ready

### DevOps & Tools 🔧
- **Version Control**: Git dengan conventional commits
- **Package Manager**: npm dengan lockfile
- **Code Quality**: ESLint + Prettier ready
- **Environment**: dotenv untuk config management
- **API Testing**: Thunder Client / Postman
- **Database GUI**: phpMyAdmin / MySQL Workbench

## 📋 Fitur Lengkap

### 🔐 1. Authentication System
- **Multi-role login**: Admin & Employee
- **JWT authentication** dengan secure token storage
- **Auto logout** pada token expired
- **Protected routes** berdasarkan role

### 👥 2. Master Data Pegawai (Admin Only)
- **CRUD lengkap**: Tambah, edit, hapus, view pegawai
- **Advanced filtering**: Berdasarkan departemen, status aktif
- **Search functionality**: Cari berdasarkan nama, NIP, jabatan
- **Pagination**: Handling data besar dengan efisien
- **Field lengkap**: NIP, Nama, Jabatan, Departemen, Jam kerja, Status

### 📊 3. Modul Absensi Real-time
- **Check-in/Check-out**: Sekali per hari dengan validasi
- **4 Status absensi**: Hadir, Izin (wajib keterangan), Sakit (wajib keterangan), Alfa
- **Perhitungan otomatis**:
  - ✅ **Jam kerja standar**: 08:00 - 17:00
  - ⚠️ **Deteksi keterlambatan**: Check-in > 08:00
  - 💰 **Perhitungan lembur**: Check-out > 17:00
- **Visual indicators**: Badge untuk status terlambat/lembur
- **Riwayat lengkap**: Filter tanggal, bulan, status absensi

### 📈 4. Laporan & Analytics
- **Rekap bulanan**: Per pegawai dengan summary lengkap
- **Business logic**: Weekend & hari libur tidak dihitung
- **Export premium**: CSV & PDF dengan formatting profesional
- **Metrics lengkap**: Total hadir, izin, sakit, alfa, jam kerja, lembur
- **Dashboard insights**: Visualisasi data kehadiran

### 🎯 5. Role-based Access Control
- **Admin**: Full access (CRUD pegawai, semua absensi, laporan global)
- **Employee**: Limited access (check-in/out sendiri, laporan pribadi)
- **Secure API**: Middleware authentication & authorization
- **Data isolation**: Employee hanya bisa akses data sendiri

### 🎨 6. Modern UI/UX
- **Responsive design**: Mobile-first, tablet, desktop
- **Clean interface**: Tailwind CSS dengan design system konsisten
- **Loading states**: User feedback untuk semua async operations
- **Toast notifications**: Success/error messages
- **Intuitive navigation**: Easy-to-use interface

## 🛠️ Instalasi & Setup

### Prerequisites
- **Node.js** 16+ (recommended: 18+)
- **MySQL Server** 8.0+ (atau gunakan XAMPP untuk mudah)
- **npm** atau **yarn**

### Quick Start

#### 1. Clone & Install
```bash
# Clone repository
git clone <repository-url>
cd absensi-app

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

#### 2. Setup Database
```bash
# Masuk ke folder backend
cd backend

# Setup environment (edit sesuai MySQL Anda)
# DATABASE_URL="mysql://root:@localhost:3306/absensi_db"
# JWT_SECRET="your-secret-key"

# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# Seed data dummy (10 employees, 2 tahun absensi)
npm run db:seed
```

#### 3. Jalankan Aplikasi
```bash
# Terminal 1: Backend
cd backend && npm run dev
# Server: http://localhost:5000

# Terminal 2: Frontend
cd frontend && npm run dev
# App: http://localhost:3000
```

### Detailed Setup

#### MySQL Setup (Pilih salah satu):

**Opsi 1: MySQL Installer**
1. Download dari https://dev.mysql.com/downloads/installer/
2. Install MySQL Server
3. Buat database `absensi_db`
4. Set root password (atau kosong)

**Opsi 2: XAMPP (Recommended untuk Windows)**
1. Download XAMPP dari https://www.apachefriends.org/
2. Install dan jalankan XAMPP
3. Start **MySQL** module
4. Buka phpMyAdmin → Buat database `absensi_db`

#### Environment Configuration:
```env
# backend/.env
DATABASE_URL="mysql://root:@localhost:3306/absensi_db"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

### Sample Login Credentials

**Admin:**
- Email: `admin@absensi.com`
- Password: `admin123`

**Employees:**
- Email: `emp001@absensi.com` - `emp010@absensi.com`
- Password: `employee123`

### Data Dummy Lengkap

Database sudah diisi dengan data realistis:
- **10 Karyawan** dengan berbagai departemen (IT, Design, HR, Finance, Marketing)
- **Data absensi 2 tahun** (Januari 2025 - Desember 2026) dengan variasi:
  - **Rajin**: Hadir tepat waktu, jarang izin
  - **Terlambat**: Sering terlambat 15-120 menit
  - **Lembur**: Sering lembur, terutama busy season
  - **Izin**: Sering izin dengan berbagai alasan
  - **Sakit**: Sering sakit dengan berbagai penyakit
  - **Freelancer**: Jam kerja fleksibel, pola tidak teratur
- **Hari libur nasional** lengkap 2025-2026
- **Status absensi**: Hadir, Izin, Sakit, Alfa dengan proporsi realistis
- **Perhitungan otomatis**: Terlambat, lembur, total jam kerja

### Project Structure
```
absensi-app/
├── backend/           # 🟢 Node.js + Express API Server
│   ├── README.md     # 📖 Backend documentation
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth & validation
│   │   └── config/       # Database config
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.js       # Sample data generator
│   └── package.json
├── frontend/         # 🔵 React + Tailwind CSS Client
│   ├── README.md     # 📖 Frontend documentation
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   └── services/     # API services
│   └── package.json
└── README.md         # 📋 Main project documentation
```

## 🔌 API Endpoints Overview

### Authentication 🔐
```
POST   /api/auth/login              - User login
GET    /api/auth/me                 - Get current user profile
PUT    /api/auth/change-password    - Change user password
```

### Pegawai Management 👥 (Admin Only)
```
GET    /api/pegawai                  - List pegawai (pagination, filter, search)
GET    /api/pegawai/:id              - Get pegawai detail
POST   /api/pegawai                  - Create new pegawai
PUT    /api/pegawai/:id              - Update pegawai
DELETE /api/pegawai/:id              - Delete pegawai
```

### Absensi System 📊
```
GET    /api/absensi                  - List absensi records (filter by date, status)
POST   /api/absensi/checkin          - Check-in absensi
PUT    /api/absensi/checkout         - Check-out absensi
GET    /api/absensi/:id              - Get absensi detail
PUT    /api/absensi/:id              - Update absensi (admin only)
```

### Laporan & Export 📈
```
GET    /api/laporan/bulanan          - Monthly attendance report
GET    /api/laporan/rekap            - Overall attendance summary
GET    /api/laporan/export/csv       - Export report to CSV
GET    /api/laporan/export/pdf       - Export report to PDF
```

### Hari Libur 🗓️ (Admin Only)
```
GET    /api/hari-libur               - List holiday records
POST   /api/hari-libur               - Add new holiday
PUT    /api/hari-libur/:id           - Update holiday
DELETE /api/hari-libur/:id           - Delete holiday
```

### Request Jam Bulanan ⏰ (Freelancer)
```
GET    /api/request-jam-bulanan              - List overtime requests
POST   /api/request-jam-bulanan              - Create new request
PUT    /api/request-jam-bulanan/:id          - Update request
GET    /api/request-jam-bulanan/:id/approve  - Approve request (admin)
GET    /api/request-jam-bulanan/:id/reject   - Reject request (admin)
```

### System Health 🏥
```
GET    /api/health                   - API health check
```

**📝 Notes:**
- Semua endpoint (kecuali `/api/auth/login`) memerlukan `Authorization: Bearer <token>`
- Admin endpoints akan return 403 Forbidden untuk user biasa
- Response format: `{ success: boolean, message: string, data: object }`

## 💾 Database Schema

### Users (Authentication)
```sql
- id: INT (Primary Key, Auto Increment)
- email: VARCHAR(255) UNIQUE
- password: VARCHAR(255) (Hashed)
- role: ENUM('ADMIN', 'EMPLOYEE')
- pegawaiId: INT (Foreign Key, Nullable)
- createdAt, updatedAt: DATETIME
```

### Pegawai (Employee Master Data)
```sql
- id: INT (Primary Key, Auto Increment)
- nip: VARCHAR(20) UNIQUE
- nama: VARCHAR(255)
- jabatan: VARCHAR(100)
- departemen: VARCHAR(100)
- jamMasuk: TIME DEFAULT '08:00'
- jamPulang: TIME DEFAULT '17:00'
- statusAktif: BOOLEAN DEFAULT TRUE
- tipePembayaran: ENUM('TETAP', 'PERJAM')
- tarifPerJam: INT (Nullable)
- userId: INT (Foreign Key, Nullable)
- createdAt, updatedAt: DATETIME
```

### Absensi (Attendance Records)
```sql
- id: INT (Primary Key, Auto Increment)
- pegawaiId: INT (Foreign Key)
- tanggal: DATE
- jamMasuk: DATETIME (Nullable)
- jamPulang: DATETIME (Nullable)
- status: ENUM('HADIR', 'IZIN', 'SAKIT', 'ALFA')
- keterangan: TEXT (Nullable)
- terlambat: INT DEFAULT 0 (minutes)
- lembur: INT DEFAULT 0 (minutes)
- totalJamKerja: INT DEFAULT 0 (minutes)
- createdAt, updatedAt: DATETIME
```

### HariLibur (National Holidays)
```sql
- id: INT (Primary Key, Auto Increment)
- tanggal: DATE UNIQUE
- keterangan: VARCHAR(255)
- createdAt: DATETIME
```

### RequestJamBulanan (Overtime Requests)
```sql
- id: INT (Primary Key, Auto Increment)
- pegawaiId: INT (Foreign Key)
- bulan: INT (1-12)
- tahun: INT
- totalJam: INT
- deskripsi: TEXT (Nullable)
- status: ENUM('PENDING', 'APPROVED', 'REJECTED')
- alasanReject: TEXT (Nullable)
- approvedBy: INT (Nullable)
- approvedAt: DATETIME (Nullable)
- createdAt, updatedAt: DATETIME
```

### RequestJamBulananDetail (Daily Overtime Details)
```sql
- id: INT (Primary Key, Auto Increment)
- requestId: INT (Foreign Key)
- tanggal: DATE
- jamCheckin: DATETIME (Nullable)
- jamCheckout: DATETIME (Nullable)
- jamKerja: FLOAT
- deskripsi: TEXT (Nullable)
- createdAt: DATETIME
```
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

## 🧪 Testing & Development

### API Testing dengan cURL:
```bash
# Login sebagai admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@absensi.com","password":"admin123"}'

# Get data pegawai (gunakan token dari response login)
curl -X GET http://localhost:5000/api/pegawai \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend Development:
```bash
cd frontend
npm run dev      # Hot reload development server
npm run build    # Production build
npm run preview  # Preview production build
```

### Database Management:
```bash
cd backend
npm run db:push      # Update schema tanpa migration
npm run db:migrate   # Create migration file
npm run db:seed      # Reset & seed data dummy
npm run db:generate  # Regenerate Prisma client
```

## 🔧 Troubleshooting

### Common Issues:

**1. Database Connection Error:**
```
Error: P1001: Can't reach database server
```
**Solution:**
- Pastikan MySQL server running
- Check DATABASE_URL di `.env`
- Verify database `absensi_db` exists

**2. Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Kill process on port 5000
npx kill-port 5000
# Or change PORT in .env
```

**3. CORS Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Backend server harus running di port 5000
- Check VITE_API_URL di frontend/.env

**4. Authentication Failed:**
```
401 Unauthorized
```
**Solution:**
- Check JWT_SECRET di backend/.env
- Clear localStorage dan login ulang
- Verify token belum expired

**5. Build Error:**
```
Module not found
```
**Solution:**
```bash
# Clear cache dan reinstall
cd frontend && rm -rf node_modules package-lock.json
npm install
```

### Performance Tips:
- Gunakan pagination untuk data besar
- Implementasi lazy loading untuk images
- Optimize bundle size dengan code splitting
- Cache API responses

## 🚀 Deployment

### Backend Deployment:
```bash
cd backend
npm run db:push  # Setup production database
npm start        # Production server
```

### Frontend Deployment:
```bash
cd frontend
npm run build    # Build static files
# Deploy dist/ folder ke web server
```

### Environment Variables Production:
```env
# Backend
NODE_ENV=production
DATABASE_URL="mysql://user:pass@host:port/dbname"
JWT_SECRET="strong-production-secret"

# Frontend
VITE_API_URL=https://your-api-domain.com/api
```

## 📚 Additional Resources

- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 License

Project created by Nanda Hafiza Y for assessment test cubiconia
