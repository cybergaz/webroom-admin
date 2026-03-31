"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Room } from "@/lib/types/room";

interface PttRecordingFiltersProps {
  rooms: Room[];
  members: { id: string; name: string }[];
  currentRoomId?: string;
  currentUserId?: string;
}

export function PttRecordingFilters({
  rooms,
  members,
  currentRoomId,
  currentUserId,
}: PttRecordingFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    // Reset page when filters change
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={currentRoomId ?? ""}
        onChange={(e) =>
          navigate({
            roomId: e.target.value || undefined,
            userId: undefined, // reset user filter when room changes
          })
        }
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        <option value="">All Rooms</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      {currentRoomId && members.length > 0 && (
        <select
          value={currentUserId ?? ""}
          onChange={(e) =>
            navigate({ userId: e.target.value || undefined })
          }
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="">All Users</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
