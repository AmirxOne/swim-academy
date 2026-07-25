"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle } from "lucide-react";

type RenewalStudent = {
  id: string;
  name: string;
  phone: string | null;
  remaining: number;
  lastSessionDate: string | null;
  renewalMessage: string;
};

function RenewalCard({ student }: { student: RenewalStudent }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(student.renewalMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSMS = () => {
    if (student.phone) {
      window.location.href = `sms:${student.phone}?body=${encodeURIComponent(student.renewalMessage)}`;
    }
  };

  const handleWhatsApp = () => {
    const phone = student.phone?.replace(/^0/, "98").replace(/\s/g, "");
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(student.renewalMessage)}`, "_blank");
    }
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-800">{student.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
              {student.remaining === 0 ? "تکمیل شده" : `${student.remaining} جلسه اضافه`}
            </span>
            {student.phone && (
              <span dir="ltr" className="text-gray-400">{student.phone}</span>
            )}
          </div>
        </div>
      </div>

      {/* Message preview */}
      <div className="mt-3 rounded-xl bg-white/80 p-3">
        <p className="whitespace-pre-line text-xs leading-relaxed text-gray-600">
          {student.renewalMessage}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-600">کپی شد!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              کپی پیام
            </>
          )}
        </button>
        {student.phone && (
          <>
            <button
              onClick={handleWhatsApp}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-green-300 bg-green-50 text-green-600 active:scale-95"
              title="واتساپ"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            <button
              onClick={handleSMS}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-300 bg-blue-50 text-blue-600 active:scale-95"
              title="پیامک"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function RenewalList({ students }: { students: RenewalStudent[] }) {
  return (
    <div className="flex flex-col gap-3">
      {students.map((s) => (
        <RenewalCard key={s.id} student={s} />
      ))}
    </div>
  );
}
