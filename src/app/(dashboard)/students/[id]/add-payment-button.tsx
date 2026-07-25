"use client";

import { useState } from "react";
import { CircleDollarSign } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { AddPaymentForm } from "@/components/AddPaymentForm";

export function AddPaymentButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-50 py-3 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
      >
        <CircleDollarSign className="h-5 w-5" />
        ثبت پرداخت
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="پرداخت جدید">
        <AddPaymentForm studentId={studentId} studentName={studentName} onClose={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
