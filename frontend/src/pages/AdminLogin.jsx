import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Clock, Mail, Lock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@absensi.com',
    password: 'admin123',
  });

  // Redirect if already logged in as admin
  if (user && user.role === 'ADMIN') {
    navigate('/admin/dashboard');
    return null;
  }

  // Redirect if logged in as employee
  if (user && user.role === 'EMPLOYEE') {
    navigate('/employee/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login admin berhasil!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-red-600">Admin</span>
            <span className="text-gray-600"> Login</span>
          </h1>
          <p className="text-gray-600 mt-2">Masuk sebagai Administrator</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@absensi.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              icon={Mail}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Masukkan password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              icon={Lock}
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-red-600 hover:bg-red-700"
              icon={Shield}
            >
              Login sebagai Admin
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ingin login sebagai employee?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Klik di sini
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;