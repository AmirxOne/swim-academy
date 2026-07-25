import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  jalaliDateShort,
  jalaliWeekday,
  toPersianDigits,
  consumedSessions,
  STUDENT_TYPE_LABELS,
  DAY_TYPE_LABELS,
  SESSION_STATUS_LABELS,
} from "@/lib/utils";
import {
  Check,
  X,
  Clock,
  Calendar,
  Waves,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getStudentByToken(token: string) {
  return prisma.student.findUnique({
    where: { shareToken: token },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      },
      sessions: {
        orderBy: { date: "desc" },
        take: 20,
      },
      payments: {
        orderBy: { date: "desc" },
      },
    },
  });
}

export default async function StudentPublicPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const student = await getStudentByToken(token);
  if (!student) notFound();

  const presentCount = student.sessions.filter((s) => s.status === "PRESENT").length;
  const absentCount = student.sessions.filter((s) => s.status === "ABSENT").length;
  const usedSessions = consumedSessions(student.sessions);
  const activeEnrollment = student.enrollments[0];
  const remaining = activeEnrollment
    ? activeEnrollment.totalSessions - usedSessions
    : 0;
  const totalPaid = student.payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const now = new Date();

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-l from-sky-500 to-cyan-600 px-5 pb-8 pt-10 text-white">
        <div className="mx-auto max-w-md">
          <div className="mb-2 flex items-center gap-2 opacity-90">
            <Waves className="h-5 w-5" />
            <span className="text-sm font-medium">آموزشگاه شنا</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold">{student.name}</h1>
              <p className="text-sm opacity-90">
                {STUDENT_TYPE_LABELS[student.type] || student.type}
                {activeEnrollment && ` · ${DAY_TYPE_LABELS[activeEnrollment.dayType] || activeEnrollment.dayType}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-4 max-w-md px-4 pb-20">
        {/* Date */}
        <div className="mb-4 rounded-2xl bg-white p-3 text-center shadow-md">
          <p className="text-sm font-medium text-gray-600">
            {jalaliWeekday(now)} {toPersianDigits(jalaliDateShort(now).split(" ")[0])} {jalaliDateShort(now).split(" ")[1]}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{toPersianDigits(presentCount)}</p>
            <p className="text-[10px] text-gray-500">حضور</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <X className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{toPersianDigits(absentCount)}</p>
            <p className="text-[10px] text-gray-500">غیبت</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
            <p className={`text-2xl font-bold ${remaining <= 2 ? "text-red-500" : "text-gray-800"}`}>
              {toPersianDigits(remaining)}
            </p>
            <p className="text-[10px] text-gray-500">باقی‌مانده</p>
          </div>
        </div>

        {/* Schedule Info */}
        {activeEnrollment && (
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <Clock className="h-4 w-4 text-sky-500" />
              برنامه کلاس
            </h3>
            <div className="flex flex-wrap gap-2">
              <div className="rounded-xl bg-sky-50 px-3 py-2">
                <p className="text-[10px] text-sky-600">روز</p>
                <p className="text-sm font-semibold text-sky-800">
                  {DAY_TYPE_LABELS[activeEnrollment.dayType] || activeEnrollment.dayType}
                </p>
              </div>
              <div className="rounded-xl bg-cyan-50 px-3 py-2">
                <p className="text-[10px] text-cyan-600">ساعت</p>
                <p className="text-sm font-semibold text-cyan-800">
                  {toPersianDigits(activeEnrollment.startTime)}
                  {activeEnrollment.endTime ? ` - ${toPersianDigits(activeEnrollment.endTime)}` : ""}
                </p>
              </div>
              <div className="rounded-xl bg-purple-50 px-3 py-2">
                <p className="text-[10px] text-purple-600">جلسات</p>
                <p className="text-sm font-semibold text-purple-800">
                  {toPersianDigits(activeEnrollment.totalSessions)} جلسه
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {activeEnrollment && (
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-600">پیشرفت دوره</span>
              <span className="font-bold text-sky-600">
                {toPersianDigits(usedSessions)} از {toPersianDigits(activeEnrollment.totalSessions)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-l from-sky-400 to-cyan-500 transition-all"
                style={{
                  width: `${Math.min(100, (usedSessions / activeEnrollment.totalSessions) * 100)}%`,
                }}
              />
            </div>
            {remaining <= 2 && remaining > 0 && (
              <p className="mt-2 text-center text-xs font-medium text-amber-600">
                ⚠️ فقط {toPersianDigits(remaining)} جلسه باقی مانده - لطفاً تمدید کنید
              </p>
            )}
          </div>
        )}

        {/* Session History */}
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
            <Calendar className="h-4 w-4 text-sky-500" />
            تاریخچه جلسات
          </h3>
          {student.sessions.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">جلسه‌ای ثبت نشده است</p>
          ) : (
            <div className="flex flex-col gap-2">
              {student.sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        s.status === "PRESENT"
                          ? "bg-green-100"
                          : s.status === "ABSENT"
                          ? "bg-red-100"
                          : s.status === "EXCUSED"
                          ? "bg-amber-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {s.status === "PRESENT" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : s.status === "ABSENT" ? (
                        <X className="h-4 w-4 text-red-500" />
                      ) : s.status === "EXCUSED" ? (
                        <Clock className="h-4 w-4 text-amber-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{jalaliDateShort(s.date)}</span>
                      {s.note === "جبرانی" && (
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                          جبرانی
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      s.status === "PRESENT"
                        ? "text-green-600"
                        : s.status === "ABSENT"
                        ? "text-red-500"
                        : s.status === "EXCUSED"
                        ? "text-amber-600"
                        : "text-gray-400"
                    }`}
                  >
                    {SESSION_STATUS_LABELS[s.status] || s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rounded-2xl bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-400">
            این صفحه توسط استاد به‌روزرسانی می‌شود
          </p>
        </div>
      </div>
    </div>
  );
}
