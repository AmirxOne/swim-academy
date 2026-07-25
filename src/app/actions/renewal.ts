"use server";

import { prisma } from "@/lib/prisma";

/**
 * Get students who have used all their sessions (need renewal).
 */
export async function getStudentsNeedingRenewal() {
  const students = await prisma.student.findMany({
    where: { status: "ACTIVE" },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      sessions: true,
    },
  });

  return students
    .map((s) => {
      const activeEnrollment = s.enrollments[0];
      const presentCount = s.sessions.filter(
        (sess) => sess.status === "PRESENT" || sess.status === "ABSENT"
      ).length;
      const totalSessions = activeEnrollment?.totalSessions || 0;
      const remaining = totalSessions - presentCount;

      return {
        id: s.id,
        name: s.name,
        phone: s.phone,
        type: s.type,
        shareToken: s.shareToken,
        presentCount,
        totalSessions,
        remaining,
        lastSessionDate: s.sessions.length > 0
          ? s.sessions.sort((a, b) => b.date.localeCompare(a.date))[0].date
          : null,
      };
    })
    .filter((s) => s.remaining <= 0 && s.totalSessions > 0);
}
