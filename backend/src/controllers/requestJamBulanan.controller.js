const prisma = require('../config/database');

// Submit request for monthly work hours (for PERJAM employees)
const submitJamBulanan = async (req, res) => {
  try {
    const { bulan, tahun, totalJam, deskripsi } = req.body;
    const pegawaiId = req.user.pegawaiId;

    // Check if employee exists and is PERJAM
    const pegawai = await prisma.pegawai.findUnique({
      where: { id: pegawaiId },
    });

    if (!pegawai) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai not found',
      });
    }

    if (pegawai.tipePembayaran !== 'PERJAM') {
      return res.status(400).json({
        success: false,
        message: 'Fitur ini hanya untuk pegawai dengan pembayaran per jam',
      });
    }

    // Check if request already exists for this month
    const existingRequest = await prisma.requestJamBulanan.findUnique({
      where: {
        pegawaiId_bulan_tahun: {
          pegawaiId,
          bulan: parseInt(bulan),
          tahun: parseInt(tahun),
        },
      },
    });

    if (existingRequest && existingRequest.status === 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Request untuk bulan ini sudah ada dan masih pending',
      });
    }

    // Create or update request
    const request = await prisma.requestJamBulanan.upsert({
      where: {
        pegawaiId_bulan_tahun: {
          pegawaiId,
          bulan: parseInt(bulan),
          tahun: parseInt(tahun),
        },
      },
      update: {
        totalJam: parseInt(totalJam),
        deskripsi,
        status: 'PENDING',
        alasanReject: null,
        approvedBy: null,
        approvedAt: null,
      },
      create: {
        pegawaiId,
        bulan: parseInt(bulan),
        tahun: parseInt(tahun),
        totalJam: parseInt(totalJam),
        deskripsi,
      },
      include: {
        pegawai: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Request jam bulanan berhasil dikirim',
      data: request,
    });
  } catch (error) {
    console.error('Submit jam bulanan error:', error);
    res.status(500).json({
      success: false,
      message: 'Submit request gagal',
      error: error.message,
    });
  }
};

// Get pending requests (for admin)
const getPendingRequests = async (req, res) => {
  try {
    const requests = await prisma.requestJamBulanan.findMany({
      where: { status: 'PENDING' },
      include: {
        pegawai: {
          select: {
            id: true,
            nip: true,
            nama: true,
            jabatan: true,
            departemen: true,
            tarifPerJam: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data requests',
      error: error.message,
    });
  }
};

// Approve or reject request (for admin)
const approveRejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, alasanReject } = req.body; // action: 'approve' or 'reject'

    const request = await prisma.requestJamBulanan.findUnique({
      where: { id: parseInt(id) },
      include: { pegawai: true },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Request sudah diproses',
      });
    }

    const updateData = {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      approvedBy: req.user.id,
      approvedAt: new Date(),
    };

    if (action === 'reject' && alasanReject) {
      updateData.alasanReject = alasanReject;
    }

    const updatedRequest = await prisma.requestJamBulanan.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        pegawai: true,
      },
    });

    // Calculate salary if approved
    let calculatedSalary = null;
    if (action === 'approve' && request.pegawai.tarifPerJam) {
      calculatedSalary = request.totalJam * request.pegawai.tarifPerJam;
    }

    res.json({
      success: true,
      message: `Request ${action === 'approve' ? 'disetujui' : 'ditolak'}`,
      data: {
        ...updatedRequest,
        calculatedSalary,
      },
    });
  } catch (error) {
    console.error('Approve/reject request error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses request',
      error: error.message,
    });
  }
};

// Get employee's monthly requests
const getMyRequests = async (req, res) => {
  try {
    const pegawaiId = req.user.pegawaiId;

    const requests = await prisma.requestJamBulanan.findMany({
      where: { pegawaiId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data requests',
      error: error.message,
    });
  }
};

module.exports = {
  submitJamBulanan,
  getPendingRequests,
  approveRejectRequest,
  getMyRequests,
};