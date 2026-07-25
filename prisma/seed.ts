import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.session.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.settings.deleteMany();

  // Settings
  await prisma.settings.create({
    data: {
      id: "singleton",
      instructorName: "استاد محمدی",
      poolName: "استخر ۹ دی",
      semiPrivateShare: 0.315,
      unregisteredShare: 0.35,
      privateShare: 0.45,
      semiPrivatePrice: 2205000,
      unregisteredPrice: 2450000,
      privateKey: 3825000,
      adminPasswordHash: "admin123",
    },
  });

  // Students
  const ali = await prisma.student.create({
    data: {
      name: "علی رضایی",
      phone: "09121111111",
      type: "SEMI_PRIVATE",
      status: "ACTIVE",
      notes: "سطح متوسط",
    },
  });

  const sara = await prisma.student.create({
    data: {
      name: "سارا احمدی",
      phone: "09122222222",
      type: "PRIVATE",
      status: "ACTIVE",
      notes: "سطح پیشرفته",
    },
  });

  const reza = await prisma.student.create({
    data: {
      name: "رضا کریمی",
      phone: "09123333333",
      type: "SEMI_PRIVATE",
      status: "ACTIVE",
    },
  });

  const maryam = await prisma.student.create({
    data: {
      name: "مریم حسینی",
      phone: "09124444444",
      type: "UNREGISTERED",
      status: "ACTIVE",
      notes: "مبتدی",
    },
  });

  const hosein = await prisma.student.create({
    data: {
      name: "حسین موسوی",
      phone: "09125555555",
      type: "SEMI_PRIVATE",
      status: "ACTIVE",
    },
  });

  const fateme = await prisma.student.create({
    data: {
      name: "فاطمه نوری",
      phone: "09126666666",
      type: "PRIVATE",
      status: "INACTIVE",
      notes: "استراحت پزشکی",
    },
  });

  // Enrollments
  const today = new Date();
  const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  await prisma.enrollment.create({
    data: {
      studentId: ali.id,
      classType: "SEMI_PRIVATE",
      dayType: "ODD",
      startTime: "10:00",
      endTime: "11:00",
      startDate,
      totalSessions: 12,
      pricePerSession: 220500,
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: sara.id,
      classType: "PRIVATE",
      dayType: "EVEN",
      startTime: "09:00",
      endTime: "10:00",
      startDate,
      totalSessions: 10,
      pricePerSession: 382500,
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: reza.id,
      classType: "SEMI_PRIVATE",
      dayType: "ODD",
      startTime: "10:00",
      endTime: "11:00",
      startDate,
      totalSessions: 12,
      pricePerSession: 220500,
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: maryam.id,
      classType: "UNREGISTERED",
      dayType: "ODD",
      startTime: "11:00",
      endTime: "12:00",
      startDate,
      totalSessions: 10,
      pricePerSession: 245000,
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: hosein.id,
      classType: "SEMI_PRIVATE",
      dayType: "EVEN",
      startTime: "11:00",
      endTime: "12:00",
      startDate,
      totalSessions: 12,
      pricePerSession: 220500,
    },
  });

  // Payments
  const paymentDate = startDate;
  await prisma.payment.create({
    data: {
      studentId: ali.id,
      amount: 2205000,
      type: "TUITION",
      status: "PAID",
      date: paymentDate,
      note: "شهریه دوره جدید",
    },
  });

  await prisma.payment.create({
    data: {
      studentId: sara.id,
      amount: 3825000,
      type: "TUITION",
      status: "PAID",
      date: paymentDate,
      note: "شهریه خصوصی",
    },
  });

  await prisma.payment.create({
    data: {
      studentId: reza.id,
      amount: 1102500,
      type: "TUITION",
      status: "PAID",
      date: paymentDate,
      note: "نصف شهریه",
    },
  });

  await prisma.payment.create({
    data: {
      studentId: maryam.id,
      amount: 2450000,
      type: "TUITION",
      status: "PAID",
      date: paymentDate,
      note: "شهریه کامل",
    },
  });

  // Sessions (past attendance)
  const sessionsData: Array<{ studentId: string; daysAgo: number; status: string }> = [
    { studentId: ali.id, daysAgo: 2, status: "PRESENT" },
    { studentId: ali.id, daysAgo: 4, status: "PRESENT" },
    { studentId: ali.id, daysAgo: 6, status: "ABSENT" },
    { studentId: sara.id, daysAgo: 1, status: "PRESENT" },
    { studentId: sara.id, daysAgo: 3, status: "PRESENT" },
    { studentId: sara.id, daysAgo: 5, status: "PRESENT" },
    { studentId: reza.id, daysAgo: 2, status: "PRESENT" },
    { studentId: reza.id, daysAgo: 4, status: "ABSENT" },
    { studentId: maryam.id, daysAgo: 2, status: "PRESENT" },
    { studentId: hosein.id, daysAgo: 1, status: "PRESENT" },
    { studentId: hosein.id, daysAgo: 3, status: "PRESENT" },
  ];

  for (const s of sessionsData) {
    const d = new Date();
    d.setDate(d.getDate() - s.daysAgo);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    await prisma.session.create({
      data: {
        studentId: s.studentId,
        date: dStr,
        status: s.status,
      },
    });
  }

  console.log("✅ Seed complete!");
  console.log(`   Created 6 students, 5 enrollments, 4 payments, ${sessionsData.length} sessions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
