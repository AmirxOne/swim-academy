import { NextRequest, NextResponse } from "next/server";
import { exportStudentsExcel, exportAttendanceExcel, exportFinanceExcel } from "@/app/actions/export";
import { verifySession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") || "students";

  let data: Uint8Array;
  let filename: string;

  switch (type) {
    case "students":
      data = await exportStudentsExcel();
      filename = "students.xlsx";
      break;
    case "attendance":
      data = await exportAttendanceExcel();
      filename = "attendance.xlsx";
      break;
    case "finance":
      data = await exportFinanceExcel();
      filename = "finance.xlsx";
      break;
    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const blob = new Blob([data as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return new NextResponse(blob, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
