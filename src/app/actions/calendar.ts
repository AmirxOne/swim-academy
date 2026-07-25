"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toJalali, getDayTypeForDate } from "@/lib/utils";

/**
 * Get weekly schedule grid data.
 * Returns all active enrollments mapped to their time slots + day types.
 * Each cell tells you whether it's booked or free.
 */
export async function getWeeklySchedule() {
  const enrollments = await prisma.enrollment.findMany({
    where: { status: "ACTIVE" },
    include: { student: true },
  });

  // Define time slots from 7:00 to 21:00
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7..21

  // Day types: EVEN, ODD, CUSTOM
  // For the grid we show columns: روزهای زوج, روزهای فرد, متفرقه

  type Slot = {
    time: string;
    even: BookingInfo[];
    odd: BookingInfo[];
    custom: BookingInfo[];
    flexible: BookingInfo[];
  };

  type BookingInfo = {
    studentId: string;
    studentName: string;
    classType: string;
    enrollmentId: string;
    endTime?: string | null;
  };

  const grid: Slot[] = hours.map((h) => {
    const timeStr = `${String(h).padStart(2, "0")}:00`;
    return {
      time: timeStr,
      even: [],
      odd: [],
      custom: [],
      flexible: [],
    };
  });

  for (const e of enrollments) {
    const hour = parseInt(e.startTime.split(":")[0]);
    const slotIndex = hour - 7;
    if (slotIndex < 0 || slotIndex >= grid.length) continue;

    const info: BookingInfo = {
      studentId: e.studentId,
      studentName: e.student.name,
      classType: e.student.type,
      enrollmentId: e.id,
      endTime: e.endTime,
    };

    const key = e.dayType.toLowerCase() as "even" | "odd" | "custom" | "flexible";
    if (key === "even" || key === "odd" || key === "custom" || key === "flexible") {
      grid[slotIndex][key].push(info);
    }
  }

  // Get today's info
  const now = new Date();
  const todayType = getDayTypeForDate(now);
  const [jy, jm, jd] = toJalali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  );

  return {
    grid,
    todayType,
    todayJalali: { jy, jm, jd },
    totalActive: enrollments.length,
  };
}

/**
 * Find free time slots for a given day type.
 * Returns hours that have no bookings.
 */
export async function getFreeSlots(dayType: "EVEN" | "ODD" | "CUSTOM" | "FLEXIBLE") {
  const enrollments = await prisma.enrollment.findMany({
    where: { status: "ACTIVE", dayType },
    include: { student: true },
  });

  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7..21
  const bookedHours = new Set(
    enrollments.map((e) => parseInt(e.startTime.split(":")[0]))
  );

  return hours
    .filter((h) => !bookedHours.has(h))
    .map((h) => `${String(h).padStart(2, "0")}:00`);
}

/**
 * Quick-assign a time slot to a student (create/update enrollment).
 */
export async function assignTimeSlot(
  studentId: string,
  dayType: string,
  startTime: string,
  endTime?: string
) {
  // Check if slot is already taken
  const existing = await prisma.enrollment.findFirst({
    where: {
      status: "ACTIVE",
      dayType,
      startTime,
    },
  });

  if (existing) {
    return {
      error: "این ساعت قبلاً رزرو شده است",
    };
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId,
      dayType,
      startTime,
      endTime: endTime || null,
      startDate: dateStr,
      totalSessions: 10,
      status: "ACTIVE",
    },
  });

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/students");

  return { enrollment };
}
