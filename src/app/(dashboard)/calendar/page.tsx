import { prisma } from "@/lib/prisma";
import { jalaliDate, toPersianDigits, DAY_TYPE_LABELS } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import { FullCalendar } from "@/components/FullCalendar";

async function getAllBookings() {
  const enrollments = await prisma.enrollment.findMany({
    where: { status: "ACTIVE" },
    include: { student: true },
  });

  return enrollments.map((e) => ({
    studentId: e.studentId,
    studentName: e.student.name,
    startTime: e.startTime,
    endTime: e.endTime,
    classType: e.student.type,
    dayType: e.dayType,
  }));
}

async function getActiveCount() {
  return prisma.enrollment.count({ where: { status: "ACTIVE" } });
}

export default async function CalendarPage() {
  const [bookings, totalActive] = await Promise.all([
    getAllBookings(),
    getActiveCount(),
  ]);

  const today = new Date();

  // Determine today's type
  function div(a: number, b: number) { return Math.floor(a / b); }
  function toJ(gy: number, gm: number, gd: number): [number, number, number] {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = gy <= 1600 ? 0 : 979; gy -= gy <= 1600 ? 621 : 1600;
    const gy2 = gm > 2 ? gy + 1 : gy;
    let days = 365 * gy + div(gy2 + 3, 4) - div(gy2 + 99, 100) + div(gy2 + 399, 400) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * div(days, 12053); days %= 12053; jy += 4 * div(days, 1461); days %= 1461;
    if (days > 365) { jy += div(days - 1, 365); days = (days - 1) % 365; }
    const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return [jy, jm, jd];
  }
  const [, , todayJd] = toJ(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const todayType = todayJd % 2 === 0 ? "EVEN" : "ODD";

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <CalendarDays className="h-5 w-5 text-primary" />
            تقویم ماهانه
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{jalaliDate(today)}</p>
        </div>
        <div className="rounded-xl bg-primary/10 px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">نوع امروز</p>
          <p className="text-sm font-bold text-primary">
            {DAY_TYPE_LABELS[todayType]}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
          <p className="text-xs text-muted-foreground">ثبت‌نام‌های فعال</p>
          <p className="text-xl font-bold">{toPersianDigits(totalActive)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
          <p className="text-xs text-muted-foreground">نوع امروز</p>
          <p className="text-sm font-bold text-primary">
            {DAY_TYPE_LABELS[todayType]}
          </p>
        </div>
      </div>

      {/* Monthly Calendar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <FullCalendar bookings={bookings} />
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-muted-foreground">
        برای دیدن جزئیات هر روز، روی آن کلیک کنید
      </p>
    </div>
  );
}
