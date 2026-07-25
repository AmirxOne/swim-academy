"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: "singleton" } });
  }
  return settings;
}

export async function updateSettings(formData: FormData) {
  const instructorName = String(formData.get("instructorName") || "").trim();
  const poolName = String(formData.get("poolName") || "").trim();
  const semiPrivateShare = parseFloat(String(formData.get("semiPrivateShare"))) || 0.315;
  const unregisteredShare = parseFloat(String(formData.get("unregisteredShare"))) || 0.35;
  const privateShare = parseFloat(String(formData.get("privateShare"))) || 0.45;
  const semiPrivatePrice = parseInt(String(formData.get("semiPrivatePrice"))) || 2205000;
  const unregisteredPrice = parseInt(String(formData.get("unregisteredPrice"))) || 2450000;
  const privateKey = parseInt(String(formData.get("privateKey"))) || 3825000;
  const adminPasswordHash = String(formData.get("adminPasswordHash") || "").trim();

  const data: Record<string, unknown> = {
    instructorName,
    poolName,
    semiPrivateShare,
    unregisteredShare,
    privateShare,
    semiPrivatePrice,
    unregisteredPrice,
    privateKey,
  };

  // Only update password if provided
  if (adminPasswordHash) {
    data.adminPasswordHash = adminPasswordHash;
  }

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/settings");
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { success: true };
}
