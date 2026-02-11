import { useState, useEffect, useMemo } from 'react';
import { absensiAPI, pegawaiAPI, requestJamBulananAPI } from '../services/api';
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

  // Jam Bulanan modal
  const [showJamBulananModal, setShowJamBulananModal] = useState(false);

  // My today status (Employee)
  const [myTodayStatus, setMyTodayStatus] = useState(null);

  // Jam Bulanan requests (Employee)
  const [jamBulananRequests, setJamBulananRequests] = useState([]);

  // Pending requests (Admin)
  const [pendingRequests, setPendingRequests] = useState([]);

  // Expanded requests for collapsible details
  const [expandedRequests, setExpandedRequests] = useState(new Set());

  // Pending requests pagination
  const [pendingPagination, setPendingPagination] = useState({
    page: 1,
    limit: 5, // Show fewer items per page for better performance
    total: 0,
    totalPages: 0,
  });
  const [jamBulananForm, setJamBulananForm] = useState({
    bulan: (new Date().getMonth() + 1).toString(),
    tahun: new Date().getFullYear().toString(),
    details: [], // Array of {tanggal: 'YYYY-MM-DD', jamCheckin: 'HH:mm', jamCheckout: 'HH:mm', deskripsi: string, totalJam: number}
    deskripsi: '',
  });

  // Helper function to calculate total hours between check-in and check-out
  const calculateTotalJam = (checkin, checkout) => {
    if (!checkin || !checkout) return 0;

    const checkinTime = new Date(`2000-01-01T${checkin}:00`);
    const checkoutTime = new Date(`2000-01-01T${checkout}:00`);

    // If checkout is next day (overtime)
    if (checkoutTime < checkinTime) {
      checkoutTime.setDate(checkoutTime.getDate() + 1);
    }

    const diffMs = checkoutTime - checkinTime;
    const diffHours = diffMs / (1000 * 60 * 60);

    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPegawaiList();
      if (activeTab === 'today') {
        fetchTodayAll();
      } else if (activeTab === 'pending') {
        fetchPendingRequests();
      } else {
        fetchHistory();
      }
    } else {
      if (activeTab === 'checkin') {
        fetchMyTodayStatus();
      } else if (activeTab === 'jam-bulanan') {
        fetchMyJamBulananRequests();
      } else {
        fetchHistory();
      }
    }
  }, [isAdmin, pegawaiId, activeTab, filters, historyPagination.page]);

  // Fetch pending requests when pagination changes
  useEffect(() => {
    if (isAdmin && activeTab === 'pending') {
      fetchPendingRequests();
    }
  }, [pendingPagination.page, pendingPagination.limit]);

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

  const fetchMyJamBulananRequests = async () => {
    try {
      setLoading(true);
      const response = await requestJamBulananAPI.getMyRequests();
      setJamBulananRequests(response.data.data);
    } catch (error) {
      toast.error('Gagal memuat data request jam bulanan');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page: pendingPagination.page,
        limit: pendingPagination.limit,
      };

      const response = await requestJamBulananAPI.getPending(params);
      setPendingRequests(response.data.data);
      setPendingPagination({
        ...pendingPagination,
        total: response.data.meta.total,
        totalPages: response.data.meta.totalPages,
      });
    } catch (error) {
      toast.error('Gagal memuat data pending requests');
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

  const generateCalendarDays = useMemo(() => {
    const bulan = parseInt(jamBulananForm.bulan);
    const tahun = parseInt(jamBulananForm.tahun);
    
    const daysInMonth = new Date(tahun, bulan, 0).getDate();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(tahun, bulan - 1, day);
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      days.push({
        dateString,
        dayName,
        day,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    return days;
  }, [jamBulananForm.bulan, jamBulananForm.tahun]);

  const toggleRequestExpansion = (requestId) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const handleSubmitJamBulanan = async () => {
    try {
      setSubmitting(true);

      // Validate that at least one day is selected
      if (jamBulananForm.details.length === 0) {
        toast.error('Pilih minimal 1 tanggal kerja');
        return;
      }

      // Validate that all selected days have complete data
      const invalidDetails = jamBulananForm.details.filter(
        d => !d.jamCheckin || !d.jamCheckout || d.totalJam <= 0
      );

      if (invalidDetails.length > 0) {
        toast.error('Semua tanggal yang dipilih harus memiliki jam check-in dan check-out yang valid');
        return;
      }

      const payload = {
        bulan: parseInt(jamBulananForm.bulan),
        tahun: parseInt(jamBulananForm.tahun),
        details: jamBulananForm.details.map(d => ({
          tanggal: d.tanggal,
          jamCheckin: d.jamCheckin,
          jamCheckout: d.jamCheckout,
          totalJam: d.totalJam,
          deskripsi: d.deskripsi
        })),
        deskripsi: jamBulananForm.deskripsi
      };

      await requestJamBulananAPI.submit(payload);
      toast.success('Request jam bulanan berhasil dikirim');

      setShowJamBulananModal(false);
      setJamBulananForm({
        bulan: (new Date().getMonth() + 1).toString(),
        tahun: new Date().getFullYear().toString(),
        details: [],
        deskripsi: '',
      });

      // Refresh the requests list
      await fetchMyJamBulananRequests();
    } catch (error) {
      console.error('Submit jam bulanan error:', error);
      toast.error(error.response?.data?.message || 'Gagal mengirim request');
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

  // Employee Jam Bulanan View
  const renderJamBulanan = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Request Jam Kerja Bulanan</h3>
          <p className="text-gray-600">Input total jam kerja per bulan untuk pembayaran per jam</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowJamBulananModal(true)}
          icon={Clock}
        >
          Input Jam Bulanan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Request</CardTitle>
        </CardHeader>
        <CardContent>
          {jamBulananRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada request jam bulanan</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bulan/Tahun</TableHead>
                  <TableHead>Total Jam</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jamBulananRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {format(new Date(request.tahun, request.bulan - 1), 'MMMM yyyy', { locale: id })}
                      {request.details && request.details.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {request.details.length} hari kerja tercatat
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{request.totalJam} jam</TableCell>
                    <TableCell>
                      <Badge variant={
                        request.status === 'APPROVED' ? 'success' :
                        request.status === 'REJECTED' ? 'danger' : 'warning'
                      }>
                        {request.status}
                      </Badge>
                      {request.status === 'REJECTED' && request.alasanReject && (
                        <div className="text-xs text-red-600 mt-1">
                          {request.alasanReject}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.createdAt), 'dd/MM/yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
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

  // Admin Pending Requests View
  const renderPendingRequests = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Pending Requests Jam Bulanan</h3>
        <p className="text-gray-600">Approve atau reject request jam kerja bulanan dari pegawai</p>
      </div>

      <Card>
        <CardContent className="py-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center">Tidak ada pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">{request.pegawai.nama}</h4>
                      <p className="text-sm text-gray-600">{request.pegawai.jabatan} - {request.pegawai.departemen}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(request.tahun, request.bulan - 1), 'MMMM yyyy', { locale: id })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{request.totalJam} jam</p>
                      <p className="text-sm text-gray-600">
                        Estimasi: Rp {(request.totalJam * request.pegawai.tarifPerJam).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  
                  {request.deskripsi && (
                    <div className="mb-4">
                      <p className="text-sm font-medium">Deskripsi:</p>
                      <p className="text-sm text-gray-600">{request.deskripsi}</p>
                    </div>
                  )}
                  
                  {/* Breakdown per tanggal - Collapsible */}
                  {request.details && request.details.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          Breakdown Jam Kerja ({request.details.length} hari)
                        </p>
                        <button
                          onClick={() => toggleRequestExpansion(request.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <span>{expandedRequests.has(request.id) ? 'Sembunyikan' : 'Tampilkan'} Detail</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${expandedRequests.has(request.id) ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Summary - Always visible */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                        <div className="text-xs bg-blue-50 p-2 rounded text-center">
                          <div className="font-medium text-blue-700">Total Hari</div>
                          <div className="text-blue-600">{request.details.length}</div>
                        </div>
                        <div className="text-xs bg-green-50 p-2 rounded text-center">
                          <div className="font-medium text-green-700">Rata-rata/Hari</div>
                          <div className="text-green-600">{(request.totalJam / request.details.length).toFixed(1)} jam</div>
                        </div>
                        <div className="text-xs bg-purple-50 p-2 rounded text-center">
                          <div className="font-medium text-purple-700">Jam Terbanyak</div>
                          <div className="text-purple-600">{Math.max(...request.details.map(d => d.totalJam || d.jamKerja))} jam</div>
                        </div>
                        <div className="text-xs bg-orange-50 p-2 rounded text-center">
                          <div className="font-medium text-orange-700">Jam Tersedikit</div>
                          <div className="text-orange-600">{Math.min(...request.details.map(d => d.totalJam || d.jamKerja))} jam</div>
                        </div>
                      </div>

                      {/* Detailed breakdown - Expandable */}
                      {expandedRequests.has(request.id) && (
                        <div className="border-t pt-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                            {request.details.map((detail) => (
                              <div key={detail.tanggal} className="text-xs bg-gray-50 p-2 rounded">
                                <div className="font-medium">
                                  {format(new Date(detail.tanggal), 'dd/MM')} ({format(new Date(detail.tanggal), 'EEE', { locale: id })})
                                </div>
                                <div className="text-gray-600">
                                  {detail.jamCheckin} - {detail.jamCheckout}
                                </div>
                                <div className="text-blue-600 font-medium">
                                  {detail.totalJam || detail.jamKerja} jam
                                </div>
                                {detail.deskripsi && (
                                  <div className="text-gray-500 truncate mt-1" title={detail.deskripsi}>
                                    {detail.deskripsi}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApproveReject(request.id, 'approve')}
                      loading={submitting}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        const alasan = prompt('Alasan reject:');
                        if (alasan) handleApproveReject(request.id, 'reject', alasan);
                      }}
                      loading={submitting}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls */}
              {pendingPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Showing {((pendingPagination.page - 1) * pendingPagination.limit) + 1} to {Math.min(pendingPagination.page * pendingPagination.limit, pendingPagination.total)} of {pendingPagination.total} requests
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPendingPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pendingPagination.page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, pendingPagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(pendingPagination.totalPages - 4, pendingPagination.page - 2)) + i;
                      if (pageNum > pendingPagination.totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPendingPagination(prev => ({ ...prev, page: pageNum }))}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            pageNum === pendingPagination.page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setPendingPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                      disabled={pendingPagination.page === pendingPagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
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
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending Requests
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
              onClick={() => setActiveTab('jam-bulanan')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'jam-bulanan'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Jam Bulanan
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
        activeTab === 'today' ? renderAdminToday() :
        activeTab === 'pending' ? renderPendingRequests() :
        renderHistory()
      ) : (
        activeTab === 'checkin' ? renderEmployeeCheckIn() :
        activeTab === 'jam-bulanan' ? renderJamBulanan() :
        renderHistory()
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

      {/* Jam Bulanan Modal */}
      <Modal
        isOpen={showJamBulananModal}
        onClose={() => {
          setShowJamBulananModal(false);
          setJamBulananForm({
            bulan: (new Date().getMonth() + 1).toString(),
            tahun: new Date().getFullYear().toString(),
            details: [],
            deskripsi: '',
          });
        }}
        title="Input Jam Kerja Bulanan"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmitJamBulanan(); }}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulan
                </label>
                <Select
                  value={jamBulananForm.bulan.toString()}
                  onChange={(value) => {
                    setJamBulananForm({
                      ...jamBulananForm, 
                      bulan: parseInt(value),
                      details: [] // Reset details when month changes
                    });
                  }}
                  options={bulanOptions}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun
                </label>
                <Select
                  value={jamBulananForm.tahun.toString()}
                  onChange={(value) => {
                    setJamBulananForm({
                      ...jamBulananForm, 
                      tahun: parseInt(value),
                      details: [] // Reset details when year changes
                    });
                  }}
                  options={tahunOptions}
                  required
                />
              </div>
            </div>

            {/* Jam Kerja Per Tanggal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jam Kerja Per Tanggal
              </label>
              <div className="border border-gray-200 rounded-md p-4 max-h-60 overflow-y-auto">
                {generateCalendarDays.map((day) => {
                  const existingDetail = jamBulananForm.details.find(
                    d => d.tanggal === day.dateString
                  );

                  return (
                    <div key={day.dateString} className="border border-gray-100 rounded-lg p-3 mb-3 last:mb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={!!existingDetail}
                            onChange={(e) => {
                              const newDetails = [...jamBulananForm.details];
                              const existingIndex = newDetails.findIndex(
                                d => d.tanggal === day.dateString
                              );

                              if (e.target.checked) {
                                // Add new detail
                                newDetails.push({
                                  tanggal: day.dateString,
                                  jamCheckin: '',
                                  jamCheckout: '',
                                  deskripsi: '',
                                  totalJam: 0
                                });
                              } else {
                                // Remove detail
                                if (existingIndex >= 0) {
                                  newDetails.splice(existingIndex, 1);
                                }
                              }

                              setJamBulananForm({
                                ...jamBulananForm,
                                details: newDetails
                              });
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {day.dateString} ({day.dayName})
                          </span>
                        </div>
                        {existingDetail && (
                          <span className="text-sm font-medium text-blue-600">
                            Total: {existingDetail.totalJam} jam
                          </span>
                        )}
                      </div>

                      {existingDetail && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Jam Check-in
                            </label>
                            <input
                              type="text"
                              placeholder="08:00"
                              value={existingDetail.jamCheckin || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                const newDetails = [...jamBulananForm.details];
                                const existingIndex = newDetails.findIndex(
                                  d => d.tanggal === day.dateString
                                );

                                if (existingIndex >= 0) {
                                  newDetails[existingIndex] = {
                                    ...newDetails[existingIndex],
                                    jamCheckin: value,
                                    totalJam: calculateTotalJam(value, newDetails[existingIndex].jamCheckout)
                                  };
                                }

                                setJamBulananForm({
                                  ...jamBulananForm,
                                  details: newDetails
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Jam Check-out
                            </label>
                            <input
                              type="text"
                              placeholder="17:00"
                              value={existingDetail.jamCheckout || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                const newDetails = [...jamBulananForm.details];
                                const existingIndex = newDetails.findIndex(
                                  d => d.tanggal === day.dateString
                                );

                                if (existingIndex >= 0) {
                                  newDetails[existingIndex] = {
                                    ...newDetails[existingIndex],
                                    jamCheckout: value,
                                    totalJam: calculateTotalJam(newDetails[existingIndex].jamCheckin, value)
                                  };
                                }

                                setJamBulananForm({
                                  ...jamBulananForm,
                                  details: newDetails
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Deskripsi Pekerjaan
                            </label>
                            <input
                              type="text"
                              placeholder="Deskripsi kerja..."
                              value={existingDetail.deskripsi || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                const newDetails = [...jamBulananForm.details];
                                const existingIndex = newDetails.findIndex(
                                  d => d.tanggal === day.dateString
                                );

                                if (existingIndex >= 0) {
                                  newDetails[existingIndex] = {
                                    ...newDetails[existingIndex],
                                    deskripsi: value
                                  };
                                }

                                setJamBulananForm({
                                  ...jamBulananForm,
                                  details: newDetails
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total hari kerja: {jamBulananForm.details.length} |
                Total jam: {jamBulananForm.details.reduce((sum, d) => sum + (d.totalJam || 0), 0)} jam
              </p>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi Pekerjaan (Opsional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Jelaskan pekerjaan yang dilakukan bulan ini..."
                value={jamBulananForm.deskripsi}
                onChange={(e) => setJamBulananForm({...jamBulananForm, deskripsi: e.target.value})}
              />
            </div> */}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowJamBulananModal(false);
                setJamBulananForm({
                  bulan: (new Date().getMonth() + 1).toString(),
                  tahun: new Date().getFullYear().toString(),
                  details: [],
                  deskripsi: '',
                });
              }}
            >
              Batal
            </Button>
            <Button type="submit" loading={submitting}>
              Kirim Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Absensi;
