import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { laporanAPI, absensiAPI } from '../services/api';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Badge,
  Button 
} from '../components/ui';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Timer
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Dashboard = () => {
  const { user, isAdmin, pegawaiId } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsRes = await laporanAPI.getDashboard();
      setStats(statsRes.data.data);

      // Fetch today's status for current employee
      if (pegawaiId) {
        const statusRes = await absensiAPI.getTodayStatus(pegawaiId);
        setTodayStatus(statusRes.data.data);
      }
    } catch (error) {
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      await absensiAPI.checkIn({
        pegawaiId: pegawaiId,
        status: 'HADIR',
      });
      toast.success('Check-in berhasil!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in gagal');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      await absensiAPI.checkOut({
        pegawaiId: pegawaiId,
      });
      toast.success('Check-out berhasil!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out gagal');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Pegawai',
      value: stats?.totalPegawai || 0,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Hadir Hari Ini',
      value: stats?.today?.hadir || 0,
      icon: UserCheck,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Belum Absen',
      value: stats?.today?.belumAbsen || 0,
      icon: UserX,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Terlambat',
      value: stats?.today?.terlambat || 0,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">Selamat Datang Kembali</p>
            <h1 className="text-2xl font-bold">
              {isAdmin ? 'Admin' : user?.pegawai?.nama}
              <span className="text-orange-400">!</span>
            </h1>
            <p className="text-blue-100 text-sm mt-2">
              {format(new Date(), "EEEE, d MMMM yyyy", { locale: id })}
            </p>
          </div>
          
          {/* Quick Check-in/out for Employees */}
          {!isAdmin && pegawaiId && (
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              {!todayStatus?.hasCheckedIn ? (
                <Button
                  variant="success"
                  onClick={handleCheckIn}
                  loading={checkingIn}
                  icon={Clock}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Check In
                </Button>
              ) : !todayStatus?.hasCheckedOut ? (
                <Button
                  variant="danger"
                  onClick={handleCheckOut}
                  loading={checkingOut}
                  icon={Clock}
                  className="bg-white text-red-600 hover:bg-red-50"
                >
                  Check Out
                </Button>
              ) : (
                <Badge variant="success" className="bg-white/20 text-white py-2 px-4">
                  ✓ Sudah Check-out
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Today's Status Card for Employee */}
      {!isAdmin && todayStatus?.hasCheckedIn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Status Absensi Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Jam Masuk</p>
                <p className="text-lg font-semibold text-gray-900">
                  {todayStatus?.jamMasuk 
                    ? format(new Date(todayStatus.jamMasuk), 'HH:mm')
                    : '-'}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Jam Pulang</p>
                <p className="text-lg font-semibold text-gray-900">
                  {todayStatus?.jamPulang 
                    ? format(new Date(todayStatus.jamPulang), 'HH:mm')
                    : '-'}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <Badge variant={
                  todayStatus?.status === 'HADIR' ? 'success' :
                  todayStatus?.status === 'IZIN' ? 'info' :
                  todayStatus?.status === 'SAKIT' ? 'warning' : 'danger'
                }>
                  {todayStatus?.status}
                </Badge>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Keterangan</p>
                {todayStatus?.terlambatFormatted && (
                  <Badge variant="warning">{todayStatus.terlambatFormatted}</Badge>
                )}
                {todayStatus?.lemburFormatted && (
                  <Badge variant="purple">{todayStatus.lemburFormatted}</Badge>
                )}
                {!todayStatus?.terlambatFormatted && !todayStatus?.lemburFormatted && (
                  <span className="text-gray-500">-</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards - Admin Only */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Monthly Stats - Admin */}
      {isAdmin && stats?.monthly && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Statistik Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Kehadiran</span>
                  <span className="font-semibold text-green-600">{stats.monthly.totalHadir}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Izin</span>
                  <span className="font-semibold text-blue-600">{stats.monthly.totalIzin}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Sakit</span>
                  <span className="font-semibold text-yellow-600">{stats.monthly.totalSakit}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Terlambat</span>
                  <span className="font-semibold text-red-600">{stats.monthly.totalTerlambat}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Timer className="w-5 h-5 mr-2 text-purple-600" />
                Ringkasan Waktu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 mb-1">Total Lembur Bulan Ini</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {Math.floor((stats.monthly.totalLembur || 0) / 60)} jam {(stats.monthly.totalLembur || 0) % 60} menit
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-xs text-blue-600 mb-1">Izin Hari Ini</p>
                    <p className="text-xl font-bold text-blue-700">{stats.today.izin}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg text-center">
                    <p className="text-xs text-yellow-600 mb-1">Sakit Hari Ini</p>
                    <p className="text-xl font-bold text-yellow-700">{stats.today.sakit}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Attendance Summary - Admin */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Absensi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{stats?.today?.hadir || 0}</p>
                <p className="text-sm text-green-600">Hadir</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">{stats?.today?.izin || 0}</p>
                <p className="text-sm text-blue-600">Izin</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-700">{stats?.today?.sakit || 0}</p>
                <p className="text-sm text-yellow-600">Sakit</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <UserX className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{stats?.today?.belumAbsen || 0}</p>
                <p className="text-sm text-red-600">Belum Absen</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-700">{stats?.today?.terlambat || 0}</p>
                <p className="text-sm text-orange-600">Terlambat</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
