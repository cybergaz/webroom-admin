import { NextRequest, NextResponse } from "next/server";
import { API_V1, COOKIE_NAMES } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recordingId: string }> }
) {
  const { recordingId } = await params;
  const accessToken = req.cookies.get(COOKIE_NAMES.accessToken)?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `${API_V1}/admin/ptt-recordings/${recordingId}/url`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to get recording URL" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
