import Link from "next/link";
import { Users, GraduationCap, Calendar, Clock, Plus, AlertCircle } from "lucide-react";
import { getTodaySchedule } from "@/app/actions/attendance";
import { getStudents } from "@/app/actions/students";
import { getStudentsNeedingRenewal } from "@/app/actions/renewal";
import { generateRenewalMessage } from "@/lib/renewal";
import { prisma } from "@/lib/prisma";
import { jalaliDate, toPersianDigits, STUDENT_TYPE_LABELS, DAY_TYPE_LABELS } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";
import { AttendanceToggle } from "@/components/AttendanceToggle";
import { RenewalList } from "@/components/RenewalList";
import { toggleAttendance } from "@/app/actions/attendance";

export default async function DashboardPage() {
  const [schedule, students, renewalStudents] = await Promise.all([
    getTodaySchedule(),
    getStudents(),
    getStudentsNeedingRenewal(),
  ]);

  const activeEnrollments = await prisma.enrollment.count({ where: { status: "ACTIVE" } });
  const todayDate = jalaliDate(new Date());

  const renewalList = renewalStudents.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    remaining: s.remaining,
    lastSessionDate: s.lastSessionDate,
    renewalMessage: generateRenewalMessage(s.name, s.remaining, s.lastSessionDate),
  }));

  // Group by time slot
  const timeSlots = schedule.reduce((acc, item) => {
    const key = `${item.startTime}${item.endTime ? ` - ${item.endTime}` : ""}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, typeof schedule>);

  return (
    <div className="flex flex-col gap-5">
      {/* Today's date */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{todayDate}</h2>
          <p className="text-sm text-muted-foreground mt-1">برنامه امروز</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="شاگردان"
          value={toPersianDigits(students.length)}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="کلاس‌های فعال"
          value={toPersianDigits(activeEnrollments)}
          icon={<GraduationCap className="h-4 w-4" />}
        />
        <StatCard
          label="جلسات امروز"
          value={toPersianDigits(schedule.length)}
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Today's schedule */}
      <div className="flex flex-col gap-4">
        {schedule.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">برنامه‌ای برای امروز ثبت نشده است</p>
          </div>
        ) : (
          Object.entries(timeSlots).map(([timeSlot, items]) => (
            <div key={timeSlot} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{toPersianDigits(timeSlot)}</span>
                <span className="text-xs text-muted-foreground">
                  · {DAY_TYPE_LABELS[items[0].dayType] || items[0].dayType}
                </span>
              </div>
              {items.map((item) => (
                <div
                  key={item.studentId}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/students/${item.studentId}`}
                      className="font-semibold hover:text-primary transition-colors block truncate"
                    >
                      {item.studentName}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {STUDENT_TYPE_LABELS[item.studentType] || item.studentType}
                    </span>
                  </div>
                  <AttendanceToggle
                    studentId={item.studentId}
                    date={new Date().toISOString().slice(0, 10)}
                    initialStatus={item.sessionStatus}
                    onToggle={toggleAttendance}
                  />
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Renewal needed */}
      {renewalList.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-amber-700">
              نیاز به ثبت‌نام مجدد ({toPersianDigits(renewalList.length)} نفر)
            </h3>
          </div>
          <RenewalList students={renewalList} />
        </div>
      )}

      {/* Quick add */}
      <Link
        href="/students/new"
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-4 text-primary font-medium transition-colors hover:bg-primary/10"
      >
        <Plus className="h-5 w-5" />
        افزودن شاگرد جدید
      </Link>
    </div>
  );
}
