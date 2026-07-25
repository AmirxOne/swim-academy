"use server";

import { redirect } from "next/navigation";
import { createSession, verifySession } from "@/lib/auth";
import { LoginClient } from "./login-client";

export default async function LoginPage() {
  const authed = await verifySession();
  if (authed) redirect("/dashboard");

  return <LoginClient />;
}

export async function handleLogin(formData: FormData) {
  "use server";
  const password = String(formData.get("password") || "");
  const success = await createSession(password);
  if (success) {
    redirect("/dashboard");
  }
  // If failed, redirect back with error flag
  redirect("/login?error=1");
}
