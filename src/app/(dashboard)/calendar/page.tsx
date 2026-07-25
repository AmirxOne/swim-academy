import { getWeeklySchedule, getFreeSlots } from "@/app/actions/calendar";
import { getStudents } from "@/app/actions/students";
import { CalendarGrid, FreeSlotsList } from "@/components/CalendarGrid";
import { jalaliDate, toPersianDigits, DAY_TYPE_LABELS } from "@/lib/utils";
import { CalendarDays, Clock, Sparkles } from "lucide-react";

export default async function CalendarPage() {
  const [schedule, students, evenFree, oddFree, flexibleFree] = await Promise.all([
    getWeeklySchedule(),
    getStudents(),
    getFreeSlots("EVEN"),
    getFreeSlots("ODD"),
    getFreeSlots("FLEXIBLE"),
  ]);

  const today = new Date();
  const studentOptions = students.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <CalendarDays className="h-5 w-5 text-primary" />
            تقویم و زمان‌بندی
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{jalaliDate(today)}</p>
        </div>
        <div className="rounded-xl bg-primary/10 px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">نوع امروز</p>
          <p className="text-sm font-bold text-primary">
            {DAY_TYPE_LABELS[schedule.todayType]}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
          <p className="text-xs text-muted-foreground">کل ثبت‌نام‌های فعال</p>
          <p className="text-xl font-bold">{toPersianDigits(schedule.totalActive)}</p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-center">
          <p className="text-xs text-green-700">ساعت‌های خالی زوج</p>
          <p className="text-xl font-bold text-green-700">{toPersianDigits(evenFree.length)}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-center">
          <p className="text-xs text-blue-700">ساعت‌های خالی فرد</p>
          <p className="text-xl font-bold text-blue-700">{toPersianDigits(oddFree.length)}</p>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border p-3">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Clock className="h-4 w-4 text-primary" />
            نمای هفتگی
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            روی هر خانه خالی (+) کلیک کنید تا به شاگرد ساعت بدهید
          </p>
        </div>
        <CalendarGrid
          grid={schedule.grid}
          todayType={schedule.todayType}
          students={studentOptions}
        />
      </div>

      {/* Free slots */}
      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-2xl border border-green-200 bg-green-50/50 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-green-700">
            <Sparkles className="h-4 w-4" />
            ساعت‌های خالی روزهای زوج
          </h3>
          <FreeSlotsList slots={evenFree} />
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-700">
            <Sparkles className="h-4 w-4" />
            ساعت‌های خالی روزهای فرد
          </h3>
          <FreeSlotsList slots={oddFree} />
        </div>
        {flexibleFree.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700">
              <Sparkles className="h-4 w-4" />
              ساعت‌های خالی انعطاف‌پذیر
            </h3>
            <FreeSlotsList slots={flexibleFree} />
          </div>
        )}
      </div>
    </div>
  );
}
