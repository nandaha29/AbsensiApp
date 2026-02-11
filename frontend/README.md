# Absensi Frontend

Frontend web application untuk sistem absensi karyawan yang dibangun dengan React, Tailwind CSS, dan Vite.

## 🚀 Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool dan dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notification system
- **Lucide React** - Icon library
- **Date-fns** - Date utility library
- **clsx** - Conditional CSS classes

## 📋 Prerequisites

- Node.js (v16 atau lebih baru)
- npm atau yarn
- Backend API server running (default: http://localhost:5000)

## 🛠️ Setup & Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd absensi-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Buat file `.env` di root folder (opsional):
```env
VITE_API_URL=http://localhost:5000/api
```

Jika tidak ada file `.env`, aplikasi akan menggunakan default URL `http://localhost:5000/api`

### 4. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000` (atau port lain jika 3000 sudah digunakan)

### 5. Build untuk Production
```bash
npm run build
npm run preview  # Preview production build
```

## 🎨 UI Components

### Design System
- **Tailwind CSS** untuk styling
- **Custom components** di folder `src/components/ui/`
- **Responsive design** untuk mobile dan desktop
- **Dark/Light mode ready** (struktur sudah disiapkan)

### Komponen Utama:
- **Button** - Button dengan berbagai variant
- **Input** - Input field dengan icon support
- **Card** - Container card
- **Modal** - Modal dialog
- **Table** - Data table dengan sorting
- **Pagination** - Pagination component
- **Badge** - Status badge
- **SearchInput** - Search input dengan debounce
- **Select** - Dropdown select

## 📱 Pages & Routes

### Public Routes:
```
/
/login              - Pilih jenis login (Admin/Employee)
/admin-login        - Login sebagai Admin
/employee-login     - Login sebagai Employee
```

### Admin Routes (Protected):
```
/admin/dashboard    - Dashboard Admin
/admin/pegawai      - Manajemen Pegawai
/admin/absensi      - Data Absensi
/admin/laporan      - Laporan & Export
```

### Employee Routes (Protected):
```
/employee/dashboard - Dashboard Employee
/employee/absensi   - Riwayat Absensi
/employee/laporan   - Laporan Pribadi
```

## 🔐 Authentication Flow

1. **Login Selection** - User memilih Admin atau Employee login
2. **Authentication** - Login dengan email & password
3. **Token Storage** - JWT token disimpan di localStorage
4. **Auto Redirect** - Redirect ke dashboard sesuai role
5. **Protected Routes** - Route dilindungi dengan Auth Context
6. **Auto Logout** - Logout otomatis jika token expired

### Sample Login Credentials:

**Admin:**
- Email: `admin@absensi.com`
- Password: `admin123`

**Employees:**
- Email: `emp001@absensi.com` sampai `emp010@absensi.com`
- Password: `employee123`

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── SearchInput.jsx
│   │   │   ├── Select.jsx
│   │   │   └── index.js    # Component exports
│   │   └── Layout.jsx      # Main layout component
│   ├── contexts/
│   │   └── AuthContext.jsx # Authentication context
│   ├── pages/              # Page components
│   │   ├── Login.jsx       # Login selection
│   │   ├── AdminLogin.jsx  # Admin login form
│   │   ├── EmployeeLogin.jsx # Employee login form
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── Pegawai.jsx     # Employee management
│   │   ├── Absensi.jsx     # Attendance records
│   │   └── Laporan.jsx     # Reports & export
│   ├── services/
│   │   └── api.js          # API service functions
│   ├── App.jsx             # Main App component
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles
├── index.html              # Vite HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
└── package.json
```

## 🔧 Key Features

### 1. Authentication System
- JWT-based authentication
- Role-based access control (Admin/Employee)
- Auto token refresh
- Secure logout

### 2. Employee Management (Admin)
- CRUD operations untuk data pegawai
- Advanced search & filtering
- Pagination untuk large datasets
- Bulk operations support

### 3. Attendance System
- Real-time check-in/check-out
- Automatic calculation:
  - Working hours
  - Late arrival detection
  - Overtime calculation
- Status management (Present, Leave, Sick, Absent)

### 4. Reporting & Analytics
- Monthly attendance reports
- Export to CSV & PDF
- Visual charts & statistics
- Individual & team reports

### 5. Responsive Design
- Mobile-first approach
- Tablet & desktop optimized
- Touch-friendly interface
- Adaptive layouts

## 🎯 API Integration

### Base Configuration:
```javascript
// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### Available Services:
- **authAPI** - Authentication endpoints
- **pegawaiAPI** - Employee management
- **absensiAPI** - Attendance operations
- **laporanAPI** - Reports & exports

### Error Handling:
- Global error interceptor
- User-friendly error messages
- Auto logout on 401 errors
- Loading states & toast notifications

## 🎨 Styling Guidelines

### Tailwind CSS Classes:
- **Colors**: Blue primary (`blue-500`, `blue-600`), Gray neutrals
- **Spacing**: Consistent spacing scale (4px base)
- **Typography**: Inter font family, responsive text sizes
- **Shadows**: Subtle shadows for depth
- **Borders**: Rounded corners (`rounded-lg`, `rounded-xl`)

### Component Patterns:
- **Props-based styling** dengan clsx
- **Consistent naming** conventions
- **Accessibility** support (ARIA labels, keyboard navigation)
- **Performance** optimized (lazy loading, memoization)

## 🚀 Deployment

### Build untuk Production:
```bash
npm run build
```

### Static Files:
Build output akan ada di folder `dist/` yang siap di-deploy ke:
- **Vercel**
- **Netlify**
- **GitHub Pages**
- **Apache/Nginx server**
- **Docker container**

### Environment Variables untuk Production:
```env
VITE_API_URL=https://your-api-domain.com/api
```

## 🧪 Development

### Available Scripts:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Code Quality:
- **ESLint** untuk code linting
- **Prettier** untuk code formatting
- **TypeScript** support (optional)
- **Component testing** ready

## 🔍 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

### Development Guidelines:
- Gunakan functional components dengan hooks
- Implementasi error boundaries
- Tulis komentar untuk logic kompleks
- Test components di multiple screen sizes
- Follow existing code patterns

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository atau hubungi tim development.</content>
<parameter name="filePath">d:\my-code\1_home\test-code-cubiconiaaa\frontend\README.md