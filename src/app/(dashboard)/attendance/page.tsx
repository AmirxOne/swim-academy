import { getAttendanceForDate } from "@/app/actions/attendance";
import { toggleAttendance } from "@/app/actions/attendance";
import { AttendanceToggle } from "@/components/AttendanceToggle";
import { ExportButton } from "@/components/ExportButton";
import { DateSelector } from "./date-selector";
import {
  jalaliDate,
  toPersianDigits,
  STUDENT_TYPE_LABELS,
  DAY_TYPE_LABELS,
  getDayTypeForDate,
} from "@/lib/utils";
import { Clock, Calendar } from "lucide-react";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  // date is ISO YYYY-MM-DD
  const targetDate = params.date ? new Date(params.date + "T00:00:00") : new Date();
  const dateStr = targetDate.toISOString().slice(0, 10);

  const schedule = await getAttendanceForDate(targetDate);
  const todayType = getDayTypeForDate(targetDate);

  // Group by time slot
  const timeSlots = schedule.reduce((acc, item) => {
    const key = `${item.startTime}${item.endTime ? ` - ${item.endTime}` : ""}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, typeof schedule>);

  const presentCount = schedule.filter((s) => s.sessionStatus === "PRESENT").length;
  const absentCount = schedule.filter((s) => s.sessionStatus === "ABSENT").length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">حضور و غیاب</h2>
          <p className="text-sm text-muted-foreground mt-1">{jalaliDate(targetDate)}</p>
        </div>
        <ExportButton type="attendance" label="" />
      </div>

      <DateSelector initialDate={dateStr} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
          <p className="text-xs text-muted-foreground">جلسات</p>
          <p className="text-xl font-bold">{toPersianDigits(schedule.length)}</p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-center">
          <p className="text-xs text-green-700">حاضر</p>
          <p className="text-xl font-bold text-green-700">{toPersianDigits(presentCount)}</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-center">
          <p className="text-xs text-red-700">غایب</p>
          <p className="text-xl font-bold text-red-700">{toPersianDigits(absentCount)}</p>
        </div>
      </div>

      {/* Schedule */}
      {schedule.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">برنامه‌ای برای این روز ثبت نشده است</p>
          <p className="text-xs text-muted-foreground mt-1">
            نوع روز: {DAY_TYPE_LABELS[todayType]}
          </p>
        </div>
      ) : (
        Object.entries(timeSlots).map(([timeSlot, items]) => (
          <div key={timeSlot} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{toPersianDigits(timeSlot)}</span>
            </div>
            {items.map((item) => (
              <div
                key={item.studentId}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {STUDENT_TYPE_LABELS[item.studentType] || item.studentType}
                  </p>
                </div>
                <AttendanceToggle
                  studentId={item.studentId}
                  date={dateStr}
                  initialStatus={item.sessionStatus}
                  onToggle={toggleAttendance}
                />
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
