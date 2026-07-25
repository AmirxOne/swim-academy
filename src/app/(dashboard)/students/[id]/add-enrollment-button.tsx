"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createEnrollment } from "@/app/actions/students";
import { jalaliDateKey } from "@/lib/utils";

export function AddEnrollmentButton({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("studentId", studentId);
    formData.set("startDate", jalaliDateKey(new Date()));
    await createEnrollment(formData);
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
      >
        <Plus className="h-5 w-5" />
        ثبت‌نام جدید
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="ثبت‌نام جدید">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">نوع کلاس</label>
            <select
              name="classType"
              defaultValue="SEMI_PRIVATE"
              className="h-12 rounded-xl border border-input bg-background px-4 text-base"
            >
              <option value="PRIVATE">خصوصی</option>
              <option value="SEMI_PRIVATE">نیمه‌خصوصی</option>
              <option value="UNREGISTERED">ثبت‌نام‌نشده</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">نوع روز</label>
            <select
              name="dayType"
              defaultValue="ODD"
              className="h-12 rounded-xl border border-input bg-background px-4 text-base"
            >
              <option value="ODD">روزهای فرد</option>
              <option value="EVEN">روزهای زوج</option>
              <option value="CUSTOM">سفارشی (متفرقه)</option>
              <option value="FLEXIBLE">انعطاف‌پذیر (شیفت‌دار)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">ساعت شروع</label>
              <Input name="startTime" type="time" required defaultValue="10:00" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">ساعت پایان</label>
              <Input name="endTime" type="time" defaultValue="11:00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">تعداد جلسات</label>
              <Input name="totalSessions" type="number" defaultValue="10" min={1} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">مبلغ هر جلسه</label>
              <Input name="pricePerSession" type="number" defaultValue="220500" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "در حال ثبت..." : "ثبت ثبت‌نام"}
          </Button>
        </form>
      </Dialog>
    </>
  );
}
