import { useState, useEffect } from 'react';
import { absensiAPI, pegawaiAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
  SearchInput,
  Pagination,
} from '../components/ui';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Calendar,
  Filter,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Absensi = () => {
  const { isAdmin, pegawaiId } = useAuth();
  const [activeTab, setActiveTab] = useState(isAdmin ? 'today' : 'checkin');
  const [loading, setLoading] = useState(true);
  
  // Today's attendance data (Admin)
  const [todayData, setTodayData] = useState(null);
  
  // History data
  const [history, setHistory] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  // Filters
  const [filters, setFilters] = useState({
    pegawaiId: '',
    status: '',
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
  });
  
  // Employee list for filter (Admin)
  const [pegawaiList, setPegawaiList] = useState([]);
  
  // Check-in modal
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInForm, setCheckInForm] = useState({
    pegawaiId: '',
    status: 'HADIR',
    keterangan: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // My today status (Employee)
  const [myTodayStatus, setMyTodayStatus] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetchPegawaiList();
      if (activeTab === 'today') {
        fetchTodayAll();
      } else {
        fetchHistory();
      }
    } else {
      if (activeTab === 'checkin') {
        fetchMyTodayStatus();
      } else {
        fetchHistory();
      }
    }
  }, [isAdmin, pegawaiId, activeTab, filters, historyPagination.page]);

  const fetchPegawaiList = async () => {
    try {
      const response = await pegawaiAPI.getAll({ limit: 100 });
      setPegawaiList(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pegawai list');
    }
  };

  const fetchTodayAll = async () => {
    try {
      setLoading(true);
      const response = await absensiAPI.getTodayAll();
      setTodayData(response.data.data);
    } catch (error) {
      toast.error('Gagal memuat data absensi hari ini');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTodayStatus = async () => {
    if (!pegawaiId) return;
    try {
      setLoading(true);
      const response = await absensiAPI.getTodayStatus(pegawaiId);
      setMyTodayStatus(response.data.data);
    } catch (error) {
      toast.error('Gagal memuat status absensi');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {
        page: historyPagination.page,
        limit: historyPagination.limit,
        bulan: filters.bulan,
        tahun: filters.tahun,
      };
      
      if (!isAdmin) {
        params.pegawaiId = pegawaiId;
      } else if (filters.pegawaiId) {
        params.pegawaiId = filters.pegawaiId;
      }
      
      if (filters.status) {
        params.status = filters.status;
      }

      const response = await absensiAPI.getHistory(params);
      setHistory(response.data.data);
      setHistoryPagination({
        ...historyPagination,
        total: response.data.meta.total,
        totalPages: response.data.meta.totalPages,
      });
    } catch (error) {
      toast.error('Gagal memuat riwayat absensi');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (status = 'HADIR', keterangan = '') => {
    try {
      setSubmitting(true);
      const targetPegawaiId = isAdmin ? checkInForm.pegawaiId : pegawaiId;
      
      if (!targetPegawaiId) {
        toast.error('Pegawai ID tidak valid');
        return;
      }
      
      await absensiAPI.checkIn({
        pegawaiId: parseInt(targetPegawaiId),
        status,
        keterangan,
      });
      toast.success('Check-in berhasil!');
      setShowCheckInModal(false);
      setCheckInForm({ pegawaiId: '', status: 'HADIR', keterangan: '' });
      
      // Refresh data after successful check-in
      if (isAdmin) {
        await fetchTodayAll();
      } else {
        await fetchMyTodayStatus();
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error(error.response?.data?.message || 'Check-in gagal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (targetPegawaiId = null) => {
    try {
      setSubmitting(true);
      const checkoutPegawaiId = targetPegawaiId || pegawaiId;
      
      if (!checkoutPegawaiId) {
        toast.error('Pegawai ID tidak valid');
        return;
      }
      
      await absensiAPI.checkOut({
        pegawaiId: parseInt(checkoutPegawaiId),
      });
      toast.success('Check-out berhasil!');
      
      // Refresh data after successful check-out
      if (isAdmin) {
        await fetchTodayAll();
      } else {
        await fetchMyTodayStatus();
      }
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error(error.response?.data?.message || 'Check-out gagal');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      HADIR: 'success',
      IZIN: 'info',
      SAKIT: 'warning',
      ALFA: 'danger',
    };
    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
  };

  const statusOptions = [
    { value: 'HADIR', label: 'Hadir' },
    { value: 'IZIN', label: 'Izin' },
    { value: 'SAKIT', label: 'Sakit' },
    { value: 'ALFA', label: 'Alfa' },
  ];

  const bulanOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(2024, i), 'MMMM', { locale: id }),
  }));

  const tahunOptions = Array.from({ length: 5 }, (_, i) => ({
    value: new Date().getFullYear() - i,
    label: String(new Date().getFullYear() - i),
  }));

  // Employee Check-in/Check-out View
  const renderEmployeeCheckIn = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none">
        <div className="text-center py-6">
          <Clock className="w-16 h-16 mx-auto mb-4 text-blue-200" />
          <p className="text-blue-100 text-sm mb-2">Waktu Sekarang</p>
          <p className="text-4xl font-bold mb-4">
            {format(new Date(), 'HH:mm:ss')}
          </p>
          <p className="text-blue-100">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
          </p>
        </div>
      </Card>

      {myTodayStatus?.hasCheckedIn ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Status Absensi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <LogIn className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">Jam Masuk</p>
                <p className="text-xl font-bold text-gray-900">
                  {myTodayStatus.jamMasuk 
                    ? format(new Date(myTodayStatus.jamMasuk), 'HH:mm')
                    : '-'}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <LogOut className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">Jam Pulang</p>
                <p className="text-xl font-bold text-gray-900">
                  {myTodayStatus.jamPulang 
                    ? format(new Date(myTodayStatus.jamPulang), 'HH:mm')
                    : '-'}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <ClipboardCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <div className="mt-1">{getStatusBadge(myTodayStatus.status)}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">Keterangan</p>
                <div className="space-y-1">
                  {myTodayStatus.terlambatFormatted && (
                    <Badge variant="warning">{myTodayStatus.terlambatFormatted}</Badge>
                  )}
                  {myTodayStatus.lemburFormatted && (
                    <Badge variant="purple">{myTodayStatus.lemburFormatted}</Badge>
                  )}
                  {!myTodayStatus.terlambatFormatted && !myTodayStatus.lemburFormatted && (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </div>
            </div>

            {!myTodayStatus.hasCheckedOut && myTodayStatus.status === 'HADIR' && (
              <div className="text-center">
                <Button
                  variant="danger"
                  size="lg"
                  onClick={() => handleCheckOut()}
                  loading={submitting}
                  icon={LogOut}
                >
                  Check Out Sekarang
                </Button>
              </div>
            )}

            {myTodayStatus.hasCheckedOut && (
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-green-600 font-medium">
                  ✓ Anda sudah menyelesaikan absensi hari ini
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center mb-6">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600">Anda belum melakukan check-in hari ini</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Button
                variant="success"
                size="lg"
                onClick={() => handleCheckIn('HADIR')}
                loading={submitting}
                icon={LogIn}
                className="py-4"
              >
                Check In - Hadir
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowCheckInModal(true)}
                className="py-4"
              >
                Izin / Sakit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Admin Today View
  const renderAdminToday = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      {todayData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="text-center">
            <p className="text-2xl font-bold text-green-600">{todayData.summary.hadir}</p>
            <p className="text-sm text-gray-500">Hadir</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-blue-600">{todayData.summary.izin}</p>
            <p className="text-sm text-gray-500">Izin</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{todayData.summary.sakit}</p>
            <p className="text-sm text-gray-500">Sakit</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-red-600">{todayData.summary.alfa}</p>
            <p className="text-sm text-gray-500">Belum Absen</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-orange-600">{todayData.summary.terlambat}</p>
            <p className="text-sm text-gray-500">Terlambat</p>
          </Card>
        </div>
      )}

      {/* Attendance List */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Absensi Hari Ini - {todayData?.date}
          </h3>
          <Button size="sm" onClick={() => setShowCheckInModal(true)} icon={Plus}>
            Absensi Manual
          </Button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pegawai</TableHead>
                <TableHead>Jam Masuk</TableHead>
                <TableHead>Jam Pulang</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayData?.attendance.map((item) => (
                <TableRow key={item.pegawai.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{item.pegawai.nama}</p>
                      <p className="text-xs text-gray-500">{item.pegawai.nip}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.absensi?.jamMasukFormatted || '-'}
                  </TableCell>
                  <TableCell>
                    {item.absensi?.jamPulangFormatted || '-'}
                  </TableCell>
                  <TableCell>
                    {item.hasCheckedIn ? (
                      getStatusBadge(item.absensi?.status)
                    ) : (
                      <Badge variant="gray">Belum Absen</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-x-1">
                      {item.absensi?.terlambatFormatted && (
                        <Badge variant="warning">{item.absensi.terlambatFormatted}</Badge>
                      )}
                      {item.absensi?.lemburFormatted && (
                        <Badge variant="purple">{item.absensi.lemburFormatted}</Badge>
                      )}
                      {item.absensi?.keterangan && (
                        <span className="text-sm text-gray-500">{item.absensi.keterangan}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.hasCheckedIn && !item.hasCheckedOut && item.absensi?.status === 'HADIR' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCheckOut(item.pegawai.id)}
                      >
                        Check Out
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );

  // History View
  const renderHistory = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {isAdmin && (
            <Select
              value={filters.pegawaiId}
              onChange={(e) => setFilters({ ...filters, pegawaiId: e.target.value })}
              placeholder="Semua Pegawai"
              options={pegawaiList.map(p => ({ value: p.id, label: p.nama }))}
              className="md:w-48"
            />
          )}
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            placeholder="Semua Status"
            options={statusOptions}
            className="md:w-40"
          />
          <Select
            value={filters.bulan}
            onChange={(e) => setFilters({ ...filters, bulan: parseInt(e.target.value) })}
            options={bulanOptions}
            className="md:w-40"
          />
          <Select
            value={filters.tahun}
            onChange={(e) => setFilters({ ...filters, tahun: parseInt(e.target.value) })}
            options={tahunOptions}
            className="md:w-32"
          />
          <Button variant="secondary" onClick={fetchHistory} icon={Filter}>
            Filter
          </Button>
        </div>
      </Card>

      {/* History Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Calendar className="w-12 h-12 mb-4 text-gray-300" />
            <p>Tidak ada data riwayat absensi</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  {isAdmin && <TableHead>Pegawai</TableHead>}
                  <TableHead>Jam Masuk</TableHead>
                  <TableHead>Jam Pulang</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terlambat</TableHead>
                  <TableHead>Lembur</TableHead>
                  <TableHead>Total Kerja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.tanggalFormatted}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{item.pegawai.nama}</p>
                          <p className="text-xs text-gray-500">{item.pegawai.nip}</p>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>{item.jamMasukFormatted}</TableCell>
                    <TableCell>{item.jamPulangFormatted}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {item.terlambat > 0 ? (
                        <Badge variant="warning">{item.terlambatFormatted}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {item.lembur > 0 ? (
                        <Badge variant="purple">{item.lemburFormatted}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{item.totalJamKerjaFormatted}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {historyPagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination
                  currentPage={historyPagination.page}
                  totalPages={historyPagination.totalPages}
                  onPageChange={(page) => setHistoryPagination({ ...historyPagination, page })}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );

  const Plus = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Absensi</h1>
        <p className="text-gray-500 mt-1">
          {isAdmin ? 'Kelola absensi karyawan' : 'Catat kehadiran Anda'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {isAdmin ? (
          <>
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'today'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Riwayat
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('checkin')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'checkin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Check In/Out
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Riwayat Saya
            </button>
          </>
        )}
      </div>

      {/* Content */}
      {isAdmin ? (
        activeTab === 'today' ? renderAdminToday() : renderHistory()
      ) : (
        activeTab === 'checkin' ? renderEmployeeCheckIn() : renderHistory()
      )}

      {/* Check-in Modal */}
      <Modal
        isOpen={showCheckInModal}
        onClose={() => {
          setShowCheckInModal(false);
          setCheckInForm({ pegawaiId: '', status: 'HADIR', keterangan: '' });
        }}
        title={isAdmin ? 'Absensi Manual' : 'Absensi - Izin/Sakit'}
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCheckIn(checkInForm.status, checkInForm.keterangan);
          }}
          className="space-y-4"
        >
          {isAdmin && (
            <Select
              label="Pegawai"
              value={checkInForm.pegawaiId}
              onChange={(e) => setCheckInForm({ ...checkInForm, pegawaiId: e.target.value })}
              placeholder="Pilih pegawai"
              options={pegawaiList.map(p => ({ value: p.id, label: p.nama }))}
              required
            />
          )}
          
          <Select
            label="Status"
            value={checkInForm.status}
            onChange={(e) => setCheckInForm({ ...checkInForm, status: e.target.value })}
            options={isAdmin ? statusOptions : [
              { value: 'IZIN', label: 'Izin' },
              { value: 'SAKIT', label: 'Sakit' },
            ]}
            required
          />
          
          {(checkInForm.status === 'IZIN' || checkInForm.status === 'SAKIT') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Keterangan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={checkInForm.keterangan}
                onChange={(e) => setCheckInForm({ ...checkInForm, keterangan: e.target.value })}
                placeholder="Masukkan alasan..."
                rows={3}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCheckInModal(false);
                setCheckInForm({ pegawaiId: '', status: 'HADIR', keterangan: '' });
              }}
            >
              Batal
            </Button>
            <Button type="submit" loading={submitting}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Absensi;
