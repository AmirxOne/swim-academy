"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";

function div(a: number, b: number) {
  return Math.floor(a / b);
}

function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}


const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
function toFa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d)]);
}

const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const JALALI_WEEKDAYS = [
  "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه",
];

export function DateSelector({ initialDate }: { initialDate: string }) {
  const router = useRouter();

  const d = new Date(initialDate + "T00:00:00");
  const [jy, jm, jd] = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const weekday = JALALI_WEEKDAYS[d.getDay()];
  const persianDate = `${weekday} ${toFa(jd)} ${JALALI_MONTHS[jm - 1]}`;

  const navigate = (delta: number) => {
    const nd = new Date(initialDate + "T00:00:00");
    nd.setDate(nd.getDate() + delta);
    const newDate = nd.toISOString().slice(0, 10);
    router.push(`/attendance?date=${newDate}`);
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
      <button
        onClick={() => navigate(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="flex-1 text-center">
        <p className="text-sm font-bold">{persianDate}</p>
        <p className="text-[10px] text-muted-foreground">{toFa(jy)}</p>
      </div>
      <button
        onClick={() => navigate(1)}
        className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  );
}
