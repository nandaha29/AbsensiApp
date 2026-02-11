const prisma = require('../config/database');
const { 
  parseISO, 
  format, 
  startOfDay, 
  differenceInMinutes,
  isWeekend,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} = require('date-fns');

// Helper: Parse time string to minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper: Format minutes to HH:mm
const formatMinutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Helper: Check if date is a holiday
const isHoliday = async (date) => {
  const holiday = await prisma.hariLibur.findUnique({
    where: { tanggal: startOfDay(date) },
  });
  return !!holiday;
};

// Check-in
const checkIn = async (req, res) => {
  try {
    const { pegawaiId, tanggal, jamMasuk, status, keterangan } = req.body;
    console.log('Check-in request:', { pegawaiId, tanggal, jamMasuk, status, keterangan });
    
    // Create date without timezone issues
    const now = tanggal ? parseISO(tanggal) : new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    console.log('Date objects:', { now, dateOnly });

    // Get pegawai data
    const pegawai = await prisma.pegawai.findUnique({
      where: { id: parseInt(pegawaiId) },
    });
    console.log('Pegawai found:', pegawai ? 'yes' : 'no');

    if (!pegawai) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai not found',
      });
    }

    // Check if already checked in today (use date range)
    const dateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        pegawaiId: parseInt(pegawaiId),
        tanggal: {
          gte: dateOnly,
          lte: dateEnd,
        },
      },
    });
    console.log('Existing absensi:', existingAbsensi ? 'yes' : 'no');

    if (existingAbsensi) {
      return res.status(400).json({
        success: false,
        message: 'Sudah melakukan check-in hari ini',
      });
    }

    // Validate status that requires keterangan
    if ((status === 'IZIN' || status === 'SAKIT') && !keterangan) {
      return res.status(400).json({
        success: false,
        message: `Keterangan wajib diisi untuk status ${status}`,
      });
    }

    // Calculate late time
    let terlambat = 0;
    const currentTime = jamMasuk || format(new Date(), 'HH:mm');
    const currentMinutes = parseTimeToMinutes(currentTime);
    const jamMasukStandar = parseTimeToMinutes(pegawai.jamMasuk);

    if (status === 'HADIR' && currentMinutes > jamMasukStandar) {
      terlambat = currentMinutes - jamMasukStandar;
    }

    // Create time object for database
    const jamMasukDate = new Date();
    const [hours, minutes] = currentTime.split(':').map(Number);
    jamMasukDate.setHours(hours, minutes, 0, 0);
    console.log('About to create absensi:', {
      pegawaiId: parseInt(pegawaiId),
      tanggal: dateOnly,
      jamMasuk: status === 'HADIR' ? jamMasukDate : null,
      status: status || 'HADIR',
      keterangan,
      terlambat,
    });

    const absensi = await prisma.absensi.create({
      data: {
        pegawaiId: parseInt(pegawaiId),
        tanggal: dateOnly,
        jamMasuk: status === 'HADIR' ? jamMasukDate : null,
        status: status || 'HADIR',
        keterangan,
        terlambat,
      },
      include: {
        pegawai: true,
      },
    });
    console.log('Absensi created successfully');

    res.status(201).json({
      success: true,
      message: 'Check-in berhasil',
      data: {
        ...absensi,
        terlambatFormatted: terlambat > 0 ? `Terlambat ${Math.floor(terlambat / 60)} jam ${terlambat % 60} menit` : null,
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Check-in gagal',
      error: error.message,
    });
  }
};

