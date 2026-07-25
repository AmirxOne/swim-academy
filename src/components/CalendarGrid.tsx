"use client";

import { useState } from "react";
import { Clock, Plus, Check, X } from "lucide-react";
import { assignTimeSlot } from "@/app/actions/calendar";
import { STUDENT_TYPE_LABELS, toPersianDigits } from "@/lib/utils";

type Booking = {
  studentId: string;
  studentName: string;
  classType: string;
  enrollmentId: string;
  endTime?: string | null;
};

type GridSlot = {
  time: string;
  even: Booking[];
  odd: Booking[];
  custom: Booking[];
  flexible: Booking[];
};

type AssignDialogProps = {
  dayType: string;
  time: string;
  students: { id: string; name: string }[];
  onAssigned: () => void;
};

function AssignDialog({ dayType, time, students, onAssigned }: AssignDialogProps) {
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAssign = async () => {
    if (!selectedId) {
      setError("یک شاگرد انتخاب کنید");
      return;
    }
    setLoading(true);
    setError("");
    const result = await assignTimeSlot(selectedId, dayType, time);
    setLoading(false);
    if ("error" in result) {
      setError(result.error ?? "خطای ناشناخته");
    } else {
      onAssigned();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Clock className="h-4 w-4 text-primary" />
        <span>رزرو ساعت {toPersianDigits(time)}</span>
      </div>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="h-12 rounded-xl border border-input bg-background px-4 text-base"
      >
        <option value="">انتخاب شاگرد...</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <button
        onClick={handleAssign}
        disabled={loading}
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-white font-medium transition-transform active:scale-95 disabled:opacity-50"
      >
        {loading ? "در حال ثبت..." : (
          <>
            <Check className="h-5 w-5" />
            ثبت رزرو
          </>
        )}
      </button>
    </div>
  );
}

type CellProps = {
  time: string;
  bookings: Booking[];
  dayType: string;
  students: { id: string; name: string }[];
  isToday?: boolean;
};

function CalendarCell({ time, bookings, dayType, students, isToday }: CellProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const isFree = bookings.length === 0;

  return (
    <td className={`border-r border-border p-1 align-top ${isToday ? "bg-primary/5" : ""}`}>
      {isFree ? (
        <button
          onClick={() => setDialogOpen(true)}
          className="flex h-full min-h-[60px] w-full items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground/50 hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      ) : (
        <div className="flex flex-col gap-1 p-1">
          {bookings.map((b) => (
            <div
              key={b.studentId}
              className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-1.5 text-xs"
            >
              <p className="font-semibold text-primary truncate">{b.studentName}</p>
              <p className="text-[10px] text-muted-foreground">
                {STUDENT_TYPE_LABELS[b.classType] || b.classType}
                {b.endTime ? ` · تا ${toPersianDigits(b.endTime)}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDialogOpen(false)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">رزرو زمان جدید</h3>
              <button onClick={() => setDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <AssignDialog
              dayType={dayType}
              time={time}
              students={students}
              onAssigned={() => setDialogOpen(false)}
            />
          </div>
        </div>
      )}
    </td>
  );
}

export function CalendarGrid({
  grid,
  todayType,
  students,
}: {
  grid: GridSlot[];
  todayType: string;
  students: { id: string; name: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border-r border-border bg-muted/50 p-2 text-xs font-semibold text-muted-foreground sticky right-0">
              ساعت
            </th>
            <th className={`border-r border-border p-2 text-xs font-bold ${todayType === "EVEN" ? "bg-primary/10 text-primary" : "bg-muted/50"}`}>
              روزهای زوج {todayType === "EVEN" && "🔥"}
            </th>
            <th className={`border-r border-border p-2 text-xs font-bold ${todayType === "ODD" ? "bg-primary/10 text-primary" : "bg-muted/50"}`}>
              روزهای فرد {todayType === "ODD" && "🔥"}
            </th>
            <th className={`border-r border-border p-2 text-xs font-bold ${todayType === "CUSTOM" ? "bg-primary/10 text-primary" : "bg-muted/50"}`}>
              متفرقه
            </th>
            <th className={`border-r border-border p-2 text-xs font-bold bg-amber-50 text-amber-700`}>
              انعطاف‌پذیر
            </th>
          </tr>
        </thead>
        <tbody>
          {grid.map((slot) => (
            <tr key={slot.time}>
              <td className="border-r border-border bg-muted/30 p-2 text-center text-xs font-medium text-muted-foreground sticky right-0">
                {toPersianDigits(slot.time)}
              </td>
              <CalendarCell
                time={slot.time}
                bookings={slot.even}
                dayType="EVEN"
                students={students}
                isToday={todayType === "EVEN"}
              />
              <CalendarCell
                time={slot.time}
                bookings={slot.odd}
                dayType="ODD"
                students={students}
                isToday={todayType === "ODD"}
              />
              <CalendarCell
                time={slot.time}
                bookings={slot.custom}
                dayType="CUSTOM"
                students={students}
                isToday={todayType === "CUSTOM"}
              />
              <CalendarCell
                time={slot.time}
                bookings={slot.flexible}
                dayType="FLEXIBLE"
                students={students}
                isToday={false}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Free slots summary card */
export function FreeSlotsList({ slots }: { slots: string[] }) {
  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        ساعت خالی وجود ندارد
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((s) => (
        <span
          key={s}
          className="rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-sm font-medium text-green-700"
        >
          {toPersianDigits(s)}
        </span>
      ))}
    </div>
  );
}
