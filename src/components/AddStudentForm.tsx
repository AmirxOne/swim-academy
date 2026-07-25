"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createStudent } from "@/app/actions/students";

export function AddStudentForm({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("SEMI_PRIVATE");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("type", type);
    formData.append("notes", notes);
    const result = await createStudent(formData);
    setLoading(false);
    if ("error" in result) {
      setError(result.error ?? "خطای ناشناخته");
    } else {
      router.refresh();
      if (onClose) onClose();
      else router.push("/students");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">نام و نام خانوادگی</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثلاً: علی رضایی"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">شماره تماس</label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          type="tel"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">نوع کلاس</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "PRIVATE", label: "خصوصی" },
            { value: "SEMI_PRIVATE", label: "نیمه‌خصوصی" },
            { value: "UNREGISTERED", label: "ثبت‌نام‌نشده" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={
                type === opt.value
                  ? "rounded-xl border-2 border-primary bg-primary/5 px-3 py-2.5 text-sm font-medium"
                  : "rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-muted-foreground"
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">یادداشت (اختیاری)</label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="مثلاً: سطح پیشرفته"
        />
      </div>
      <div className="flex gap-2 pt-2">
        {onClose && (
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            انصراف
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "در حال ثبت..." : "ثبت شاگرد"}
        </Button>
      </div>
    </form>
  );
}
