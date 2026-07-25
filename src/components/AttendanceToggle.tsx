"use client";

import { useState, useTransition } from "react";
import { Check, X, Clock, UserX } from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";

interface AttendanceToggleProps {
  sessionId?: string;
  studentId: string;
  date: string;
  initialStatus: string;
  onToggle: (studentId: string, date: string, status: string) => Promise<{ status: string } | { error: string }>;
}

export function AttendanceToggle({
  studentId,
  date,
  initialStatus,
  onToggle,
}: AttendanceToggleProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (newStatus: string) => {
    if (status === newStatus) return;
    startTransition(async () => {
      const result = await onToggle(studentId, date, newStatus);
      if ("status" in result) {
        setStatus(result.status);
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handleToggle("PRESENT")}
        disabled={isPending}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-90",
          status === "PRESENT"
            ? "border-green-500 bg-green-500 text-white"
            : "border-border bg-background text-muted-foreground hover:border-green-400"
        )}
        title="حاضر"
      >
        <Check className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleToggle("ABSENT")}
        disabled={isPending}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-90",
          status === "ABSENT"
            ? "border-red-500 bg-red-500 text-white"
            : "border-border bg-background text-muted-foreground hover:border-red-400"
        )}
        title="غایب"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleToggle("EXCUSED")}
        disabled={isPending}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-90",
          status === "EXCUSED"
            ? "border-amber-500 bg-amber-500 text-white"
            : "border-border bg-background text-muted-foreground hover:border-amber-400"
        )}
        title="غیبت موجه (از جلسات کسر نمی‌شود)"
      >
        <UserX className="h-5 w-5" />
      </button>
      {status === "PENDING" && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}
