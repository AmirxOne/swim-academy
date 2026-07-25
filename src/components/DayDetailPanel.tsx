"use client";

import { Clock, Users, X, Check, UserX } from "lucide-react";
import { STUDENT_TYPE_LABELS, DAY_TYPE_LABELS } from "@/lib/utils";
import { toFa } from "./CalendarMonth";

type DayDetailProps = {
  gDate: string;
  students: {
    studentId: string;
    studentName: string;
    startTime: string;
    endTime?: string | null;
    classType: string;
    dayType: string;
  }[];
  onClose: () => void;
};

export function DayDetailPanel({ gDate, students, onClose }: DayDetailProps) {
  // Convert gDate to Jalali for display
  const d = new Date(gDate + "T00:00:00");
  function div2(a: number, b: number) { return Math.floor(a / b); }
  function toJ(gy: number, gm: number, gd: number): [number, number, number] {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = gy <= 1600 ? 0 : 979; gy -= gy <= 1600 ? 621 : 1600;
    const gy2 = gm > 2 ? gy + 1 : gy;
    let days = 365 * gy + div2(gy2 + 3, 4) - div2(gy2 + 99, 100) + div2(gy2 + 399, 400) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * div2(days, 12053); days %= 12053; jy += 4 * div2(days, 1461); days %= 1461;
    if (days > 365) { jy += div2(days - 1, 365); days = (days - 1) % 365; }
    const jm = days < 186 ? 1 + div2(days, 31) : 7 + div2(days - 186, 30);
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return [jy, jm, jd];
  }
  const months = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
  const weekdays = ["یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه"];
  const [jy, jm, jd] = toJ(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const persianDate = `${weekdays[d.getDay()]} ${toFa(jd)} ${months[jm - 1]}`;

  // Sort by start time
  const sorted = [...students].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Group by time slot
  const timeSlots = sorted.reduce((acc, s) => {
    const key = s.startTime + (s.endTime ? `-${s.endTime}` : "");
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, typeof students>);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">{persianDate}</h3>
            <p className="text-xs text-muted-foreground">{toFa(students.length)} شاگرد</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Students by time */}
        {students.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">برنامه‌ای برای این روز ثبت نشده است</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(timeSlots).map(([time, list]) => (
              <div key={time}>
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{toFa(time)}</span>
                  <span className="text-[10px] text-muted-foreground">
                    · {DAY_TYPE_LABELS[list[0].dayType] || list[0].dayType}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {list.map((s) => (
                    <a
                      key={s.studentId}
                      href={`/students/${s.studentId}`}
                      className="flex items-center justify-between rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <div>
                        <p className="text-sm font-semibold">{s.studentName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {STUDENT_TYPE_LABELS[s.classType] || s.classType}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-400" />
                        <span className="text-[10px] text-muted-foreground">فعال</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
