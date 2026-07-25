"use client";

import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { handleLogin } from "./page";

export function LoginClient() {
  const searchParams = useSearchParams();
  const hasError = searchParams.get("error") === "1";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-white shadow-lg shadow-primary/30">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">آکادمی شنا</h1>
          <p className="text-sm text-muted-foreground">برای ورود رمز عبور را وارد کنید</p>
        </div>

        <form action={handleLogin} className="flex flex-col gap-4">
          {hasError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-center text-sm text-red-700">
              رمز عبور اشتباه است
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Input
              name="password"
              type="password"
              placeholder="رمز عبور"
              autoFocus
              className="text-center text-lg tracking-widest"
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            ورود
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          رمز پیش‌فرض: admin123
        </p>
      </div>
    </div>
  );
}
