"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { jalaliDateKey } from "@/lib/utils";

export type StudentWithCounts = Awaited<ReturnType<typeof getStudents>>[number];

export async function getStudents(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    : {};
  return prisma.student.findMany({
    where,
    include: {
      _count: {
        select: { sessions: true, enrollments: true, payments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudent(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: {
        orderBy: { createdAt: "desc" },
      },
      sessions: {
        orderBy: { date: "desc" },
        take: 50,
      },
      payments: {
        orderBy: { date: "desc" },
      },
    },
  });
}

export async function createStudent(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const type = String(formData.get("type") || "SEMI_PRIVATE");
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!name) return { error: "نام الزامی است" };

  const student = await prisma.student.create({
    data: { name, phone, type, notes },
  });

  revalidatePath("/students");
  revalidatePath("/dashboard");
  return { success: true, id: student.id };
}

export async function updateStudent(id: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const type = String(formData.get("type") || "SEMI_PRIVATE");
  const status = String(formData.get("status") || "ACTIVE");
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!name) return { error: "نام الزامی است" };

  await prisma.student.update({
    where: { id },
    data: { name, phone, type, status, notes },
  });

  revalidatePath(`/students/${id}`);
  revalidatePath("/students");
  return { success: true };
}

export async function deleteStudent(id: string) {
  await prisma.student.delete({ where: { id } });
  revalidatePath("/students");
  revalidatePath("/dashboard");
  return { success: true };
}

// ─── Enrollment Actions ─────────────────────────────────────────────

export async function createEnrollment(formData: FormData) {
  const studentId = String(formData.get("studentId"));
  const classType = String(formData.get("classType") || "SEMI_PRIVATE");
  const dayType = String(formData.get("dayType") || "ODD");
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "").trim() || null;
  const startDate = String(formData.get("startDate") || jalaliDateKey(new Date()));
  const totalSessions = parseInt(String(formData.get("totalSessions"))) || 10;
  const pricePerSession = parseInt(String(formData.get("pricePerSession"))) || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!studentId || !startTime) return { error: "شاگرد و زمان شروع الزامی است" };

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId,
      classType,
      dayType,
      startTime,
      endTime,
      startDate,
      totalSessions,
      pricePerSession,
      notes,
    },
  });

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  return { success: true, id: enrollment.id };
}

export async function deleteEnrollment(id: string, studentId: string) {
  await prisma.enrollment.delete({ where: { id } });
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  return { success: true };
}
