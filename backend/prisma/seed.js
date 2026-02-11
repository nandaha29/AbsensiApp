const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@absensi.com' },
    update: {},
    create: {
      email: 'admin@absensi.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Sample Employees
  const employees = [
    { nip: 'EMP001', nama: 'Budi Santoso', jabatan: 'Software Engineer', departemen: 'IT', tipePembayaran: 'TETAP' },
    { nip: 'EMP002', nama: 'Siti Rahayu', jabatan: 'UI/UX Designer', departemen: 'Design', tipePembayaran: 'TETAP' },
    { nip: 'EMP003', nama: 'Ahmad Fauzi', jabatan: 'Project Manager', departemen: 'Management', tipePembayaran: 'TETAP' },
    { nip: 'EMP004', nama: 'Dewi Kusuma', jabatan: 'HR Manager', departemen: 'HR', tipePembayaran: 'TETAP' },
    { nip: 'EMP005', nama: 'Rudi Hartono', jabatan: 'Backend Developer', departemen: 'IT', tipePembayaran: 'PERJAM', tarifPerJam: 25000 },
    { nip: 'EMP006', nama: 'Nina Permata', jabatan: 'Frontend Developer', departemen: 'IT', tipePembayaran: 'PERJAM', tarifPerJam: 25000 },
    { nip: 'EMP007', nama: 'Eko Prasetyo', jabatan: 'QA Engineer', departemen: 'IT', tipePembayaran: 'TETAP' },
    { nip: 'EMP008', nama: 'Maya Sari', jabatan: 'Finance Staff', departemen: 'Finance', tipePembayaran: 'TETAP' },
    { nip: 'EMP009', nama: 'Freelancer A', jabatan: 'Graphic Designer', departemen: 'Design', tipePembayaran: 'PERJAM', tarifPerJam: 30000 },
    { nip: 'EMP010', nama: 'Freelancer B', jabatan: 'Content Writer', departemen: 'Marketing', tipePembayaran: 'PERJAM', tarifPerJam: 20000 },
  ];

  for (const emp of employees) {
    const password = await bcrypt.hash('employee123', 10);
    const user = await prisma.user.upsert({
      where: { email: `${emp.nip.toLowerCase()}@absensi.com` },
      update: {},
      create: {
        email: `${emp.nip.toLowerCase()}@absensi.com`,
        password: password,
        role: 'EMPLOYEE',
      },
    });

    await prisma.pegawai.upsert({
      where: { nip: emp.nip },
      update: {},
      create: {
        nip: emp.nip,
        nama: emp.nama,
        jabatan: emp.jabatan,
        departemen: emp.departemen,
        tipePembayaran: emp.tipePembayaran,
        tarifPerJam: emp.tarifPerJam,
        userId: user.id,
      },
    });
  }
  console.log('✅ Employees created');

  // Create National Holidays for 2025-2026
  const holidays = [
    { tanggal: new Date('2025-01-01'), keterangan: 'Tahun Baru 2025' },
    { tanggal: new Date('2025-03-29'), keterangan: 'Isra Mi\'raj Nabi Muhammad SAW' },
    { tanggal: new Date('2025-03-31'), keterangan: 'Hari Raya Nyepi' },
    { tanggal: new Date('2025-04-01'), keterangan: 'Hari Raya Nyepi' },
    { tanggal: new Date('2025-04-18'), keterangan: 'Wafat Isa Almasih' },
    { tanggal: new Date('2025-05-01'), keterangan: 'Hari Buruh Internasional' },
    { tanggal: new Date('2025-05-12'), keterangan: 'Kenaikan Isa Almasih' },
    { tanggal: new Date('2025-05-29'), keterangan: 'Hari Raya Waisak' },
    { tanggal: new Date('2025-06-01'), keterangan: 'Hari Lahir Pancasila' },
    { tanggal: new Date('2025-07-07'), keterangan: 'Hari Raya Idul Adha' },
    { tanggal: new Date('2025-08-17'), keterangan: 'Hari Kemerdekaan RI' },
    { tanggal: new Date('2025-09-05'), keterangan: 'Hari Raya Idul Fitri' },
    { tanggal: new Date('2025-12-25'), keterangan: 'Natal' },
    { tanggal: new Date('2026-01-01'), keterangan: 'Tahun Baru 2026' },
    { tanggal: new Date('2026-02-17'), keterangan: 'Tahun Baru Imlek' },
    { tanggal: new Date('2026-03-17'), keterangan: 'Isra Mi\'raj Nabi Muhammad SAW' },
    { tanggal: new Date('2026-03-20'), keterangan: 'Hari Raya Nyepi' },
    { tanggal: new Date('2026-04-03'), keterangan: 'Wafat Isa Almasih' },
    { tanggal: new Date('2026-05-01'), keterangan: 'Hari Buruh Internasional' },
    { tanggal: new Date('2026-05-14'), keterangan: 'Kenaikan Isa Almasih' },
    { tanggal: new Date('2026-05-18'), keterangan: 'Hari Raya Waisak' },
    { tanggal: new Date('2026-06-01'), keterangan: 'Hari Lahir Pancasila' },
    { tanggal: new Date('2026-06-17'), keterangan: 'Hari Raya Idul Adha' },
    { tanggal: new Date('2026-08-17'), keterangan: 'Hari Kemerdekaan RI' },
    { tanggal: new Date('2026-08-25'), keterangan: 'Hari Raya Idul Fitri' },
    { tanggal: new Date('2026-12-25'), keterangan: 'Natal' },
  ];

  for (const holiday of holidays) {
    await prisma.hariLibur.upsert({
      where: { tanggal: holiday.tanggal },
      update: {},
      create: holiday,
    });
  }
  console.log('✅ National holidays created');

  // Create sample attendance data
  await createSampleAttendanceData();

  // Create sample monthly requests
  await createSampleMonthlyRequests();

  console.log('🎉 Seeding completed!');
}

