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
        userId: user.id,
        jamMasuk: '08:00',
        jamPulang: '17:00',
        statusAktif: true,
        tipePembayaran: emp.tipePembayaran,
        tarifPerJam: emp.tarifPerJam || null,
      },
    });
    console.log(`✅ Employee created: ${emp.nama}`);
  }

  // Create National Holidays for 2026
  const holidays = [
    { tanggal: new Date('2026-01-01'), keterangan: 'Tahun Baru 2026' },
    { tanggal: new Date('2026-02-12'), keterangan: 'Tahun Baru Imlek' },
    { tanggal: new Date('2026-03-20'), keterangan: 'Hari Raya Nyepi' },
    { tanggal: new Date('2026-03-20'), keterangan: 'Isra Miraj' },
    { tanggal: new Date('2026-04-03'), keterangan: 'Wafat Isa Almasih' },
    { tanggal: new Date('2026-05-01'), keterangan: 'Hari Buruh' },
    { tanggal: new Date('2026-05-13'), keterangan: 'Hari Raya Waisak' },
    { tanggal: new Date('2026-05-21'), keterangan: 'Kenaikan Isa Almasih' },
    { tanggal: new Date('2026-06-01'), keterangan: 'Hari Lahir Pancasila' },
    { tanggal: new Date('2026-06-17'), keterangan: 'Idul Adha' },
    { tanggal: new Date('2026-07-07'), keterangan: 'Tahun Baru Islam' },
    { tanggal: new Date('2026-08-17'), keterangan: 'Hari Kemerdekaan RI' },
    { tanggal: new Date('2026-09-15'), keterangan: 'Maulid Nabi Muhammad' },
    { tanggal: new Date('2026-12-25'), keterangan: 'Hari Natal' },
  ];

  for (const holiday of holidays) {
    await prisma.hariLibur.upsert({
      where: { tanggal: holiday.tanggal },
      update: {},
      create: holiday,
    });
  }
  console.log('✅ National holidays created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
