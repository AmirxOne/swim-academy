import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AddStudentForm } from "@/components/AddStudentForm";

export default function NewStudentPage() {
  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/students"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
        بازگشت به شاگردان
      </Link>

      <h2 className="text-xl font-bold">افزودن شاگرد جدید</h2>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <AddStudentForm />
      </div>
    </div>
  );
}
