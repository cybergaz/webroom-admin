export interface Room {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "ended";
  getstreamCallId: string;
  createdBy: string;
  hostId?: string;
  createdAt: string;
}

export interface RoomMember {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: "user" | "host";
  addedAt: string;
}

export interface RoomSession {
  id: string;
  roomId: string;
  startedAt: string;
  endedAt?: string;
  speakingEvents: SpeakingEvent[];
}

export interface SpeakingEvent {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  user: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface RoomWithMembership {
  isMember: boolean;
  id: string;
  name: string;
  description: string | null;
  status: "active" | "inactive" | "live" | "ended";
  getstreamCallId: string;
  hostId: string | null;
  createdAt: Date;
}

export interface Recording {
  filename: string;
  url: string;
  session_id: string;
  start_time: string;
  end_time: string;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  hostId?: string;
}

export interface LiveRoomParticipant {
  userId: string;
  name: string;
}

export interface LiveRoom {
  id: string;
  name: string;
  hostId: string | null;
  hostName: string | null;
  participants: LiveRoomParticipant[];
}
