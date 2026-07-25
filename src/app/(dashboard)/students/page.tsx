import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { getStudents } from "@/app/actions/students";
import { StudentCard } from "@/components/StudentCard";
import { SearchBar } from "./search-bar";
import { ExportButton } from "@/components/ExportButton";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const search = params.q || "";
  const students = await getStudents(search);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">شاگردان</h2>
        <div className="flex items-center gap-2">
          <ExportButton type="students" label="" />
          <Link
            href="/students/new"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm active:scale-95 transition-transform"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <SearchBar initialQuery={search} />

      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <Search className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            {search ? "نتیجه‌ای یافت نشد" : "هنوز شاگردی ثبت نشده است"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {students.map((s) => (
            <StudentCard
              key={s.id}
              id={s.id}
              name={s.name}
              phone={s.phone}
              type={s.type}
              status={s.status}
              sessionCount={s._count.sessions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
