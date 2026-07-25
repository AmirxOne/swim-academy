import { Wallet, TrendingUp, Plus, CircleDollarSign } from "lucide-react";
import { getPayments, getFinanceSummary } from "@/app/actions/finance";
import { getStudents } from "@/app/actions/students";
import { formatToman, toPersianDigits, jalaliDateShort, STUDENT_TYPE_LABELS } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddPaymentDialog } from "./add-payment-dialog";
import { ExportButton } from "@/components/ExportButton";

export default async function FinancePage() {
  const [payments, summary, students] = await Promise.all([
    getPayments(),
    getFinanceSummary(),
    getStudents(),
  ]);

  const coachNet = summary.totalIncome - summary.totalCoachShare;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">مالی و حسابداری</h2>
        <div className="flex items-center gap-2">
          <ExportButton type="finance" label="" />
          <AddPaymentDialog students={students.map((s) => ({ id: s.id, name: s.name }))} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="درآمد کل"
          value={formatToman(summary.totalIncome)}
          icon={<TrendingUp className="h-4 w-4" />}
          className="col-span-2"
        />
        <StatCard
          label="سهم مربی"
          value={formatToman(summary.totalCoachShare)}
          className="border-green-200 bg-green-50"
        />
        <StatCard
          label="سهم استخر"
          value={formatToman(coachNet)}
          className="border-blue-200 bg-blue-50"
        />
      </div>

      {/* Breakdown by type */}
      <Card>
        <CardHeader>
          <CardTitle>تفکیک بر اساس نوع کلاس</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ShareRow
            label="خصوصی"
            income={summary.privateIncome}
            share={summary.privateShare}
            pct={summary.privateSharePct}
            color="text-purple-600"
          />
          <ShareRow
            label="نیمه‌خصوصی"
            income={summary.semiPrivateIncome}
            share={summary.semiPrivateShare}
            pct={summary.semiPrivateSharePct}
            color="text-blue-600"
          />
          <ShareRow
            label="ثبت‌نام‌نشده"
            income={summary.unregisteredIncome}
            share={summary.unregisteredShare}
            pct={summary.unregisteredSharePct}
            color="text-orange-600"
          />
        </CardContent>
      </Card>

      {/* Payment list */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          آخرین پرداخت‌ها ({toPersianDigits(payments.length)})
        </h3>
        {payments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Wallet className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">پرداختی ثبت نشده است</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{p.student.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px]">
                      {STUDENT_TYPE_LABELS[p.student.type] || p.student.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {jalaliDateShort(p.date)}
                    </span>
                    {p.note && (
                      <span className="text-xs text-muted-foreground truncate">· {p.note}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 font-bold text-green-600 shrink-0">
                  <CircleDollarSign className="h-4 w-4" />
                  {formatToman(p.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShareRow({
  label,
  income,
  share,
  pct,
  color,
}: {
  label: string;
  income: number;
  share: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-3">
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${color}`}>{label}</span>
        <Badge variant="secondary" className="text-[10px]">
          {toPersianDigits(Math.round(pct * 100))}%
        </Badge>
      </div>
      <div className="text-left">
        <p className="text-sm font-bold">{formatToman(share)}</p>
        <p className="text-[10px] text-muted-foreground">از {formatToman(income)}</p>
      </div>
    </div>
  );
}
