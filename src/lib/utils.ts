import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Jalali Calendar Conversion ─────────────────────────────────────
// Algorithm: Toji/Gregorian-to-Jalali conversion ( astronomical algorithm)
// Converts a Gregorian date to Jalali (Shamsi) date.
function div(a: number, b: number) {
  return Math.floor(a / b);
}

export function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
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

export function toGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days =
    365 * jy +
    div(jy, 33) * 8 +
    div((jy % 33) + 3, 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm: number;
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm];
    if (gd <= v) break;
    gd -= v;
  }
  return [gy, gm, gd];
}

// ─── Formatting Helpers ─────────────────────────────────────────────

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d)]);
}

const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const JALALI_WEEKDAYS = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

/** Format a date (ISO string or Date) as a full Jalali date string in Persian. */
export function jalaliDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const [jy, jm, jd] = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const weekday = JALALI_WEEKDAYS[d.getDay()];
  return `${weekday} ${toPersianDigits(jd)} ${JALALI_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
}

/** Short Jalali date: "۱۴ خرداد ۱۴۰۳" */
export function jalaliDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const [jy, jm, jd] = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${toPersianDigits(jd)} ${JALALI_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
}

/** Jalali date in YYYY/MM/DD format (for storage / keys). */
export function jalaliDateKey(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const [jy, jm, jd] = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${jy}/${jm}/${jd}`;
}

/** Get the Jalali weekday name for a date. */
export function jalaliWeekday(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return JALALI_WEEKDAYS[d.getDay()];
}

export function formatToman(amount: number): string {
  return toPersianDigits(amount.toLocaleString("en-US")) + " تومان";
}

export function formatTomanShort(amount: number): string {
  return toPersianDigits(amount.toLocaleString("en-US"));
}

// ─── Day Type Constants ─────────────────────────────────────────────
// In Iran, calendar days alternate between "even" and "odd" Jalali days.
// This determines which days students have class.

export const DAY_TYPE = {
  EVEN: "EVEN",
  ODD: "ODD",
  CUSTOM: "CUSTOM",
  FLEXIBLE: "FLEXIBLE",
} as const;

export type DayType = (typeof DAY_TYPE)[keyof typeof DAY_TYPE];

export const DAY_TYPE_LABELS: Record<string, string> = {
  EVEN: "روزهای زوج",
  ODD: "روزهای فرد",
  CUSTOM: "سفارشی",
  FLEXIBLE: "انعطاف‌پذیر (شیفت‌دار)",
};

export const STUDENT_TYPE_LABELS: Record<string, string> = {
  PRIVATE: "خصوصی",
  SEMI_PRIVATE: "نیمه‌خصوصی",
  UNREGISTERED: "ثبت‌نام‌نشده",
};

export const SESSION_STATUS_LABELS: Record<string, string> = {
  PENDING: "در انتظار",
  PRESENT: "حاضر",
  ABSENT: "غایب",
  EXCUSED: "غیبت موجه",
  CANCELLED: "لغو شده",
};

/** Determine if a Jalali day number is even or odd. */
export function getDayTypeForDate(date: string | Date): "EVEN" | "ODD" {
  const d = typeof date === "string" ? new Date(date) : date;
  const [, , jd] = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return jd % 2 === 0 ? "EVEN" : "ODD";
}

/** Count consumed sessions (PRESENT + ABSENT). EXCUSED and PENDING don't count. */
export function consumedSessions(sessions: { status: string }[]): number {
  return sessions.filter((s) => s.status === "PRESENT" || s.status === "ABSENT").length;
}

/** Determine if today's day type matches the enrollment's day type. */
export function isEnrollmentDay(enrollmentDayType: string, date: string | Date): boolean {
  if (enrollmentDayType === DAY_TYPE.CUSTOM) return true;
  if (enrollmentDayType === DAY_TYPE.FLEXIBLE) return true;
  const todayType = getDayTypeForDate(date);
  return enrollmentDayType === todayType;
}
