const prisma = require('../config/database');
const { format } = require('date-fns');

// Get All Holidays
const getAll = async (req, res) => {
  try {
    const { tahun } = req.query;
    
    const where = {};
    if (tahun) {
      where.tanggal = {
        gte: new Date(`${tahun}-01-01`),
        lte: new Date(`${tahun}-12-31`),
      };
    }

    const holidays = await prisma.hariLibur.findMany({
      where,
      orderBy: { tanggal: 'asc' },
    });

    res.json({
      success: true,
      data: holidays.map(h => ({
        ...h,
        tanggalFormatted: format(h.tanggal, 'dd/MM/yyyy'),
      })),
    });
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get holidays',
      error: error.message,
    });
  }
};

// Create Holiday
const create = async (req, res) => {
  try {
    const { tanggal, keterangan } = req.body;

    const holiday = await prisma.hariLibur.create({
      data: {
        tanggal: new Date(tanggal),
        keterangan,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: holiday,
    });
  } catch (error) {
    console.error('Create holiday error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create holiday',
      error: error.message,
    });
  }
};

// Delete Holiday
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.hariLibur.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Holiday deleted successfully',
    });
  } catch (error) {
    console.error('Delete holiday error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete holiday',
      error: error.message,
    });
  }
};

module.exports = { getAll, create, remove };
