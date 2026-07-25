import { jalaliDateShort } from "@/lib/utils";

/**
 * Generate a renewal message for a student.
 */
export function generateRenewalMessage(
  studentName: string,
  remaining: number,
  lastSessionDate: string | null
) {
  const lastDate = lastSessionDate ? jalaliDateShort(lastSessionDate) : "";
  return `جناب آقای/خانم ${studentName}\nبا سلام و احترام، گزارش دوره آموزش شنا شما:\n✅ جلسات تکمیل شد (${lastDate})\nخواهشمند است نسبت به ثبت‌نام مجدد اقدام نمایید.\nمتشکرم`;
}
