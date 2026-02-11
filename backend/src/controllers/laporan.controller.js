const prisma = require('../config/database');
const { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isWeekend, 
  format,
  parseISO
} = require('date-fns');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// Get Monthly Report
const getMonthlyReport = async (req, res) => {
  try {
    const { bulan, tahun, pegawaiId, departemen } = req.query;
    
    const month = parseInt(bulan) || new Date().getMonth() + 1;
    const year = parseInt(tahun) || new Date().getFullYear();
    
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = endOfMonth(monthStart);

    // Get all working days (exclude weekends)
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get holidays
    const holidays = await prisma.hariLibur.findMany({
      where: {
        tanggal: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
    const holidayDates = new Set(holidays.map(h => format(h.tanggal, 'yyyy-MM-dd')));

    // Calculate working days (exclude weekends and holidays)
    const workingDays = allDays.filter(day => {
      return !isWeekend(day) && !holidayDates.has(format(day, 'yyyy-MM-dd'));
    });

    // Get pegawai filter
    const pegawaiWhere = { statusAktif: true };
    if (pegawaiId) {
      pegawaiWhere.id = parseInt(pegawaiId);
    }
    if (departemen) {
      pegawaiWhere.departemen = departemen;
    }

    // Get all active employees
    const pegawaiList = await prisma.pegawai.findMany({
      where: pegawaiWhere,
      orderBy: { nama: 'asc' },
    });

    // Get attendance for the month
    const absensiList = await prisma.absensi.findMany({
      where: {
        tanggal: {
          gte: monthStart,
          lte: monthEnd,
        },
        pegawaiId: pegawaiId ? parseInt(pegawaiId) : undefined,
      },
    });

    // Create attendance map
    const absensiMap = new Map();
    absensiList.forEach(a => {
      const key = `${a.pegawaiId}-${format(a.tanggal, 'yyyy-MM-dd')}`;
      absensiMap.set(key, a);
    });

    // Calculate report for each employee
    const report = pegawaiList.map(pegawai => {
      let hadir = 0;
      let izin = 0;
      let sakit = 0;
      let alfa = 0;
      let totalTerlambat = 0;
      let totalLembur = 0;
      let totalJamKerja = 0;
      let terlambatCount = 0;

      workingDays.forEach(day => {
        const key = `${pegawai.id}-${format(day, 'yyyy-MM-dd')}`;
        const absensi = absensiMap.get(key);

        if (absensi) {
          switch (absensi.status) {
            case 'HADIR':
              hadir++;
              if (absensi.terlambat > 0) {
                totalTerlambat += absensi.terlambat;
                terlambatCount++;
              }
              if (absensi.lembur > 0) {
                totalLembur += absensi.lembur;
              }
              if (absensi.totalJamKerja > 0) {
                totalJamKerja += absensi.totalJamKerja;
              }
              break;
            case 'IZIN':
              izin++;
              break;
            case 'SAKIT':
              sakit++;
              break;
            case 'ALFA':
              alfa++;
              break;
          }
        } else {
          // If no record and day has passed, count as alfa
          if (day < new Date()) {
            alfa++;
          }
        }
      });

      return {
        pegawai: {
          id: pegawai.id,
          nip: pegawai.nip,
          nama: pegawai.nama,
          jabatan: pegawai.jabatan,
          departemen: pegawai.departemen,
        },
        summary: {
          hariKerja: workingDays.length,
          hadir,
          izin,
          sakit,
          alfa,
          terlambatCount,
          totalTerlambat,
          totalTerlambatFormatted: `${Math.floor(totalTerlambat / 60)}j ${totalTerlambat % 60}m`,
          totalLembur,
          totalLemburFormatted: `${Math.floor(totalLembur / 60)}j ${totalLembur % 60}m`,
          totalJamKerja,
          totalJamKerjaFormatted: `${Math.floor(totalJamKerja / 60)}j ${totalJamKerja % 60}m`,
          persentaseKehadiran: workingDays.length > 0 
            ? Math.round((hadir / workingDays.length) * 100) 
            : 0,
        },
      };
    });

    // Overall summary
    const overallSummary = {
      bulan: month,
      tahun: year,
      hariKerja: workingDays.length,
      hariLibur: holidays.length,
      totalPegawai: pegawaiList.length,
      totalHadir: report.reduce((sum, r) => sum + r.summary.hadir, 0),
      totalIzin: report.reduce((sum, r) => sum + r.summary.izin, 0),
      totalSakit: report.reduce((sum, r) => sum + r.summary.sakit, 0),
      totalAlfa: report.reduce((sum, r) => sum + r.summary.alfa, 0),
    };

    res.json({
      success: true,
      data: {
        periode: `${format(monthStart, 'MMMM yyyy')}`,
        summary: overallSummary,
        holidays: holidays.map(h => ({
          tanggal: format(h.tanggal, 'dd/MM/yyyy'),
          keterangan: h.keterangan,
        })),
        report,
      },
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get monthly report',
      error: error.message,
    });
  }
};

// Export to CSV
const exportCSV = async (req, res) => {
  try {
    const { bulan, tahun, pegawaiId, departemen } = req.query;
    
    const month = parseInt(bulan) || new Date().getMonth() + 1;
    const year = parseInt(tahun) || new Date().getFullYear();
    
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = endOfMonth(monthStart);

    // Get all working days (exclude weekends)
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get holidays
    const holidays = await prisma.hariLibur.findMany({
      where: {
        tanggal: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
    const holidayDates = new Set(holidays.map(h => format(h.tanggal, 'yyyy-MM-dd')));

    const workingDays = allDays.filter(day => {
      return !isWeekend(day) && !holidayDates.has(format(day, 'yyyy-MM-dd'));
    });

    // Get pegawai filter
    const pegawaiWhere = { statusAktif: true };
    if (pegawaiId) {
      pegawaiWhere.id = parseInt(pegawaiId);
    }
    if (departemen) {
      pegawaiWhere.departemen = departemen;
    }

    const pegawaiList = await prisma.pegawai.findMany({
      where: pegawaiWhere,
      orderBy: { nama: 'asc' },
    });

    const absensiList = await prisma.absensi.findMany({
      where: {
        tanggal: {
          gte: monthStart,
          lte: monthEnd,
        },
        pegawaiId: pegawaiId ? parseInt(pegawaiId) : undefined,
      },
    });

    const absensiMap = new Map();
    absensiList.forEach(a => {
      const key = `${a.pegawaiId}-${format(a.tanggal, 'yyyy-MM-dd')}`;
      absensiMap.set(key, a);
    });

    // Build CSV data
    const csvData = pegawaiList.map(pegawai => {
      let hadir = 0, izin = 0, sakit = 0, alfa = 0;
      let totalTerlambat = 0, totalLembur = 0, totalJamKerja = 0;

      workingDays.forEach(day => {
        const key = `${pegawai.id}-${format(day, 'yyyy-MM-dd')}`;
        const absensi = absensiMap.get(key);

        if (absensi) {
          switch (absensi.status) {
            case 'HADIR': hadir++; break;
            case 'IZIN': izin++; break;
            case 'SAKIT': sakit++; break;
            case 'ALFA': alfa++; break;
          }
          totalTerlambat += absensi.terlambat || 0;
          totalLembur += absensi.lembur || 0;
          totalJamKerja += absensi.totalJamKerja || 0;
        } else if (day < new Date()) {
          alfa++;
        }
      });

      return {
        NIP: pegawai.nip,
        Nama: pegawai.nama,
        Jabatan: pegawai.jabatan,
        Departemen: pegawai.departemen,
        'Hari Kerja': workingDays.length,
        Hadir: hadir,
        Izin: izin,
        Sakit: sakit,
        Alfa: alfa,
        'Total Terlambat (menit)': totalTerlambat,
        'Total Lembur (menit)': totalLembur,
        'Total Jam Kerja (menit)': totalJamKerja,
        'Persentase Kehadiran': `${Math.round((hadir / workingDays.length) * 100)}%`,
      };
    });

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=laporan-absensi-${month}-${year}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export CSV',
      error: error.message,
    });
  }
};

// Export to PDF
const exportPDF = async (req, res) => {
  try {
    const { bulan, tahun, pegawaiId, departemen } = req.query;
    
    const month = parseInt(bulan) || new Date().getMonth() + 1;
    const year = parseInt(tahun) || new Date().getFullYear();
    
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = endOfMonth(monthStart);

    // Get all working days (exclude weekends)
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get holidays
    const holidays = await prisma.hariLibur.findMany({
      where: {
        tanggal: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
    const holidayDates = new Set(holidays.map(h => format(h.tanggal, 'yyyy-MM-dd')));

    const workingDays = allDays.filter(day => {
      return !isWeekend(day) && !holidayDates.has(format(day, 'yyyy-MM-dd'));
    });

    // Get pegawai filter
    const pegawaiWhere = { statusAktif: true };
    if (pegawaiId) {
      pegawaiWhere.id = parseInt(pegawaiId);
    }
    if (departemen) {
      pegawaiWhere.departemen = departemen;
    }

    const pegawaiList = await prisma.pegawai.findMany({
      where: pegawaiWhere,
      orderBy: { nama: 'asc' },
    });

    const absensiList = await prisma.absensi.findMany({
      where: {
        tanggal: {
          gte: monthStart,
          lte: monthEnd,
        },
        pegawaiId: pegawaiId ? parseInt(pegawaiId) : undefined,
      },
    });

    const absensiMap = new Map();
    absensiList.forEach(a => {
      const key = `${a.pegawaiId}-${format(a.tanggal, 'yyyy-MM-dd')}`;
      absensiMap.set(key, a);
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=laporan-absensi-${month}-${year}.pdf`);
    
    doc.pipe(res);

    // Title
    doc.fontSize(18).text('LAPORAN ABSENSI KARYAWAN', { align: 'center' });
    doc.fontSize(12).text(`Periode: ${format(monthStart, 'MMMM yyyy')}`, { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(10).text(`Total Hari Kerja: ${workingDays.length}`);
    doc.text(`Total Pegawai: ${pegawaiList.length}`);
    doc.moveDown();

    // Table Header
    const tableTop = doc.y;
    const columns = ['No', 'NIP', 'Nama', 'Departemen', 'Hadir', 'Izin', 'Sakit', 'Alfa', 'Terlambat', 'Lembur', '%'];
    const colWidths = [30, 60, 120, 80, 40, 40, 40, 40, 60, 60, 40];
    let xPos = 50;

    doc.font('Helvetica-Bold');
    columns.forEach((col, i) => {
      doc.text(col, xPos, tableTop, { width: colWidths[i], align: 'left' });
      xPos += colWidths[i];
    });
    doc.font('Helvetica');

    // Table Rows
    let yPos = tableTop + 20;
    pegawaiList.forEach((pegawai, index) => {
      let hadir = 0, izin = 0, sakit = 0, alfa = 0;
      let totalTerlambat = 0, totalLembur = 0;

      workingDays.forEach(day => {
        const key = `${pegawai.id}-${format(day, 'yyyy-MM-dd')}`;
        const absensi = absensiMap.get(key);

        if (absensi) {
          switch (absensi.status) {
            case 'HADIR': hadir++; break;
            case 'IZIN': izin++; break;
            case 'SAKIT': sakit++; break;
            case 'ALFA': alfa++; break;
          }
          totalTerlambat += absensi.terlambat || 0;
          totalLembur += absensi.lembur || 0;
        } else if (day < new Date()) {
          alfa++;
        }
      });

      const persen = Math.round((hadir / workingDays.length) * 100);
      const terlambatStr = `${Math.floor(totalTerlambat / 60)}j${totalTerlambat % 60}m`;
      const lemburStr = `${Math.floor(totalLembur / 60)}j${totalLembur % 60}m`;

      xPos = 50;
      const rowData = [
        index + 1,
        pegawai.nip,
        pegawai.nama,
        pegawai.departemen,
        hadir,
        izin,
        sakit,
        alfa,
        terlambatStr,
        lemburStr,
        `${persen}%`
      ];

      rowData.forEach((data, i) => {
        doc.text(String(data), xPos, yPos, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i];
      });

      yPos += 18;

      // Add new page if needed
      if (yPos > 500) {
        doc.addPage();
        yPos = 50;
      }
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).text(`Dicetak pada: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export PDF',
      error: error.message,
    });
  }
};

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Today's attendance
    const todayAbsensi = await prisma.absensi.findMany({
      where: {
        tanggal: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lte: new Date(today.setHours(23, 59, 59, 999)),
        },
      },
    });

    // Total employees
    const totalPegawai = await prisma.pegawai.count({
      where: { statusAktif: true },
    });

    // This month's attendance
    const monthlyAbsensi = await prisma.absensi.findMany({
      where: {
        tanggal: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Calculate stats
    // Get unique employees who have attended today
    const uniquePegawaiToday = new Set(todayAbsensi.map(a => a.pegawaiId));
    const pegawaiSudahAbsen = uniquePegawaiToday.size;

    const todayStats = {
      hadir: todayAbsensi.filter(a => a.status === 'HADIR').length,
      izin: todayAbsensi.filter(a => a.status === 'IZIN').length,
      sakit: todayAbsensi.filter(a => a.status === 'SAKIT').length,
      terlambat: todayAbsensi.filter(a => a.terlambat > 0).length,
      belumAbsen: totalPegawai - pegawaiSudahAbsen,
    };

    const monthlyStats = {
      totalHadir: monthlyAbsensi.filter(a => a.status === 'HADIR').length,
      totalIzin: monthlyAbsensi.filter(a => a.status === 'IZIN').length,
      totalSakit: monthlyAbsensi.filter(a => a.status === 'SAKIT').length,
      totalTerlambat: monthlyAbsensi.filter(a => a.terlambat > 0).length,
      totalLembur: monthlyAbsensi.reduce((sum, a) => sum + (a.lembur || 0), 0),
    };

    res.json({
      success: true,
      data: {
        totalPegawai,
        today: todayStats,
        monthly: monthlyStats,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error.message,
    });
  }
};

module.exports = { getMonthlyReport, exportCSV, exportPDF, getDashboardStats };
