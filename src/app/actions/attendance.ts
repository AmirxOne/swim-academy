"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getDayTypeForDate, isEnrollmentDay } from "@/lib/utils";

/**
 * Get today's schedule: active enrollments whose day type matches today,
 * grouped by start time. Includes the session record for today if it exists.
 */
export async function getTodaySchedule(date?: Date) {
  const targetDate = date || new Date();
  const dateStr = targetDate.toISOString().slice(0, 10);

  // Get all active enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: { status: "ACTIVE" },
    include: {
      student: true,
    },
  });

  // Filter by day type
  const todayEnrollments = enrollments.filter((e) => isEnrollmentDay(e.dayType, targetDate));

  // Get or create sessions for today
  const studentIds = todayEnrollments.map((e) => e.studentId);
  const existingSessions = await prisma.session.findMany({
    where: {
      studentId: { in: studentIds },
      date: dateStr,
    },
  });

  // Build schedule grouped by time slot
  const schedule = todayEnrollments
    .map((e) => {
      const session = existingSessions.find(
        (s) => s.studentId === e.studentId
      );
      return {
        id: session?.id,
        studentId: e.studentId,
        enrollmentId: e.id,
        studentName: e.student.name,
        studentType: e.student.type,
        startTime: e.startTime,
        endTime: e.endTime,
        dayType: e.dayType,
        classType: e.classType,
        sessionStatus: session?.status || "PENDING",
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return schedule;
}

/**
 * Toggle / set attendance status for a student on a specific date.
 * Creates a session record if it doesn't exist.
 */
export async function toggleAttendance(
  studentId: string,
  date: string,
  status: string
) {
  // date is ISO date string (YYYY-MM-DD)
  // Find existing session
  const existing = await prisma.session.findFirst({
    where: { studentId, date },
  });

  let session;
  if (existing) {
    session = await prisma.session.update({
      where: { id: existing.id },
      data: { status },
    });
  } else {
    session = await prisma.session.create({
      data: { studentId, date, status },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  return { status: session.status };
}

/**
 * Get attendance data for a specific date.
 */
export async function getAttendanceForDate(date: Date) {
  const dateStr = date.toISOString().slice(0, 10);
  const todayType = getDayTypeForDate(date);

  const enrollments = await prisma.enrollment.findMany({
    where: { status: "ACTIVE" },
    include: { student: true },
  });

  const dayEnrollments = enrollments.filter((e) => isEnrollmentDay(e.dayType, date));

  const sessions = await prisma.session.findMany({
    where: {
      studentId: { in: dayEnrollments.map((e) => e.studentId) },
      date: dateStr,
    },
  });

  return dayEnrollments
    .map((e) => {
      const session = sessions.find((s) => s.studentId === e.studentId);
      return {
        id: session?.id,
        studentId: e.studentId,
        studentName: e.student.name,
        studentType: e.student.type,
        startTime: e.startTime,
        endTime: e.endTime,
        dayType: e.dayType,
        sessionStatus: session?.status || "PENDING",
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}
