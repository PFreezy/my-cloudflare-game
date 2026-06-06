type RoomType = "game" | "agent" | "decision" | "simulation";

type RoomMetadata = {
  code: string;
  roomType: RoomType;
  status: "Local Prototype";
  connection: "Worker API Mock";
  createdAt: string;
};

const allowedRoomTypes = new Set<RoomType>([
  "game",
  "agent",
  "decision",
  "simulation",
]);

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

function isRoomCode(value: string) {
  return /^[A-Z0-9]{4}$/.test(value);
}

function createRoomMetadata(roomType: RoomType, roomCode = createRoomCode()): RoomMetadata {
  return {
    code: roomCode,
    roomType,
    status: "Local Prototype",
    connection: "Worker API Mock",
    createdAt: new Date().toISOString(),
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

async function handleCreateRoom(request: Request) {
  let roomType: RoomType = "decision";

  try {
    const body = await request.json();
    const requestedRoomType = readRoomType(body);

    if (requestedRoomType) {
      roomType = requestedRoomType;
    }
  } catch {
    return jsonResponse(
      {
        error: "Request body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  return jsonResponse({
    room: createRoomMetadata(roomType),
  });
}

function handleGetRoom(request: Request, roomCode: string) {
  const cleanedCode = roomCode.toUpperCase();

  if (!isRoomCode(cleanedCode)) {
    return jsonResponse(
      {
        error: "Room code must be exactly 4 uppercase letters or numbers.",
      },
      { status: 400 },
    );
  }

  const url = new URL(request.url);
  const requestedRoomType = url.searchParams.get("roomType");
  const roomType = isRoomType(requestedRoomType) ? requestedRoomType : "decision";

  return jsonResponse({
    room: createRoomMetadata(roomType, cleanedCode),
  });
}

export default {
  fetch(request) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/rooms") {
      return handleCreateRoom(request);
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/rooms/")) {
      const roomCode = url.pathname.replace("/api/rooms/", "");
      return handleGetRoom(request, roomCode);
    }

    if (url.pathname.startsWith("/api/")) {
      return notFound();
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
