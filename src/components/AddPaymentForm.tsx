"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPayment } from "@/app/actions/finance";

export function AddPaymentForm({
  studentId,
  studentName,
  onClose,
}: {
  studentId: string;
  studentName: string;
  onClose?: () => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("amount", amount);
    formData.append("note", note);
    const result = await createPayment(formData);
    setLoading(false);
    if ("error" in result) {
      setError(result.error ?? "خطای ناشناخته");
    } else {
      router.refresh();
      onClose?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">پرداخت جدید برای: {studentName}</p>
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">مبلغ (تومان)</label>
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="مثلاً: ۲۲۰۵۰۰۰"
          type="number"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">یادداشت (اختیاری)</label>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="مثلاً: شهریه مرداد"
        />
      </div>
      <div className="flex gap-2 pt-2">
        {onClose && (
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            انصراف
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "در حال ثبت..." : "ثبت پرداخت"}
        </Button>
      </div>
    </form>
  );
}
