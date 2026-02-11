import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pegawai from './pages/Pegawai';
import Absensi from './pages/Absensi';
import Laporan from './pages/Laporan';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Role-based Route Component
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized</h1>
                <p className="text-gray-600">You don't have permission to access this page.</p>
              </div>
            </div>
          } />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <RoleBasedRouter />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Role-based Router Component
const RoleBasedRouter = () => {
  const { user } = useAuth();
  
  if (user?.role === 'ADMIN') {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/pegawai" element={<Pegawai />} />
          <Route path="/admin/absensi" element={<Absensi />} />
          <Route path="/admin/laporan" element={<Laporan />} />
          {/* Redirect old paths */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/pegawai" element={<Navigate to="/admin/pegawai" replace />} />
          <Route path="/absensi" element={<Navigate to="/admin/absensi" replace />} />
          <Route path="/laporan" element={<Navigate to="/admin/laporan" replace />} />
        </Routes>
      </Layout>
    );
  }
  
  if (user?.role === 'EMPLOYEE') {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/employee/dashboard" element={<Dashboard />} />
          <Route path="/employee/absensi" element={<Absensi />} />
          <Route path="/employee/laporan" element={<Laporan />} />
          {/* Redirect old paths */}
          <Route path="/dashboard" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/absensi" element={<Navigate to="/employee/absensi" replace />} />
          <Route path="/laporan" element={<Navigate to="/employee/laporan" replace />} />
          {/* Block admin routes */}
          <Route path="/admin/*" element={<Navigate to="/unauthorized" replace />} />
          <Route path="/pegawai" element={<Navigate to="/unauthorized" replace />} />
        </Routes>
      </Layout>
    );
  }
  
  return <Navigate to="/login" replace />;
};

export default App;