async function createSampleAttendanceData() {
  const employees = await prisma.pegawai.findMany();
  const holidays = await prisma.hariLibur.findMany();

  // Generate attendance data for Jan 2025 - Dec 2026 (2 years)
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2026-12-31');

  for (const employee of employees) {
    console.log(`📝 Creating attendance for ${employee.nama}...`);

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidays.some(h => h.tanggal.toDateString() === currentDate.toDateString());

      if (!isWeekend && !isHoliday) {
        await createAttendanceForEmployee(employee, currentDate);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
}

async function createAttendanceForEmployee(employee, date) {
  const employeeScenarios = {
    'EMP001': 'rajin',        // Budi Santoso - Software Engineer (rajin)
    'EMP002': 'terlambat',    // Siti Rahayu - UI/UX Designer (sering terlambat)
    'EMP003': 'lembur',       // Ahmad Fauzi - Project Manager (sering lembur)
    'EMP004': 'izin',         // Dewi Kusuma - HR Manager (sering izin)
    'EMP005': 'rajin',        // Rudi Hartono - Backend Developer (rajin)
    'EMP006': 'sakit',        // Nina Permata - Frontend Developer (sering sakit)
    'EMP007': 'normal',       // Eko Prasetyo - QA Engineer (normal)
    'EMP008': 'rajin',        // Maya Sari - Finance Staff (rajin)
    'EMP009': 'freelancer',   // Freelancer A - Graphic Designer (freelancer)
    'EMP010': 'freelancer',   // Freelancer B - Content Writer (freelancer)
  };

  const scenario = employeeScenarios[employee.nip] || 'normal';
  const attendanceData = generateAttendanceData(scenario, date, employee.nip);

  if (attendanceData) {
    await prisma.absensi.upsert({
      where: {
        pegawaiId_tanggal: {
          pegawaiId: employee.id,
          tanggal: date,
        },
      },
      update: {},
      create: {
        pegawaiId: employee.id,
        tanggal: date,
        ...attendanceData,
      },
    });
  }
}

function generateAttendanceData(scenario, date, nip) {
  const random = Math.random();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;

  // Seasonal variations
  const isBusySeason = month === 11 || month === 10;
  const isHolidaySeason = month === 12 || month === 1;

  switch (scenario) {
    case 'rajin':
      if (random < 0.97) {
        const jamMasuk = new Date(date);
        jamMasuk.setHours(8, Math.floor(Math.random() * 5), 0);
        const jamPulang = new Date(date);
        let overtime = isBusySeason && random < 0.3 ? Math.floor(Math.random() * 120) + 30 : Math.floor(Math.random() * 30);
        jamPulang.setHours(17, overtime, 0);
        return {
          jamMasuk,
          jamPulang,
          status: 'HADIR',
          terlambat: 0,
          lembur: overtime,
          totalJamKerja: Math.floor((jamPulang - jamMasuk) / (1000 * 60)),
        };
      }
      break;

    case 'terlambat':
      if (random < 0.9) {
        const jamMasuk = new Date(date);
        const lateMinutes = Math.floor(Math.random() * 60) + 15;
        jamMasuk.setHours(8, lateMinutes, 0);
        const jamPulang = new Date(date);
        jamPulang.setHours(17, Math.floor(Math.random() * 30) + 30, 0);
        return {
          jamMasuk,
          jamPulang,
          status: 'HADIR',
          terlambat: lateMinutes,
          lembur: 0,
          totalJamKerja: Math.floor((jamPulang - jamMasuk) / (1000 * 60)),
        };
      }
      break;

    case 'lembur':
      if (random < 0.95) {
        const jamMasuk = new Date(date);
        jamMasuk.setHours(8, Math.floor(Math.random() * 10), 0);
        const jamPulang = new Date(date);
        const overtimeHours = isBusySeason ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 2) + 1;
        jamPulang.setHours(17 + overtimeHours, Math.floor(Math.random() * 60), 0);
        return {
          jamMasuk,
          jamPulang,
          status: 'HADIR',
          terlambat: 0,
          lembur: overtimeHours * 60,
          totalJamKerja: Math.floor((jamPulang - jamMasuk) / (1000 * 60)),
        };
      }
      break;

    case 'izin':
      if (random < 0.75) {
        const jamMasuk = new Date(date);
        jamMasuk.setHours(8, Math.floor(Math.random() * 10), 0);
        const jamPulang = new Date(date);
        jamPulang.setHours(17, Math.floor(Math.random() * 30) + 30, 0);
        return {
          jamMasuk,
          jamPulang,
          status: 'HADIR',
          terlambat: 0,
          lembur: 0,
          totalJamKerja: Math.floor((jamPulang - jamMasuk) / (1000 * 60)),
        };
      } else if (random < 0.9) {
        const reasons = ['Izin keluarga', 'Izin pribadi', 'Izin dokter', 'Izin acara penting'];
        return {
          status: 'IZIN',
          keterangan: reasons[Math.floor(Math.random() * reasons.length)],
          terlambat: 0,
          lembur: 0,
          totalJamKerja: 0,
        };
      }
      break;

    case 'sakit':
      if (random < 0.8) {
        const jamMasuk = new Date(date);
        jamMasuk.setHours(8, Math.floor(Math.random() * 10), 0);
        const jamPulang = new Date(date);
        jamPulang.setHours(17, Math.floor(Math.random() * 30) + 30, 0);
        return {
          jamMasuk,
          jamPulang,
          status: 'HADIR',
          terlambat: 0,
          lembur: 0,
          totalJamKerja: Math.floor((jamPulang - jamMasuk) / (1000 * 60)),
        };
      } else if (random < 0.95) {
        const reasons = ['Demam', 'Flu', 'Migraine', 'Sakit perut', 'Sakit gigi'];
        return {
          status: 'SAKIT',
          keterangan: `Sakit - ${reasons[Math.floor(Math.random() * reasons.length)]}`,
          terlambat: 0,
          lembur: 0,
          totalJamKerja: 0,
        };
      }
      break;

    case 'freelancer':
      if (random < 0.85) {
        const jamMasuk = new Date(date);
        const startHour = 7 + Math.floor(Math.random() * 4);
        jamMasuk.setHours(startHour, Math.floor(Math.random() * 60), 0);
        const jamPulang = new Date(date);
        const workHours = 6 + Math.floor(Math.random() * 4);
        jamPulang.setTime(jamMasuk.getTime() + workHours * 60 * 60 * 1000);
        return {
          jamMasuk,
          jamPulang,
          status: 'HADIR',
          terlambat: startHour > 8 ? (startHour - 8) * 60 : 0,
          lembur: jamPulang.getHours() >= 18 ? (jamPulang.getHours() - 17) * 60 + jamPulang.getMinutes() : 0,
          totalJamKerja: workHours * 60,
        };
      }
      break;

    default: // normal
      if (random < 0.9) {
        const jamMasuk = new Date(date);
        let lateMinutes = 0;
        if (random < 0.15) {
          lateMinutes = Math.floor(Math.random() * 45) + 5;
        }
        jamMasuk.setHours(8, lateMinutes, 0);
        const jamPulang = new Date(date);
        let pulangHour = 17;
        if (random < 0.2) {
          pulangHour = 18 + Math.floor(Math.random() * 2);
        }
        jamPulang.setHours(pulangHour, Math.floor(Math.random() * 60), 0);
        return {
          jamMasuk,
          jamPulang,
          status: 'HADIR',
          terlambat: lateMinutes,
          lembur: pulangHour >= 18 ? (pulangHour - 17) * 60 + jamPulang.getMinutes() : 0,
          totalJamKerja: Math.floor((jamPulang - jamMasuk) / (1000 * 60)),
        };
      } else if (random < 0.935) {
        return {
          status: 'IZIN',
          keterangan: 'Izin mendadak',
          terlambat: 0,
          lembur: 0,
          totalJamKerja: 0,
        };
      } else if (random < 0.965) {
        return {
          status: 'SAKIT',
          keterangan: 'Sakit ringan',
          terlambat: 0,
          lembur: 0,
          totalJamKerja: 0,
        };
      } else {
        return {
          status: 'ALFA',
          keterangan: 'Tidak hadir tanpa keterangan',
          terlambat: 0,
          lembur: 0,
          totalJamKerja: 0,
        };
      }
  }

  return null;
}

async function createSampleMonthlyRequests() {
  const employees = await prisma.pegawai.findMany();

  // Create requests for November and December 2025
  const months = [
    { bulan: 11, tahun: 2025, namaBulan: 'November' },
    { bulan: 12, tahun: 2025, namaBulan: 'December' },
  ];

  for (const employee of employees) {
    // Only create requests for employees with PERJAM payment type
    if (employee.tipePembayaran === 'PERJAM') {
      for (const month of months) {
        const requestData = generateMonthlyRequestData(employee, month);
        if (requestData) {
          await prisma.requestJamBulanan.upsert({
            where: {
              pegawaiId_bulan_tahun: {
                pegawaiId: employee.id,
                bulan: month.bulan,
                tahun: month.tahun,
              },
            },
            update: {},
            create: requestData,
          });
        }
      }
    }
  }
}

function generateMonthlyRequestData(employee, month) {
  const workingDays = getWorkingDaysInMonth(month.tahun, month.bulan);
  const details = [];

  // Generate daily breakdown
  for (const day of workingDays) {
    const dateStr = day.toISOString().split('T')[0];
    const dailyData = generateDailyWorkData(employee, day);

    if (dailyData) {
      // Convert time strings to DateTime objects
      const checkinDate = new Date(`${dateStr}T${dailyData.jamCheckin}:00`);
      const checkoutDate = new Date(`${dateStr}T${dailyData.jamCheckout}:00`);

      details.push({
        tanggal: day,
        jamCheckin: checkinDate,
        jamCheckout: checkoutDate,
        jamKerja: dailyData.totalJam,
        deskripsi: dailyData.deskripsi,
      });
    }
  }

  const totalJam = details.reduce((sum, detail) => sum + detail.jamKerja, 0);

  return {
    pegawaiId: employee.id,
    bulan: month.bulan,
    tahun: month.tahun,
    totalJam: Math.round(totalJam),
    status: Math.random() < 0.7 ? 'APPROVED' : Math.random() < 0.9 ? 'PENDING' : 'REJECTED',
    deskripsi: `Jam kerja ${month.namaBulan} ${month.tahun} - ${employee.nama}`,
    details: {
      create: details,
    },
  };
}

function generateDailyWorkData(employee, date) {
  const scenarios = {
    'EMP005': 'freelancer_heavy', // Rudi Hartono - heavy workload
    'EMP006': 'freelancer_light', // Nina Permata - lighter workload
    'EMP009': 'freelancer_design', // Freelancer A - design work
    'EMP010': 'freelancer_content', // Freelancer B - content work
  };

  const scenario = scenarios[employee.nip] || 'freelancer_normal';
  const random = Math.random();

  // 90% chance of working on a weekday
  if (random < 0.9) {
    let workHours, jamCheckin, jamCheckout, deskripsi;

    switch (scenario) {
      case 'freelancer_heavy':
        workHours = 8 + Math.floor(Math.random() * 4); // 8-11 hours
        jamCheckin = '08:00';
        jamCheckout = `${16 + Math.floor(workHours / 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
        deskripsi = 'Development work';
        break;

      case 'freelancer_light':
        workHours = 6 + Math.floor(Math.random() * 3); // 6-8 hours
        jamCheckin = '09:00';
        jamCheckout = `${15 + Math.floor(workHours / 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
        deskripsi = 'Frontend development';
        break;

      case 'freelancer_design':
        workHours = 7 + Math.floor(Math.random() * 3); // 7-9 hours
        jamCheckin = '08:30';
        jamCheckout = `${15 + Math.floor(workHours / 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
        deskripsi = 'Graphic design project';
        break;

      case 'freelancer_content':
        workHours = 5 + Math.floor(Math.random() * 3); // 5-7 hours
        jamCheckin = '10:00';
        jamCheckout = `${15 + Math.floor(workHours / 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
        deskripsi = 'Content writing';
        break;

      default:
        workHours = 6 + Math.floor(Math.random() * 4); // 6-9 hours
        jamCheckin = '09:00';
        jamCheckout = `${15 + Math.floor(workHours / 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
        deskripsi = 'Freelance work';
    }

    return {
      jamCheckin,
      jamCheckout,
      totalJam: workHours,
      deskripsi,
    };
  }

  return null;
}

function getWorkingDaysInMonth(year, month) {
  const workingDays = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays.push(date);
    }
  }

  return workingDays;
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });