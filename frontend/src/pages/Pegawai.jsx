import { useState, useEffect } from 'react';
import { pegawaiAPI } from '../services/api';
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
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Pegawai = () => {
  const { isAdmin } = useAuth();
  const [pegawai, setPegawai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departemenFilter, setDepartemenFilter] = useState('');
  const [departemenList, setDepartemenList] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState(null);
  const [deletingPegawai, setDeletingPegawai] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    jabatan: '',
    departemen: '',
    jamMasuk: '08:00',
    jamPulang: '17:00',
    statusAktif: true,
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchPegawai();
    fetchDepartemen();
  }, [search, departemenFilter, pagination.page]);

  const fetchPegawai = async () => {
    try {
      setLoading(true);
      const response = await pegawaiAPI.getAll({
        search,
        departemen: departemenFilter,
        page: pagination.page,
        limit: pagination.limit,
      });
      setPegawai(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.meta.total,
        totalPages: response.data.meta.totalPages,
      });
    } catch (error) {
      toast.error('Gagal memuat data pegawai');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartemen = async () => {
    try {
      const response = await pegawaiAPI.getDepartemen();
      setDepartemenList(response.data.data);
    } catch (error) {
      console.error('Failed to fetch departemen');
    }
  };

  const handleOpenModal = (pegawaiData = null) => {
    if (pegawaiData) {
      setEditingPegawai(pegawaiData);
      setFormData({
        nip: pegawaiData.nip,
        nama: pegawaiData.nama,
        jabatan: pegawaiData.jabatan,
        departemen: pegawaiData.departemen,
        jamMasuk: pegawaiData.jamMasuk,
        jamPulang: pegawaiData.jamPulang,
        statusAktif: pegawaiData.statusAktif,
        email: '',
        password: '',
      });
    } else {
      setEditingPegawai(null);
      setFormData({
        nip: '',
        nama: '',
        jabatan: '',
        departemen: '',
        jamMasuk: '08:00',
        jamPulang: '17:00',
        statusAktif: true,
        email: '',
        password: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPegawai(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingPegawai) {
        await pegawaiAPI.update(editingPegawai.id, formData);
        toast.success('Pegawai berhasil diperbarui');
      } else {
        await pegawaiAPI.create(formData);
        toast.success('Pegawai berhasil ditambahkan');
      }
      handleCloseModal();
      fetchPegawai();
      fetchDepartemen();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await pegawaiAPI.delete(deletingPegawai.id);
      toast.success('Pegawai berhasil dihapus');
      setShowDeleteModal(false);
      setDeletingPegawai(null);
      fetchPegawai();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus pegawai');
    } finally {
      setSubmitting(false);
    }
  };

  const jabatanOptions = [
    { value: 'Software Engineer', label: 'Software Engineer' },
    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'HR Manager', label: 'HR Manager' },
    { value: 'Backend Developer', label: 'Backend Developer' },
    { value: 'Frontend Developer', label: 'Frontend Developer' },
    { value: 'QA Engineer', label: 'QA Engineer' },
    { value: 'Finance Staff', label: 'Finance Staff' },
    { value: 'Admin Staff', label: 'Admin Staff' },
  ];

  const departemenOptions = [
    { value: 'IT', label: 'IT' },
    { value: 'Design', label: 'Design' },
    { value: 'Management', label: 'Management' },
    { value: 'HR', label: 'HR' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Operations', label: 'Operations' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Data Pegawai</h1>
          <p className="text-gray-500 mt-1">Kelola data pegawai perusahaan</p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()} icon={Plus}>
            Tambah Pegawai
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari nama, NIP, atau jabatan..."
            className="flex-1"
          />
          <Select
            value={departemenFilter}
            onChange={(e) => setDepartemenFilter(e.target.value)}
            placeholder="Semua Departemen"
            options={departemenList.map(d => ({ value: d, label: d }))}
            className="md:w-48"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : pegawai.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Users className="w-12 h-12 mb-4 text-gray-300" />
            <p>Tidak ada data pegawai</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIP</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Jam Kerja</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pegawai.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nip}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{p.nama}</p>
                        {p.user?.email && (
                          <p className="text-xs text-gray-500">{p.user.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{p.jabatan}</TableCell>
                    <TableCell>
                      <Badge variant="info">{p.departemen}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {p.jamMasuk} - {p.jamPulang}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.statusAktif ? 'success' : 'danger'}>
                        {p.statusAktif ? 'Aktif' : 'Non-aktif'}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(p)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingPegawai(p);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setPagination({ ...pagination, page })}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingPegawai ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="NIP"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              placeholder="EMP001"
              required
            />
            <Input
              label="Nama Lengkap"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Nama pegawai"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Jabatan"
              value={formData.jabatan}
              onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              options={jabatanOptions}
              placeholder="Pilih jabatan"
              required
            />
            <Select
              label="Departemen"
              value={formData.departemen}
              onChange={(e) => setFormData({ ...formData, departemen: e.target.value })}
              options={departemenOptions}
              placeholder="Pilih departemen"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Jam Masuk"
              type="time"
              value={formData.jamMasuk}
              onChange={(e) => setFormData({ ...formData, jamMasuk: e.target.value })}
              required
            />
            <Input
              label="Jam Pulang"
              type="time"
              value={formData.jamPulang}
              onChange={(e) => setFormData({ ...formData, jamPulang: e.target.value })}
              required
            />
          </div>

          {!editingPegawai && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Akun Login (Opsional)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 6 karakter"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="statusAktif"
              checked={formData.statusAktif}
              onChange={(e) => setFormData({ ...formData, statusAktif: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="statusAktif" className="text-sm text-gray-700">
              Status Aktif
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button type="submit" loading={submitting}>
              {editingPegawai ? 'Simpan Perubahan' : 'Tambah Pegawai'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingPegawai(null);
        }}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-600 mb-2">
            Apakah Anda yakin ingin menghapus pegawai:
          </p>
          <p className="font-semibold text-gray-900 mb-6">
            {deletingPegawai?.nama}?
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingPegawai(null);
              }}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={submitting}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Pegawai;
