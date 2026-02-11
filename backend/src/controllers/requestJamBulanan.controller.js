const prisma = require('../config/database');

// Submit request for monthly work hours (for PERJAM employees)
const submitJamBulanan = async (req, res) => {
  try {
    const { bulan, tahun, details, deskripsi } = req.body;
    const pegawaiId = req.user.pegawaiId;

    // Validate input
    if (!details || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Details jam kerja per tanggal harus diisi',
      });
    }

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

    // Calculate total jam from details
    const totalJam = details.reduce((sum, detail) => sum + parseFloat(detail.totalJam || detail.jamKerja || 0), 0);

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

    // Use transaction to create/update request and details
    const result = await prisma.$transaction(async (tx) => {
      // Create or update request
      const request = await tx.requestJamBulanan.upsert({
        where: {
          pegawaiId_bulan_tahun: {
            pegawaiId,
            bulan: parseInt(bulan),
            tahun: parseInt(tahun),
          },
        },
        update: {
          totalJam,
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
          totalJam,
          deskripsi,
        },
      });

      // Delete existing details if updating
      if (existingRequest) {
        await tx.requestJamBulananDetail.deleteMany({
          where: { requestId: request.id },
        });
      }

      // Create new details
      const detailPromises = details.map(detail => 
        tx.requestJamBulananDetail.create({
          data: {
            requestId: request.id,
            tanggal: new Date(detail.tanggal),
            jamCheckin: detail.jamCheckin && detail.jamCheckin.trim() ? new Date(`2000-01-01T${detail.jamCheckin}:00`) : null,
            jamCheckout: detail.jamCheckout && detail.jamCheckout.trim() ? new Date(`2000-01-01T${detail.jamCheckout}:00`) : null,
            jamKerja: parseFloat(detail.totalJam || detail.jamKerja || 0),
            deskripsi: detail.deskripsi || null,
          },
        })
      );

      await Promise.all(detailPromises);

      return request;
    });

    // Fetch complete request with details
    const completeRequest = await prisma.requestJamBulanan.findUnique({
      where: { id: result.id },
      include: {
        pegawai: true,
        details: {
          orderBy: { tanggal: 'asc' },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Request jam bulanan berhasil dikirim',
      data: completeRequest,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.requestJamBulanan.findMany({
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
          details: {
            orderBy: { tanggal: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.requestJamBulanan.count({
        where: { status: 'PENDING' },
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    // Format the response to include time strings
    const formattedRequests = requests.map(request => ({
      ...request,
      details: request.details.map(detail => ({
        ...detail,
        jamCheckin: detail.jamCheckin ? detail.jamCheckin.toTimeString().slice(0, 5) : null,
        jamCheckout: detail.jamCheckout ? detail.jamCheckout.toTimeString().slice(0, 5) : null,
        totalJam: detail.jamKerja, // Keep backward compatibility
      })),
    }));

    res.json({
      success: true,
      data: formattedRequests,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
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
      include: {
        details: {
          orderBy: { tanggal: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format the response to include time strings
    const formattedRequests = requests.map(request => ({
      ...request,
      details: request.details.map(detail => ({
        ...detail,
        jamCheckin: detail.jamCheckin ? detail.jamCheckin.toTimeString().slice(0, 5) : null,
        jamCheckout: detail.jamCheckout ? detail.jamCheckout.toTimeString().slice(0, 5) : null,
        totalJam: detail.jamKerja, // Keep backward compatibility
      })),
    }));

    res.json({
      success: true,
      data: formattedRequests,
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