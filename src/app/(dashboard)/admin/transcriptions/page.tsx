import { getAccessToken } from "@/lib/cookies";
import { TranscriptionsClient } from "./transcriptions-client";

export default async function TranscriptionsPage() {
  const token = (await getAccessToken()) ?? null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transcriptions</h1>
      <TranscriptionsClient token={token} />
    </div>
  );
}
