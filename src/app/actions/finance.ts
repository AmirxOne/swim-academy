"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getPayments() {
  return prisma.payment.findMany({
    include: { student: true },
    orderBy: { date: "desc" },
    take: 100,
  });
}

export async function getPaymentsForStudent(studentId: string) {
  return prisma.payment.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
  });
}

export async function createPayment(formData: FormData) {
  const studentId = String(formData.get("studentId") || "");
  const amountStr = String(formData.get("amount") || "0");
  const amount = parseInt(amountStr);
  const note = String(formData.get("note") || "").trim() || null;
  const date = new Date().toISOString().slice(0, 10);

  if (!studentId) return { error: "شاگرد الزامی است" };
  if (!amount || amount <= 0) return { error: "مبلغ نامعتبر است" };

  const payment = await prisma.payment.create({
    data: { studentId, amount, note, date, type: "TUITION", status: "PAID" },
  });

  revalidatePath("/finance");
  revalidatePath(`/students/${studentId}`);
  return { success: true, id: payment.id };
}

export async function deletePayment(id: string, studentId: string) {
  await prisma.payment.delete({ where: { id } });
  revalidatePath("/finance");
  revalidatePath(`/students/${studentId}`);
  return { success: true };
}

export interface FinanceSummary {
  totalIncome: number;
  count: number;
  privateIncome: number;
  semiPrivateIncome: number;
  unregisteredIncome: number;
  // Coach share amounts (what the coach earns)
  privateShare: number;
  semiPrivateShare: number;
  unregisteredShare: number;
  totalCoachShare: number;
  // Percentages from settings
  privateSharePct: number;
  semiPrivateSharePct: number;
  unregisteredSharePct: number;
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const [payments, settings] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "PAID" },
      include: { student: true },
    }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);

  // Income by student type
  const privateIncome = payments
    .filter((p) => p.student.type === "PRIVATE")
    .reduce((s, p) => s + p.amount, 0);
  const semiPrivateIncome = payments
    .filter((p) => p.student.type === "SEMI_PRIVATE")
    .reduce((s, p) => s + p.amount, 0);
  const unregisteredIncome = payments
    .filter((p) => p.student.type === "UNREGISTERED")
    .reduce((s, p) => s + p.amount, 0);

  const privateSharePct = settings?.privateShare ?? 0.45;
  const semiPrivateSharePct = settings?.semiPrivateShare ?? 0.315;
  const unregisteredSharePct = settings?.unregisteredShare ?? 0.35;

  const privateShare = Math.round(privateIncome * privateSharePct);
  const semiPrivateShare = Math.round(semiPrivateIncome * semiPrivateSharePct);
  const unregisteredShare = Math.round(unregisteredIncome * unregisteredSharePct);
  const totalCoachShare = privateShare + semiPrivateShare + unregisteredShare;

  return {
    totalIncome,
    count: payments.length,
    privateIncome,
    semiPrivateIncome,
    unregisteredIncome,
    privateShare,
    semiPrivateShare,
    unregisteredShare,
    totalCoachShare,
    privateSharePct,
    semiPrivateSharePct,
    unregisteredSharePct,
  };
}
