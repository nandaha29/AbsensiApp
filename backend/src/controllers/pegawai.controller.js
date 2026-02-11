const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

// Get All Pegawai
const getAll = async (req, res) => {
  try {
    const { search, departemen, status, page = 1, limit = 10 } = req.query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { nip: { contains: search } },
        { jabatan: { contains: search } },
      ];
    }
    
    if (departemen) {
      where.departemen = departemen;
    }
    
    if (status !== undefined) {
      where.statusAktif = status === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [pegawai, total] = await Promise.all([
      prisma.pegawai.findMany({
        where,
        include: {
          user: {
            select: { email: true, role: true },
          },
        },
        orderBy: { nama: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.pegawai.count({ where }),
    ]);

    res.json({
      success: true,
      data: pegawai,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all pegawai error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pegawai',
      error: error.message,
    });
  }
};

// Get Single Pegawai
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const pegawai = await prisma.pegawai.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
    });

    if (!pegawai) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai not found',
      });
    }

    res.json({
      success: true,
      data: pegawai,
    });
  } catch (error) {
    console.error('Get pegawai by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pegawai',
      error: error.message,
    });
  }
};

// Create Pegawai
const create = async (req, res) => {
  try {
    const { nip, nama, jabatan, departemen, jamMasuk, jamPulang, statusAktif, email, password } = req.body;

    // Check if NIP already exists
    const existingPegawai = await prisma.pegawai.findUnique({
      where: { nip },
    });

    if (existingPegawai) {
      return res.status(400).json({
        success: false,
        message: 'NIP already exists',
      });
    }

    // Create user if email provided
    let userId = null;
    if (email && password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'EMPLOYEE',
        },
      });
      userId = user.id;
    }

    const pegawai = await prisma.pegawai.create({
      data: {
        nip,
        nama,
        jabatan,
        departemen,
        jamMasuk: jamMasuk || '08:00',
        jamPulang: jamPulang || '17:00',
        statusAktif: statusAktif ?? true,
        userId,
      },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Pegawai created successfully',
      data: pegawai,
    });
  } catch (error) {
    console.error('Create pegawai error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pegawai',
      error: error.message,
    });
  }
};

// Update Pegawai
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nip, nama, jabatan, departemen, jamMasuk, jamPulang, statusAktif } = req.body;

    // Check if pegawai exists
    const existingPegawai = await prisma.pegawai.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPegawai) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai not found',
      });
    }

    // Check if NIP already exists (if changing NIP)
    if (nip && nip !== existingPegawai.nip) {
      const nipExists = await prisma.pegawai.findUnique({
        where: { nip },
      });
      if (nipExists) {
        return res.status(400).json({
          success: false,
          message: 'NIP already exists',
        });
      }
    }

    const pegawai = await prisma.pegawai.update({
      where: { id: parseInt(id) },
      data: {
        nip,
        nama,
        jabatan,
        departemen,
        jamMasuk,
        jamPulang,
        statusAktif,
      },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
    });

    res.json({
      success: true,
      message: 'Pegawai updated successfully',
      data: pegawai,
    });
  } catch (error) {
    console.error('Update pegawai error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pegawai',
      error: error.message,
    });
  }
};

// Delete Pegawai
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const pegawai = await prisma.pegawai.findUnique({
      where: { id: parseInt(id) },
    });

    if (!pegawai) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai not found',
      });
    }

    // Delete user if exists
    if (pegawai.userId) {
      await prisma.user.delete({
        where: { id: pegawai.userId },
      });
    }

    await prisma.pegawai.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Pegawai deleted successfully',
    });
  } catch (error) {
    console.error('Delete pegawai error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pegawai',
      error: error.message,
    });
  }
};

// Get Departemen List
const getDepartemen = async (req, res) => {
  try {
    const departemen = await prisma.pegawai.groupBy({
      by: ['departemen'],
      orderBy: { departemen: 'asc' },
    });

    res.json({
      success: true,
      data: departemen.map((d) => d.departemen),
    });
  } catch (error) {
    console.error('Get departemen error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get departemen',
      error: error.message,
    });
  }
};

module.exports = { getAll, getById, create, update, remove, getDepartemen };