// Check-out
const checkOut = async (req, res) => {
  try {
    const { pegawaiId, tanggal, jamPulang } = req.body;
    
    // Create date without timezone issues
    const now = tanggal ? parseISO(tanggal) : new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const dateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Get pegawai data
    const pegawai = await prisma.pegawai.findUnique({
      where: { id: parseInt(pegawaiId) },
    });

    if (!pegawai) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai not found',
      });
    }

    // Find today's check-in
    const absensi = await prisma.absensi.findFirst({
      where: {
        pegawaiId: parseInt(pegawaiId),
        tanggal: {
          gte: dateOnly,
          lte: dateEnd,
        },
      },
    });

    if (!absensi) {
      return res.status(400).json({
        success: false,
        message: 'Belum melakukan check-in hari ini',
      });
    }

    if (absensi.jamPulang) {
      return res.status(400).json({
        success: false,
        message: 'Sudah melakukan check-out hari ini',
      });
    }

    if (absensi.status !== 'HADIR') {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat check-out karena status bukan HADIR',
      });
    }

    // Calculate overtime and total hours
    const currentTime = jamPulang || format(new Date(), 'HH:mm');
    const currentMinutes = parseTimeToMinutes(currentTime);
    const jamPulangStandar = parseTimeToMinutes(pegawai.jamPulang);
    const jamMasukMinutes = absensi.jamMasuk 
      ? absensi.jamMasuk.getHours() * 60 + absensi.jamMasuk.getMinutes()
      : parseTimeToMinutes(pegawai.jamMasuk);

    let lembur = 0;
    if (currentMinutes > jamPulangStandar) {
      lembur = currentMinutes - jamPulangStandar;
    }

    const totalJamKerja = currentMinutes - jamMasukMinutes;

    // Create time object for database
    const jamPulangDate = new Date();
    const [hours, minutes] = currentTime.split(':').map(Number);
    jamPulangDate.setHours(hours, minutes, 0, 0);

    const updatedAbsensi = await prisma.absensi.update({
      where: { id: absensi.id },
      data: {
        jamPulang: jamPulangDate,
        lembur,
        totalJamKerja,
      },
      include: {
        pegawai: true,
      },
    });

    res.json({
      success: true,
      message: 'Check-out berhasil',
      data: {
        ...updatedAbsensi,
        lemburFormatted: lembur > 0 ? `Lembur ${Math.floor(lembur / 60)} jam ${lembur % 60} menit` : null,
        totalJamKerjaFormatted: `${Math.floor(totalJamKerja / 60)} jam ${totalJamKerja % 60} menit`,
      },
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Check-out gagal',
      error: error.message,
    });
  }
};

// Get Today's Status
const getTodayStatus = async (req, res) => {
  try {
    const { pegawaiId } = req.params;
    // Use date range to avoid timezone issues
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const absensi = await prisma.absensi.findFirst({
      where: {
        pegawaiId: parseInt(pegawaiId),
        tanggal: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        pegawai: true,
      },
    });

    res.json({
      success: true,
      data: absensi ? {
        ...absensi,
        hasCheckedIn: true,
        hasCheckedOut: !!absensi.jamPulang,
        terlambatFormatted: absensi.terlambat > 0 
          ? `Terlambat ${Math.floor(absensi.terlambat / 60)} jam ${absensi.terlambat % 60} menit` 
          : null,
        lemburFormatted: absensi.lembur > 0 
          ? `Lembur ${Math.floor(absensi.lembur / 60)} jam ${absensi.lembur % 60} menit` 
          : null,
      } : {
        hasCheckedIn: false,
        hasCheckedOut: false,
      },
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get today status',
      error: error.message,
    });
  }
};

