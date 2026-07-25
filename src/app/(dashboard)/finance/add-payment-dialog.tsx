"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPayment } from "@/app/actions/finance";

interface StudentOption {
  id: string;
  name: string;
}

export function AddPaymentDialog({ students }: { students: StudentOption[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createPayment(formData);
    setLoading(false);
    if ("error" in result) {
      setError(result.error ?? "خطای ناشناخته");
    } else {
      setOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm active:scale-95 transition-transform"
      >
        <Plus className="h-5 w-5" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="پرداخت جدید">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">شاگرد</label>
            <select
              name="studentId"
              required
              className="h-12 rounded-xl border border-input bg-background px-4 text-base"
            >
              <option value="">انتخاب شاگرد...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">مبلغ (تومان)</label>
            <Input name="amount" type="number" placeholder="۲۲۰۵۰۰۰" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">یادداشت (اختیاری)</label>
            <Input name="note" placeholder="شهریه مرداد" />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "در حال ثبت..." : "ثبت پرداخت"}
          </Button>
        </form>
      </Dialog>
    </>
  );
}
