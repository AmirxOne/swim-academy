"use client";

import { useState } from "react";
import { CalendarPlus, X, Loader2 } from "lucide-react";
import { addMakeupClass } from "@/app/actions/makeup";

type Props = {
  studentId: string;
  studentName: string;
};

export function MakeupClassButton({ studentId, studentName }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    const result = await addMakeupClass(studentId, date);
    setLoading(false);
    if ("error" in result) {
      setError(result.error ?? "خطا");
    } else {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1500);
    }
  };

  const todayFa = (() => {
    const d = new Date(date + "T00:00:00");
    const days = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
    const months = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
    function div(a: number, b: number) { return Math.floor(a / b); }
    const gy = d.getFullYear(), gm = d.getMonth() + 1, gd = d.getDate();
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = gy <= 1600 ? 0 : 979;
    const gyy = gm > 2 ? gy + 1 : gy;
    let days2 = 365 * (gy - (gy <= 1600 ? 621 : 1600)) + div(gyy + 3, 4) - div(gyy + 99, 100) + div(gyy + 399, 400) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * div(days2, 12053); days2 %= 12053; jy += 4 * div(days2, 1461); days2 %= 1461;
    const jm = days2 < 186 ? 1 + div(days2, 31) : 7 + div(days2 - 186, 30);
    const jd = 1 + (days2 < 186 ? days2 % 31 : (days2 - 186) % 30);
    const fa = ["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"];
    const toFa = (n: number | string) => String(n).replace(/\d/g, (d) => fa[parseInt(d)]);
    return `${days[d.getDay()]} ${toFa(jd)} ${months[jm - 1]}`;
  })();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-xl border border-sky-300 bg-sky-50 py-2.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100 active:scale-95"
      >
        <CalendarPlus className="h-4 w-4" />
        کلاس جبرانی
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold">
                <CalendarPlus className="h-5 w-5 text-sky-500" />
                کلاس جبرانی
              </h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-3 text-sm text-muted-foreground">
              شاگرد: <span className="font-semibold text-foreground">{studentName}</span>
            </p>

            <div className="mb-3 flex flex-col gap-2">
              <label className="text-sm font-medium">تاریخ کلاس جبرانی</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 rounded-xl border border-input bg-background px-4 text-base"
              />
              <p className="text-xs text-muted-foreground">{todayFa}</p>
            </div>

            {error && (
              <div className="mb-3 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-3 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                ✅ کلاس جبرانی ثبت شد
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 text-white font-medium transition-transform active:scale-95 disabled:opacity-50 hover:bg-sky-600"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CalendarPlus className="h-5 w-5" />
                  ثبت کلاس جبرانی
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
