"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getPttRecordingUrl } from "@/app/actions/rooms";
import type { PttRecording } from "@/lib/types/room";
import { Play, Download, Loader2 } from "lucide-react";

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AudioPlayer({ recordingId }: { recordingId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePlay() {
    if (url) return; // already loaded
    setLoading(true);
    try {
      const { url: signedUrl } = await getPttRecordingUrl(recordingId);
      setUrl(signedUrl);
    } catch (e) {
      console.error("Failed to get recording URL:", e);
    } finally {
      setLoading(false);
    }
  }

  if (url) {
    return (
      <audio controls autoPlay preload="auto" className="h-8 max-w-56">
        <source src={url} type="audio/mp4" />
      </audio>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handlePlay}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Play className="size-4" />
      )}
    </Button>
  );
}

function DownloadButton({ recordingId }: { recordingId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const { url } = await getPttRecordingUrl(recordingId);
      window.open(url, "_blank");
    } catch (e) {
      console.error("Failed to get download URL:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
    </Button>
  );
}

interface PttRecordingTableProps {
  recordings: PttRecording[];
  currentPage: number;
  totalPages: number;
}

export function PttRecordingTable({
  recordings,
  currentPage,
  totalPages,
}: PttRecordingTableProps) {
  const columns: Column<PttRecording>[] = [
    {
      key: "userName",
      header: "User",
      render: (r) => <span className="text-sm font-medium">{r.userName}</span>,
    },
    {
      key: "roomName",
      header: "Room",
      render: (r) => <span className="text-sm">{r.roomName}</span>,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (r) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(r.createdAt)}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (r) => (
        <span className="text-muted-foreground text-sm">
          {formatMs(r.durationMs)}
        </span>
      ),
    },
    {
      key: "size",
      header: "Size",
      render: (r) => (
        <span className="text-muted-foreground text-sm">
          {formatBytes(r.fileSizeBytes)}
        </span>
      ),
    },
    {
      key: "play",
      header: "Play",
      render: (r) => <AudioPlayer recordingId={r.id} />,
    },
    {
      key: "download",
      header: "",
      render: (r) => <DownloadButton recordingId={r.id} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={recordings}
      showSearch={false}
      currentPage={currentPage}
      totalPages={totalPages}
      emptyMessage="No PTT recordings found."
    />
  );
}
