import { getSettings } from "@/app/actions/settings";
import { updateSettings } from "@/app/actions/settings";
import { formatToman, toPersianDigits } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold">تنظیمات</h2>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات کلی</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={{
            instructorName: settings.instructorName,
            poolName: settings.poolName,
            semiPrivateShare: settings.semiPrivateShare,
            unregisteredShare: settings.unregisteredShare,
            privateShare: settings.privateShare,
            semiPrivatePrice: settings.semiPrivatePrice,
            unregisteredPrice: settings.unregisteredPrice,
            privateKey: settings.privateKey,
            adminPasswordHash: settings.adminPasswordHash,
          }} />
        </CardContent>
      </Card>
    </div>
  );
}
