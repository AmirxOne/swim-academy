import Link from "next/link";
import { ChevronLeft, Phone } from "lucide-react";
import { cn, STUDENT_TYPE_LABELS, toPersianDigits } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StudentCardProps {
  id: string;
  name: string;
  phone?: string | null;
  type: string;
  status: string;
  sessionCount?: number;
}

export function StudentCard({ id, name, phone, type, status, sessionCount }: StudentCardProps) {
  const isActive = status === "ACTIVE";
  return (
    <Link
      href={`/students/${id}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{name}</span>
            <Badge variant={isActive ? "success" : "secondary"}>
              {STUDENT_TYPE_LABELS[type] || type}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            {phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {toPersianDigits(phone)}
              </span>
            )}
            {sessionCount !== undefined && sessionCount > 0 && (
              <span>{toPersianDigits(sessionCount)} جلسه</span>
            )}
          </div>
        </div>
      </div>
      <ChevronLeft className="h-5 w-5 text-muted-foreground shrink-0" />
    </Link>
  );
}
