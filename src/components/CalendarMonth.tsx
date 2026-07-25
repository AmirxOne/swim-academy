"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, Clock } from "lucide-react";

// ─── Jalali Calendar Helpers ──────────────────────────

function div(a: number, b: number) { return Math.floor(a / b); }

function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365 * gy + div(gy2 + 3, 4) - div(gy2 + 99, 100) + div(gy2 + 399, 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * div(days, 12053); days %= 12053; jy += 4 * div(days, 1461); days %= 1461;
  if (days > 365) { jy += div(days - 1, 365); days = (days - 1) % 365; }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

function toGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days = 365 * jy + div(jy, 33) * 8 + div((jy % 33) + 3, 4) + 78 + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * div(days, 146097); days %= 146097;
  if (days > 36524) { gy += 100 * div(--days, 36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * div(days, 1461); days %= 1461;
  if (days > 365) { gy += div(days - 1, 365); days = (days - 1) % 365; }
  let gd = days + 1;
  const sal_a = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm: number;
  for (gm = 0; gm < 13; gm++) { if (gd <= sal_a[gm]) break; gd -= sal_a[gm]; }
  return [gy, gm, gd];
}

function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // Esfand: 29 or 30 (leap year check)
  const isLeap = ((((jy - 474) % 2820) + 474 + 38) * 682) % 2816 < 682;
  return isLeap ? 30 : 29;
}

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
export function toFa(n: number | string): string { return String(n).replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d)]); }

const JALALI_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

// Persian week starts on Saturday (day 6 in JS getDay())
const WEEKDAY_HEADERS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// ─── Types ─────────────────────────────────────────────

export type DayBooking = {
  studentName: string;
  studentId: string;
  startTime: string;
  classType: string;
  dayType: string;
};

type MonthData = Record<string, DayBooking[]>; // key: "jy-jm-jd"

type CalendarMonthProps = {
  bookings: DayBooking[];
  onSelectDay?: (gDate: string) => void;
};

function getDayType(jd: number): string {
  return jd % 2 === 0 ? "EVEN" : "ODD";
}

export function CalendarMonth({ bookings, onSelectDay }: CalendarMonthProps) {
  const today = new Date();
  const [todayJ] = toJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const [viewYear, setViewYear] = useState(todayJ);
  const [viewMonth, setViewMonth] = useState(() => {
    const [, m] = toJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return m;
  });

  // Build a map of bookings per Jalali date key
  const bookingsByDayType = useMemo(() => {
    const map: Record<string, DayBooking[]> = { EVEN: [], ODD: [], CUSTOM: [], FLEXIBLE: [] };
    for (const b of bookings) {
      const key = b.dayType || "ODD";
      if (!map[key]) map[key] = [];
      map[key].push(b);
    }
    return map;
  }, [bookings]);

  // Build calendar grid for the month
  const grid = useMemo(() => {
    const monthLen = jalaliMonthLength(viewYear, viewMonth);
    const days: { jd: number; gDate: string; weekday: number; dayType: string; students: DayBooking[]; isToday: boolean }[] = [];

    for (let jd = 1; jd <= monthLen; jd++) {
      const [gy, gm, gd] = toGregorian(viewYear, viewMonth, jd);
      const gDate = `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
      const jsDate = new Date(gy, gm - 1, gd);
      const weekday = (jsDate.getDay() + 1) % 7; // Saturday=0 in Persian calendar

      const dayType = getDayType(jd);
      const students = [
        ...(bookingsByDayType[dayType] || []),
        ...(bookingsByDayType["CUSTOM"] || []),
        ...(bookingsByDayType["FLEXIBLE"] || []),
      ];

      const [tjy, tjm, tjd] = toJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
      const isToday = viewYear === tjy && viewMonth === tjm && jd === tjd;

      days.push({ jd, gDate, weekday, dayType, students, isToday });
    }

    // Add leading blanks (to start grid from Saturday)
    const firstWeekday = days[0]?.weekday ?? 0;
    const blanks = Array.from({ length: firstWeekday }, (_, i) => null);

    return [...blanks, ...days];
  }, [viewYear, viewMonth, bookingsByDayType, today]);

  const navigate = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setViewMonth(m);
    setViewYear(y);
  };

  const goToday = () => {
    const [jy, jm] = toJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    setViewYear(jy);
    setViewMonth(jm);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-base font-bold">{JALALI_MONTHS[viewMonth - 1]} {toFa(viewYear)}</p>
          <button onClick={goToday} className="text-[10px] text-primary font-medium">امروز</button>
        </div>
        <button onClick={() => navigate(1)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 rounded-xl overflow-hidden">
        {WEEKDAY_HEADERS.map((h, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-muted-foreground py-2 border-b border-border">
            {h}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-border">
        {grid.map((cell, i) => {
          if (!cell) return <div key={i} className="min-h-[64px] border-b border-l border-border" />;

          const hasStudents = cell.students.length > 0;
          const studentPreview = cell.students.slice(0, 2);
          const extraCount = cell.students.length - 2;
          const isLastCol = (i + 1) % 7 === 0;

          return (
            <button
              key={i}
              onClick={() => onSelectDay?.(cell.gDate)}
              className={`min-h-[64px] border-b border-l border-border p-1 text-right transition-colors
                ${isLastCol ? "border-l-0" : ""}
                ${cell.isToday
                  ? "bg-primary/10"
                  : hasStudents
                  ? "bg-card"
                  : "bg-background"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <span className={`text-xs font-bold ${cell.isToday ? "text-primary" : "text-foreground"}`}>
                  {toFa(cell.jd)}
                </span>
                {hasStudents && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-white">
                    {toFa(cell.students.length)}
                  </span>
                )}
              </div>
              {hasStudents && (
                <div className="mt-0.5 flex flex-col gap-0.5">
                  {studentPreview.map((s, idx) => (
                    <span key={idx} className="truncate text-[8px] leading-tight text-muted-foreground">
                      {s.studentName.split(" ")[0]}
                    </span>
                  ))}
                  {extraCount > 0 && (
                    <span className="text-[8px] text-primary">+{toFa(extraCount)}</span>
                  )}
                </div>
              )}
              {/* Day type dot */}
              <span className={`mt-0.5 inline-block h-1.5 w-1.5 rounded-full
                ${cell.dayType === "EVEN" ? "bg-blue-400" : "bg-orange-400"}`} />
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-1">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-blue-400" /> زوج
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-orange-400" /> فرد
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" /> امروز
        </span>
      </div>
    </div>
  );
}
