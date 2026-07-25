"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Add a makeup class for a student on a specific date.
 * Creates a PENDING session with note "جبرانی".
 */
export async function addMakeupClass(
  studentId: string,
  date: string
) {
  // Check if already exists
  const existing = await prisma.session.findFirst({
    where: { studentId, date },
  });

  if (existing) {
    return { error: "برای این شاگرد در این تاریخ قبلاً جلسه ثبت شده است" };
  }

  const session = await prisma.session.create({
    data: {
      studentId,
      date,
      status: "PENDING",
      note: "جبرانی",
    },
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  revalidatePath(`/students/${studentId}`);

  return { session };
}

/**
 * Get all makeup classes (sessions with note "جبرانی").
 */
export async function getMakeupClasses() {
  const sessions = await prisma.session.findMany({
    where: { note: "جبرانی" },
    include: { student: true },
    orderBy: { date: "desc" },
  });

  return sessions.map((s) => ({
    id: s.id,
    studentId: s.studentId,
    studentName: s.student.name,
    studentType: s.student.type,
    date: s.date,
    status: s.status,
  }));
}
