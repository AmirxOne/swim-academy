"use client";

import { useState } from "react";
import { CalendarMonth, type DayBooking } from "@/components/CalendarMonth";
import { DayDetailPanel } from "@/components/DayDetailPanel";

type AllBookings = DayBooking[];

type FullCalendarProps = {
  bookings: AllBookings;
};

export function FullCalendar({ bookings }: FullCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Find students for the selected date
  const selectedStudents = selectedDate
    ? bookings.filter((b) => {
        // For EVEN/ODD, check the Jalali day number parity
        // For CUSTOM/FLEXIBLE, show on all days
        if (b.dayType === "CUSTOM" || b.dayType === "FLEXIBLE") return true;

        const d = new Date(selectedDate + "T00:00:00");
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
        const [, , jd] = toJ(d.getFullYear(), d.getMonth() + 1, d.getDate());
        const dayType = jd % 2 === 0 ? "EVEN" : "ODD";
        return b.dayType === dayType;
      })
    : [];

  return (
    <>
      <CalendarMonth bookings={bookings} onSelectDay={(gDate) => setSelectedDate(gDate)} />
      {selectedDate && (
        <DayDetailPanel
          gDate={selectedDate}
          students={selectedStudents.map((s) => ({
            studentId: s.studentId,
            studentName: s.studentName,
            startTime: s.startTime,
            classType: s.classType,
            dayType: s.dayType,
          }))}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
