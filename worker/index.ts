import { DurableObject } from "cloudflare:workers";

type RoomType = "game" | "agent" | "decision" | "simulation";

type RoomStatus = "Open";

type RoomConnection = "Durable Object";

type RoomMember = {
  id: string;
  name: string;
  role: string;
  status: "Online" | "Mock";
};

type RoomEvent = {
  id: string;
  type: string;
  label: string;
  timestamp: string;
};

type RoomMetadata = {
  code: string;
  roomType: RoomType;
  status: RoomStatus;
  connection: RoomConnection;
  createdAt: string;
  members: RoomMember[];
  events: RoomEvent[];
};

type CreateRoomRequest = {
  roomType: RoomType;
  hostName: string;
};

const allowedRoomTypes = new Set<RoomType>([
  "game",
  "agent",
  "decision",
  "simulation",
]);

const roomTypeLabels: Record<RoomType, string> = {
  game: "Game Room",
  agent: "Agent Room",
  decision: "Decision Room",
  simulation: "Simulation Room",
};

function createRoomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(4);
  crypto.getRandomValues(values);

  return Array.from(values, (value) => letters[value % letters.length]).join("");
}

function isRoomType(value: unknown): value is RoomType {
  return typeof value === "string" && allowedRoomTypes.has(value as RoomType);
}

function readRoomType(value: unknown) {
  if (!value || typeof value !== "object" || !("roomType" in value)) {
    return null;
  }

  const roomType = value.roomType;

  return isRoomType(roomType) ? roomType : null;
}

function readHostName(value: unknown) {
  if (!value || typeof value !== "object" || !("hostName" in value)) {
    return "Guest";
  }

  const hostName = value.hostName;

  if (typeof hostName !== "string") {
    return "Guest";
  }

  return hostName.trim().slice(0, 80) || "Guest";
}

function isRoomCode(value: string) {
  return /^[A-Z0-9]{4}$/.test(value);
}

function createInitialMembers(hostName: string): RoomMember[] {
  return [
    {
      id: "host",
      name: hostName,
      role: "Host",
      status: "Online",
    },
  ];
}

function createInitialEvents(
  roomCode: string,
  roomType: RoomType,
  hostName: string,
  createdAt: string,
): RoomEvent[] {
  return [
    {
      id: "room-created",
      type: "room.created",
      label: `Room ${roomCode} created`,
      timestamp: createdAt,
    },
    {
      id: "room-type-selected",
      type: "room.type_selected",
      label: `${roomTypeLabels[roomType]} selected`,
      timestamp: createdAt,
    },
    {
      id: "host-joined",
      type: "member.joined",
      label: `${hostName} joined as host`,
      timestamp: createdAt,
    },
  ];
}

function createRoomMetadata(request: CreateRoomRequest, roomCode: string): RoomMetadata {
  const createdAt = new Date().toISOString();

  return {
    code: roomCode,
    roomType: request.roomType,
    status: "Open",
    connection: "Durable Object",
    createdAt,
    members: createInitialMembers(request.hostName),
    events: createInitialEvents(roomCode, request.roomType, request.hostName, createdAt),
  };
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

function notFound() {
  return jsonResponse(
    {
      error: "Not found",
    },
    { status: 404 },
  );
}

function getRoomObject(env: Env, roomCode: string) {
  return env.ROOM_OBJECT.getByName(roomCode);
}

export class RoomObject extends DurableObject<Env> {
  async createRoom(request: CreateRoomRequest & { code: string }) {
    const existingRoom = await this.ctx.storage.get<RoomMetadata>("room");

    if (existingRoom) {
      return existingRoom;
    }

    const room = createRoomMetadata(request, request.code);
    await this.ctx.storage.put("room", room);

    return room;
  }

  async getRoom() {
    return this.ctx.storage.get<RoomMetadata>("room");
  }
}

async function handleCreateRoom(request: Request, env: Env) {
  let roomType: RoomType = "decision";
  let hostName: string;

  try {
    const body = await request.json();
    const requestedRoomType = readRoomType(body);

    if (requestedRoomType) {
      roomType = requestedRoomType;
    }

    hostName = readHostName(body);
  } catch {
    return jsonResponse(
      {
        error: "Request body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  const roomCode = createRoomCode();
  const room = await getRoomObject(env, roomCode).createRoom({
    code: roomCode,
    roomType,
    hostName,
  });

  return jsonResponse({
    room,
  });
}

async function handleGetRoom(roomCode: string, env: Env) {
  const cleanedCode = roomCode.toUpperCase();

  if (!isRoomCode(cleanedCode)) {
    return jsonResponse(
      {
        error: "Room code must be exactly 4 uppercase letters or numbers.",
      },
      { status: 400 },
    );
  }

  const room = await getRoomObject(env, cleanedCode).getRoom();

  if (!room) {
    return jsonResponse(
      {
        error: "Room not found.",
      },
      { status: 404 },
    );
  }

  return jsonResponse({
    room,
  });
}

export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/rooms") {
      return handleCreateRoom(request, env);
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/rooms/")) {
      const roomCode = url.pathname.replace("/api/rooms/", "");
      return handleGetRoom(roomCode, env);
    }

    if (url.pathname.startsWith("/api/")) {
      return notFound();
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
