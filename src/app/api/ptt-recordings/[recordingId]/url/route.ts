import { NextRequest, NextResponse } from "next/server";
import { API_V1, COOKIE_NAMES } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recordingId: string }> }
) {
  const { recordingId } = await params;
  const accessToken =
    req.headers.get("x-refreshed-access-token") ||
    req.cookies.get(COOKIE_NAMES.accessToken)?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(
      `${API_V1}/admin/ptt-recordings/${recordingId}/url`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch (err) {
    console.error("[ptt-url] Backend unreachable:", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[ptt-url] Backend returned ${res.status}:`, body);
    return NextResponse.json(
      { error: `Backend error ${res.status}`, detail: body },
      { status: res.status }
    );
  }

  const data = await res.json();
  console.log(`[ptt-url] data=${JSON.stringify(data)}`);
  return NextResponse.json(data);
}
