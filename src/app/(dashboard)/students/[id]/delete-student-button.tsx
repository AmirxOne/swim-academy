"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteStudent } from "@/app/actions/students";

export function DeleteStudentButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    await deleteStudent(studentId);
    setLoading(false);
    router.push("/students");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        حذف شاگرد
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="حذف شاگرد">
        <p className="text-sm text-muted-foreground mb-4">
          آیا از حذف «{studentName}» مطمئن هستید؟ این عمل قابل بازگشت نیست.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            انصراف
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "در حال حذف..." : "حذف"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
