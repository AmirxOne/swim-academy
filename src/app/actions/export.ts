"use server";

import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { jalaliDateShort, STUDENT_TYPE_LABELS, SESSION_STATUS_LABELS, DAY_TYPE_LABELS } from "@/lib/utils";

/**
 * Export all students to Excel.
 * Returns a Buffer ready to send as a download.
 */
export async function exportStudentsExcel() {
  const students = await prisma.student.findMany({
    include: {
      enrollments: { where: { status: "ACTIVE" } },
      sessions: true,
      payments: true,
    },
    orderBy: { name: "asc" },
  });

  const rows = students.map((s) => {
    const activeEnrollment = s.enrollments[0];
    const presentCount = s.sessions.filter((sess) => sess.status === "PRESENT").length;
    const absentCount = s.sessions.filter((sess) => sess.status === "ABSENT").length;
    const consumed = presentCount + absentCount;
    const totalPaid = s.payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);
    const remaining = activeEnrollment ? activeEnrollment.totalSessions - consumed : 0;

    return {
      "نام": s.name,
      "تلفن": s.phone || "",
      "نوع کلاس": STUDENT_TYPE_LABELS[s.type] || s.type,
      "روزهای کلاس": activeEnrollment ? DAY_TYPE_LABELS[activeEnrollment.dayType] || activeEnrollment.dayType : "",
      "ساعت": activeEnrollment ? activeEnrollment.startTime : "",
      "تاریخ شروع": activeEnrollment ? activeEnrollment.startDate : "",
      "جلسات کل": activeEnrollment ? activeEnrollment.totalSessions : 0,
      "حضور": presentCount,
      "غیب": absentCount,
      "باقی‌مانده": remaining,
      "وضعیت": s.status === "ACTIVE" ? "فعال" : "غیرفعال",
      "کل پرداختی": totalPaid,
      "یادداشت": s.notes || "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 8 },
    { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 },
    { wch: 8 }, { wch: 16 }, { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "شاگردان");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buf;
}

/**
 * Export attendance for a date range to Excel.
 */
export async function exportAttendanceExcel() {
  const sessions = await prisma.session.findMany({
    include: { student: true },
    orderBy: { date: "desc" },
  });

  const rows = sessions.map((s) => ({
    "تاریخ": jalaliDateShort(s.date),
    "نام شاگرد": s.student.name,
    "نوع کلاس": STUDENT_TYPE_LABELS[s.student.type] || s.student.type,
    "وضعیت": SESSION_STATUS_LABELS[s.status] || s.status,
    "یادداشت": s.note || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "حضور و غیاب");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buf;
}

/**
 * Export all payments to Excel.
 */
export async function exportFinanceExcel() {
  const payments = await prisma.payment.findMany({
    include: { student: true },
    orderBy: { date: "desc" },
  });

  const rows = payments.map((p) => ({
    "تاریخ": jalaliDateShort(p.date),
    "نام شاگرد": p.student.name,
    "نوع کلاس": STUDENT_TYPE_LABELS[p.student.type] || p.student.type,
    "مبلغ (تومان)": p.amount,
    "نوع پرداخت": p.type === "TUITION" ? "شهریه" : p.type,
    "وضعیت": p.status === "PAID" ? "پرداخت شده" : "در انتظار",
    "یادداشت": p.note || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "مالی");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buf;
}
