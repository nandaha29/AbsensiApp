import { useState, useEffect } from 'react';
import { laporanAPI, pegawaiAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui';
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Laporan = () => {
  const { isAdmin, pegawaiId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [report, setReport] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    pegawaiId: '',
    departemen: '',
  });
  
  // Employee & Department list
  const [pegawaiList, setPegawaiList] = useState([]);
  const [departemenList, setDepartemenList] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      fetchPegawaiList();
      fetchDepartemenList();
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const fetchPegawaiList = async () => {
    try {
      const response = await pegawaiAPI.getAll({ limit: 100 });
      setPegawaiList(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pegawai list');
    }
  };

  const fetchDepartemenList = async () => {
    try {
      const response = await pegawaiAPI.getDepartemen();
      setDepartemenList(response.data.data);
    } catch (error) {
      console.error('Failed to fetch departemen list');
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {
        bulan: filters.bulan,
        tahun: filters.tahun,
      };
      
      if (!isAdmin) {
        params.pegawaiId = pegawaiId;
      } else {
        if (filters.pegawaiId) params.pegawaiId = filters.pegawaiId;
        if (filters.departemen) params.departemen = filters.departemen;
      }

      const response = await laporanAPI.getMonthly(params);
      setReport(response.data.data);
    } catch (error) {
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const params = {
        bulan: filters.bulan,
        tahun: filters.tahun,
      };
      
      if (!isAdmin) {
        params.pegawaiId = pegawaiId;
      } else {
        if (filters.pegawaiId) params.pegawaiId = filters.pegawaiId;
        if (filters.departemen) params.departemen = filters.departemen;
      }

      const response = await laporanAPI.exportCSV(params);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-absensi-${filters.bulan}-${filters.tahun}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export CSV berhasil!');
    } catch (error) {
      toast.error('Gagal export CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const params = {
        bulan: filters.bulan,
        tahun: filters.tahun,
      };
      
      if (!isAdmin) {
        params.pegawaiId = pegawaiId;
      } else {
        if (filters.pegawaiId) params.pegawaiId = filters.pegawaiId;
        if (filters.departemen) params.departemen = filters.departemen;
      }

      const response = await laporanAPI.exportPDF(params);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-absensi-${filters.bulan}-${filters.tahun}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export PDF berhasil!');
    } catch (error) {
      toast.error('Gagal export PDF');
    } finally {
      setExporting(false);
    }
  };

  const bulanOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(2024, i), 'MMMM', { locale: id }),
  }));

  const tahunOptions = Array.from({ length: 5 }, (_, i) => ({
    value: new Date().getFullYear() - i,
    label: String(new Date().getFullYear() - i),
  }));

  const getPersentaseColor = (persen) => {
    if (persen >= 90) return 'text-green-600';
    if (persen >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Absensi</h1>
          <p className="text-gray-500 mt-1">Rekap absensi bulanan</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            loading={exporting}
            icon={Download}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={handleExportPDF}
            loading={exporting}
            icon={FileText}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
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
          {isAdmin && (
            <>
              <Select
                value={filters.pegawaiId}
                onChange={(e) => setFilters({ ...filters, pegawaiId: e.target.value })}
                placeholder="Semua Pegawai"
                options={pegawaiList.map(p => ({ value: p.id, label: p.nama }))}
                className="md:w-48"
              />
              <Select
                value={filters.departemen}
                onChange={(e) => setFilters({ ...filters, departemen: e.target.value })}
                placeholder="Semua Departemen"
                options={departemenList.map(d => ({ value: d, label: d }))}
                className="md:w-40"
              />
            </>
          )}
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hari Kerja</p>
                  <p className="text-2xl font-bold text-gray-900">{report.summary.hariKerja}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Hadir</p>
                  <p className="text-2xl font-bold text-green-600">{report.summary.totalHadir}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Izin + Sakit</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {report.summary.totalIzin + report.summary.totalSakit}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Alfa</p>
                  <p className="text-2xl font-bold text-red-600">{report.summary.totalAlfa}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Holidays Info */}
          {report.holidays && report.holidays.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-red-500" />
                  Hari Libur Nasional ({report.holidays.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {report.holidays.map((holiday, index) => (
                    <Badge key={index} variant="danger">
                      {holiday.tanggal} - {holiday.keterangan}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                Rekap Absensi - {report.periode}
              </h3>
            </div>
            
            {report.report.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FileText className="w-12 h-12 mb-4 text-gray-300" />
                <p>Tidak ada data laporan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pegawai</TableHead>
                      <TableHead className="text-center">Hari Kerja</TableHead>
                      <TableHead className="text-center">Hadir</TableHead>
                      <TableHead className="text-center">Izin</TableHead>
                      <TableHead className="text-center">Sakit</TableHead>
                      <TableHead className="text-center">Alfa</TableHead>
                      <TableHead className="text-center">Terlambat</TableHead>
                      <TableHead className="text-center">Lembur</TableHead>
                      <TableHead className="text-center">Total Kerja</TableHead>
                      <TableHead className="text-center">Kehadiran</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.report.map((item) => (
                      <TableRow key={item.pegawai.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{item.pegawai.nama}</p>
                            <p className="text-xs text-gray-500">
                              {item.pegawai.nip} • {item.pegawai.departemen}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.summary.hariKerja}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium text-green-600">{item.summary.hadir}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-blue-600">{item.summary.izin}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-yellow-600">{item.summary.sakit}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-red-600">{item.summary.alfa}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.summary.terlambatCount > 0 ? (
                            <div>
                              <Badge variant="warning">{item.summary.terlambatCount}x</Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.summary.totalTerlambatFormatted}
                              </p>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.summary.totalLembur > 0 ? (
                            <Badge variant="purple">{item.summary.totalLemburFormatted}</Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm">{item.summary.totalJamKerjaFormatted}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${getPersentaseColor(item.summary.persentaseKehadiran)}`}>
                            {item.summary.persentaseKehadiran}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>

          {/* Summary Footer */}
          <Card className="bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Total Pegawai</p>
                <p className="text-xl font-bold text-gray-900">{report.summary.totalPegawai}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Hadir</p>
                <p className="text-xl font-bold text-green-600">{report.summary.totalHadir}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Izin</p>
                <p className="text-xl font-bold text-blue-600">{report.summary.totalIzin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Sakit</p>
                <p className="text-xl font-bold text-yellow-600">{report.summary.totalSakit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Alfa</p>
                <p className="text-xl font-bold text-red-600">{report.summary.totalAlfa}</p>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Tidak ada data laporan untuk periode ini</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Laporan;
