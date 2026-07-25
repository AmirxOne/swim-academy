"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Check } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";

interface SettingsData {
  instructorName: string;
  poolName: string;
  semiPrivateShare: number;
  unregisteredShare: number;
  privateShare: number;
  semiPrivatePrice: number;
  unregisteredPrice: number;
  privateKey: number;
  adminPasswordHash: string;
}

export function SettingsForm({ settings }: { settings: SettingsData }) {
  const [form, setForm] = useState(settings);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof SettingsData, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.append("instructorName", form.instructorName);
      formData.append("poolName", form.poolName);
      formData.append("semiPrivateShare", String(form.semiPrivateShare));
      formData.append("unregisteredShare", String(form.unregisteredShare));
      formData.append("privateShare", String(form.privateShare));
      formData.append("semiPrivatePrice", String(form.semiPrivatePrice));
      formData.append("unregisteredPrice", String(form.unregisteredPrice));
      formData.append("privateKey", String(form.privateKey));
      formData.append("adminPasswordHash", form.adminPasswordHash === settings.adminPasswordHash ? "" : form.adminPasswordHash);
      await updateSettings(formData);
      setSaved(true);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* General info */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">نام مربی</label>
        <Input
          value={form.instructorName}
          onChange={(e) => handleChange("instructorName", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">نام استخر</label>
        <Input
          value={form.poolName}
          onChange={(e) => handleChange("poolName", e.target.value)}
        />
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="mb-3 text-sm font-bold">درصد سهم مربی</h3>
        <div className="grid grid-cols-3 gap-3">
          <ShareInput
            label="خصوصی"
            value={form.privateShare}
            onChange={(v) => handleChange("privateShare", v)}
          />
          <ShareInput
            label="نیمه‌خصوصی"
            value={form.semiPrivateShare}
            onChange={(v) => handleChange("semiPrivateShare", v)}
          />
          <ShareInput
            label="ثبت‌نام‌نشده"
            value={form.unregisteredShare}
            onChange={(v) => handleChange("unregisteredShare", v)}
          />
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="mb-3 text-sm font-bold">شهریه‌ها (تومان)</h3>
        <div className="grid grid-cols-3 gap-3">
          <PriceInput
            label="خصوصی"
            value={form.privateKey}
            onChange={(v) => handleChange("privateKey", v)}
          />
          <PriceInput
            label="نیمه‌خصوصی"
            value={form.semiPrivatePrice}
            onChange={(v) => handleChange("semiPrivatePrice", v)}
          />
          <PriceInput
            label="ثبت‌نام‌نشده"
            value={form.unregisteredPrice}
            onChange={(v) => handleChange("unregisteredPrice", v)}
          />
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="mb-3 text-sm font-bold">امنیت</h3>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">رمز عبور (در صورت تغییر وارد کنید)</label>
          <Input
            type="password"
            value={form.adminPasswordHash}
            onChange={(e) => handleChange("adminPasswordHash", e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {saved ? (
          <>
            <Check className="h-4 w-4" />
            ذخیره شد
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            {isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </>
        )}
      </Button>
    </form>
  );
}

function ShareInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="relative">
        <Input
          type="number"
          step="0.001"
          min="0"
          max="1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="pr-8 text-sm"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          %
        </span>
      </div>
    </div>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="text-sm"
      />
    </div>
  );
}
