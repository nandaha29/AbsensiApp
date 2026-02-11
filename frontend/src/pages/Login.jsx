import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui';
import Button from '../components/ui/Button';
import { Clock, Shield, Users, LogOut } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleRoleSelect = (rolePath) => {
    if (user) {
      // If already logged in, logout first then navigate
      logout();
    }
    navigate(rolePath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-blue-600">Absensi</span>
            <span className="text-orange-500">App</span>
          </h1>
<p className='text-sm text-gray-500'>
            Demo App - Sistem Absensi Karyawan
</p>
          <p className="text-gray-600 mt-2">
            {user ? `Sedang login sebagai ${user.role === 'ADMIN' ? 'Admin' : 'Employee'} - Pilih untuk ganti role` : 'Pilih jenis login'}
          </p>
          {user && (
            <div className="mt-2 text-sm text-blue-600 font-medium">
              Klik opsi di bawah untuk logout dan login sebagai role berbeda
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleRoleSelect('/admin-login')}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Login sebagai Admin</h3>
              <p className="text-gray-600 text-sm mb-4">
                Akses penuh ke semua fitur manajemen karyawan dan laporan
              </p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                {user ? 'Ganti ke Admin' : 'Masuk sebagai Admin'}
              </Button>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleRoleSelect('/employee-login')}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Login sebagai Employee</h3>
              <p className="text-gray-600 text-sm mb-4">
                Catat absensi harian dan kelola jam kerja bulanan
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                {user ? 'Ganti ke Employee' : 'Masuk sebagai Employee'}
              </Button>
            </div>
          </Card>
        </div>

        {user && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard')}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Kembali ke Dashboard ({user.role === 'ADMIN' ? 'Admin' : 'Employee'})
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Build on 🔥 by Nandaa
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;