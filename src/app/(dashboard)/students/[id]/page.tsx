import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  ChevronRight,
  Plus,
  Clock,
  Check,
  X,
  CircleDollarSign,
  Trash2,
  Calendar,
} from "lucide-react";
import { getStudent } from "@/app/actions/students";
import { getSettings } from "@/app/actions/settings";
import {
  toPersianDigits,
  formatToman,
  jalaliDateShort,
  consumedSessions,
  STUDENT_TYPE_LABELS,
  DAY_TYPE_LABELS,
  SESSION_STATUS_LABELS,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AddPaymentButton } from "./add-payment-button";
import { AddEnrollmentButton } from "./add-enrollment-button";
import { DeleteStudentButton } from "./delete-student-button";
import { ShareLinkButton } from "./share-link-button";
import { MakeupClassButton } from "./makeup-class-button";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  const settings = await getSettings();
  const totalPayments = student.payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amount, 0);
  const usedSessions = consumedSessions(student.sessions);

  return (
    <div className="flex flex-col gap-5">
      {/* Back link */}
      <Link
        href="/students"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
        بازگشت به شاگردان
      </Link>

      {/* Student header */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold",
                  student.status === "ACTIVE"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {student.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold">{student.name}</h2>
                <Badge variant={student.status === "ACTIVE" ? "success" : "secondary"}>
                  {STUDENT_TYPE_LABELS[student.type] || student.type}
                </Badge>
              </div>
            </div>
          </div>
          {student.phone && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span dir="ltr">{toPersianDigits(student.phone)}</span>
            </div>
          )}
          {student.notes && (
            <p className="mt-3 rounded-xl bg-muted/50 p-3 text-sm">{student.notes}</p>
          )}

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">جلسات مصرف‌شده</p>
              <p className="text-lg font-bold">{toPersianDigits(usedSessions)}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">پرداختی</p>
              <p className="text-lg font-bold">{formatToman(totalPayments)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <AddPaymentButton studentId={student.id} studentName={student.name} />
        <AddEnrollmentButton studentId={student.id} />
      </div>
      <MakeupClassButton studentId={student.id} studentName={student.name} />

      {/* Share link */}
      <ShareLinkButton token={student.shareToken} />

      {/* Enrollments */}
      {student.enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ثبت‌نام‌ها</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {student.enrollments.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-border p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{STUDENT_TYPE_LABELS[e.classType] || e.classType}</Badge>
                    <Badge variant="secondary">{DAY_TYPE_LABELS[e.dayType] || e.dayType}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    ساعت {toPersianDigits(e.startTime)}
                    {e.endTime ? ` تا ${toPersianDigits(e.endTime)}` : ""}
                    {" · "}
                    {toPersianDigits(e.totalSessions)} جلسه
                    {e.pricePerSession ? ` · ${formatToman(e.pricePerSession)}` : ""}
                  </div>
                </div>
                <Badge variant={e.status === "ACTIVE" ? "success" : "secondary"}>
                  {e.status === "ACTIVE" ? "فعال" : "غیرفعال"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Session history */}
      <Card>
        <CardHeader>
          <CardTitle>تاریخچه جلسات</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {student.sessions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              جلسه‌ای ثبت نشده است
            </p>
          ) : (
            student.sessions.slice(0, 20).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-border p-3"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{jalaliDateShort(s.date)}</span>
                  {s.note === "جبرانی" && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                      جبرانی
                    </span>
                  )}
                </div>
                <SessionStatusBadge status={s.status} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle>تاریخچه پرداخت‌ها</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {student.payments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              پرداختی ثبت نشده است
            </p>
          ) : (
            student.payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{formatToman(p.amount)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{jalaliDateShort(p.date)}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <DeleteStudentButton studentId={student.id} studentName={student.name} />
    </div>
  );
}

function SessionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "success" | "destructive" | "secondary" | "warning"; icon: React.ReactNode }> = {
    PRESENT: { variant: "success", icon: <Check className="h-3 w-3" /> },
    ABSENT: { variant: "destructive", icon: <X className="h-3 w-3" /> },
    EXCUSED: { variant: "warning", icon: <Clock className="h-3 w-3" /> },
    PENDING: { variant: "warning", icon: <Clock className="h-3 w-3" /> },
    CANCELLED: { variant: "secondary", icon: <X className="h-3 w-3" /> },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant={c.variant}>
      <span className="flex items-center gap-1">
        {c.icon}
        {SESSION_STATUS_LABELS[status] || status}
      </span>
    </Badge>
  );
}