// Get Attendance History
const getHistory = async (req, res) => {
  try {
    const { 
      pegawaiId, 
      startDate, 
      endDate, 
      status, 
      bulan, 
      tahun,
      page = 1, 
      limit = 10 
    } = req.query;

    const where = {};

    if (pegawaiId) {
      where.pegawaiId = parseInt(pegawaiId);
    }

    if (startDate && endDate) {
      where.tanggal = {
        gte: startOfDay(parseISO(startDate)),
        lte: startOfDay(parseISO(endDate)),
      };
    } else if (bulan && tahun) {
      const monthStart = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
      const monthEnd = endOfMonth(monthStart);
      where.tanggal = {
        gte: monthStart,
        lte: monthEnd,
      };
    }

    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [absensi, total] = await Promise.all([
      prisma.absensi.findMany({
        where,
        include: {
          pegawai: true,
        },
        orderBy: { tanggal: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.absensi.count({ where }),
    ]);

    // Format response
    const formattedAbsensi = absensi.map((a) => ({
      ...a,
      tanggalFormatted: format(a.tanggal, 'dd/MM/yyyy'),
      jamMasukFormatted: a.jamMasuk ? format(a.jamMasuk, 'HH:mm') : '-',
      jamPulangFormatted: a.jamPulang ? format(a.jamPulang, 'HH:mm') : '-',
      terlambatFormatted: a.terlambat > 0 
        ? `${Math.floor(a.terlambat / 60)}j ${a.terlambat % 60}m` 
        : '-',
      lemburFormatted: a.lembur > 0 
        ? `${Math.floor(a.lembur / 60)}j ${a.lembur % 60}m` 
        : '-',
      totalJamKerjaFormatted: a.totalJamKerja > 0
        ? `${Math.floor(a.totalJamKerja / 60)}j ${a.totalJamKerja % 60}m`
        : '-',
    }));

    res.json({
      success: true,
      data: formattedAbsensi,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get history',
      error: error.message,
    });
  }
};

// Get All Today's Attendance (Admin)
const getTodayAll = async (req, res) => {
  try {
    // Use date string comparison to avoid timezone issues
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const absensi = await prisma.absensi.findMany({
      where: { 
        tanggal: {
          gte: todayStart,
          lte: todayEnd,
        }
      },
      include: {
        pegawai: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get all active employees
    const allPegawai = await prisma.pegawai.findMany({
      where: { statusAktif: true },
    });

    // Map attendance status for all employees
    const attendanceMap = new Map(absensi.map((a) => [a.pegawaiId, a]));
    
    const fullAttendance = allPegawai.map((p) => {
      const att = attendanceMap.get(p.id);
      return {
        pegawai: p,
        hasCheckedIn: !!att,
        hasCheckedOut: att?.jamPulang ? true : false,
        absensi: att ? {
          ...att,
          jamMasukFormatted: att.jamMasuk ? format(att.jamMasuk, 'HH:mm') : '-',
          jamPulangFormatted: att.jamPulang ? format(att.jamPulang, 'HH:mm') : '-',
          terlambatFormatted: att.terlambat > 0 
            ? `${Math.floor(att.terlambat / 60)}j ${att.terlambat % 60}m` 
            : null,
          lemburFormatted: att.lembur > 0 
            ? `${Math.floor(att.lembur / 60)}j ${att.lembur % 60}m` 
            : null,
        } : null,
      };
    });

    // Summary
    const summary = {
      total: allPegawai.length,
      hadir: absensi.filter((a) => a.status === 'HADIR').length,
      izin: absensi.filter((a) => a.status === 'IZIN').length,
      sakit: absensi.filter((a) => a.status === 'SAKIT').length,
      alfa: allPegawai.length - absensi.length,
      terlambat: absensi.filter((a) => a.terlambat > 0).length,
    };

    res.json({
      success: true,
      data: {
        date: format(todayStart, 'dd MMMM yyyy'),
        summary,
        attendance: fullAttendance,
      },
    });
  } catch (error) {
    console.error('Get today all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get today attendance',
      error: error.message,
    });
  }
};

// Update Attendance (Admin)
const updateAbsensi = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, keterangan, jamMasuk, jamPulang } = req.body;

    const absensi = await prisma.absensi.findUnique({
      where: { id: parseInt(id) },
      include: { pegawai: true },
    });

    if (!absensi) {
      return res.status(404).json({
        success: false,
        message: 'Absensi not found',
      });
    }

    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    if (keterangan !== undefined) {
      updateData.keterangan = keterangan;
    }

    if (jamMasuk) {
      const jamMasukDate = new Date();
      const [hours, minutes] = jamMasuk.split(':').map(Number);
      jamMasukDate.setHours(hours, minutes, 0, 0);
      updateData.jamMasuk = jamMasukDate;

      // Recalculate late
      const jamMasukStandar = parseTimeToMinutes(absensi.pegawai.jamMasuk);
      const currentMinutes = parseTimeToMinutes(jamMasuk);
      updateData.terlambat = currentMinutes > jamMasukStandar 
        ? currentMinutes - jamMasukStandar 
        : 0;
    }

    if (jamPulang) {
      const jamPulangDate = new Date();
      const [hours, minutes] = jamPulang.split(':').map(Number);
      jamPulangDate.setHours(hours, minutes, 0, 0);
      updateData.jamPulang = jamPulangDate;

      // Recalculate overtime and total hours
      const jamPulangStandar = parseTimeToMinutes(absensi.pegawai.jamPulang);
      const currentMinutes = parseTimeToMinutes(jamPulang);
      updateData.lembur = currentMinutes > jamPulangStandar 
        ? currentMinutes - jamPulangStandar 
        : 0;

      // Calculate total work hours
      const jamMasukMinutes = updateData.jamMasuk 
        ? updateData.jamMasuk.getHours() * 60 + updateData.jamMasuk.getMinutes()
        : absensi.jamMasuk.getHours() * 60 + absensi.jamMasuk.getMinutes();
      updateData.totalJamKerja = currentMinutes - jamMasukMinutes;
    }

    const updated = await prisma.absensi.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { pegawai: true },
    });

    res.json({
      success: true,
      message: 'Absensi updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Update absensi error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update absensi',
      error: error.message,
    });
  }
};

module.exports = { 
  checkIn, 
  checkOut, 
  getTodayStatus, 
  getHistory, 
  getTodayAll,
  updateAbsensi 
};
