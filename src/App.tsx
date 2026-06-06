import { useState } from "react";
import "./App.css";

type Screen = "home" | "lobby";

type RoomType = "game" | "agent" | "decision" | "simulation";

type TimelineEvent = {
  id: string;
  type: string;
  label: string;
  timestamp: string;
};

type RoomTypeOption = {
  id: RoomType;
  label: string;
  marker: string;
  description: string;
  mode: string;
  mockMembers: Array<{
    name: string;
    role: string;
  }>;
};

const roomTypes: RoomTypeOption[] = [
  {
    id: "game",
    label: "Game Room",
    marker: "GR",
    description: "Coordinate players, turns, presence, and shared game state.",
    mode: "Real-time multiplayer mechanics and shared game state.",
    mockMembers: [
      { name: "Player Two", role: "Ready player" },
      { name: "Spectator", role: "Observer" },
    ],
  },
  {
    id: "agent",
    label: "Agent Room",
    marker: "AR",
    description: "Bring people and agents into the same working context.",
    mode: "Human and agent collaboration around shared context and tasks.",
    mockMembers: [
      { name: "Research Agent", role: "Context scout" },
      { name: "Planning Agent", role: "Workflow lead" },
    ],
  },
  {
    id: "decision",
    label: "Decision Room",
    marker: "DR",
    description: "Track proposals, votes, approvals, and outcomes.",
    mode: "Proposals, votes, approvals, and replayable decisions.",
    mockMembers: [
      { name: "Finance Lead", role: "Approver" },
      { name: "AI Analyst", role: "Evidence support" },
    ],
  },
  {
    id: "simulation",
    label: "Simulation Room",
    marker: "SR",
    description: "Explore scenarios, constraints, risks, and outcomes.",
    mode: "Sandboxed scenario exploration with timeline-backed state.",
    mockMembers: [
      { name: "Scenario Agent", role: "Model runner" },
      { name: "Risk Agent", role: "Stress tester" },
    ],
  },
];

function createRoomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 4; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }

  return code;
}

function getRoomType(roomType: RoomType) {
  return roomTypes.find((type) => type.id === roomType) ?? roomTypes[2];
}

function createInitialEvents(roomCode: string, roomType: RoomType, playerName: string) {
  const selectedRoomType = getRoomType(roomType);
  const hostName = playerName.trim() || "Guest";

  return [
    {
      id: "room-created",
      type: "room.created",
      label: `Room ${roomCode} created locally`,
      timestamp: "Just now",
    },
    {
      id: "room-type-selected",
      type: "room.type_selected",
      label: `${selectedRoomType.label} selected`,
      timestamp: "Just now",
    },
    {
      id: "host-joined",
      type: "member.joined",
      label: `${hostName} joined as host`,
      timestamp: "Just now",
    },
  ];
}

function App() {
  const [playerName, setPlayerName] = useState("Paul");
  const [joinCode, setJoinCode] = useState("");
  const [activeRoomCode, setActiveRoomCode] = useState("");
  const [roomType, setRoomType] = useState<RoomType>("decision");
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [screen, setScreen] = useState<Screen>("home");

  const selectedRoomType = getRoomType(roomType);
  const isJoinCodeValid = joinCode.length === 4;

  function openLobby(roomCode: string, selectedType: RoomType) {
    setActiveRoomCode(roomCode);
    setTimelineEvents(createInitialEvents(roomCode, selectedType, playerName));
    setCopyStatus("idle");
    setScreen("lobby");
  }

  function handleCreateRoom() {
    openLobby(createRoomCode(), roomType);
  }

  function handleJoinCodeChange(value: string) {
    setJoinCode(value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4));
  }

  function handleJoinRoom() {
    const cleanedCode = joinCode.trim().toUpperCase();

    if (cleanedCode.length !== 4) {
      return;
    }

    openLobby(cleanedCode, roomType);
  }

  async function handleCopyInviteCode() {
    try {
      await navigator.clipboard.writeText(activeRoomCode);
      setCopyStatus("copied");
      setTimelineEvents((events) => [
        ...events,
        {
          id: `invite-copied-${Date.now()}`,
          type: "invite.copied",
          label: `Invite code ${activeRoomCode} copied`,
          timestamp: "Just now",
        },
      ]);
    } catch {
      setCopyStatus("failed");
    }

    window.setTimeout(() => {
      setCopyStatus("idle");
    }, 1800);
  }

  function handleLeaveRoom() {
    setActiveRoomCode("");
    setJoinCode("");
    setTimelineEvents([]);
    setCopyStatus("idle");
    setScreen("home");
  }

  if (screen === "lobby") {
    const members = [
      { name: playerName.trim() || "Guest", role: "Host", status: "Online" },
      ...selectedRoomType.mockMembers.map((member) => ({
        ...member,
        status: "Mock",
      })),
    ];

    return (
      <main className="app app-lobby">
        <section className="lobby-shell" aria-labelledby="room-heading">
          <div className="room-header">
            <div>
              <p className="eyebrow">RoomOS Lobby</p>
              <h1 id="room-heading">Room {activeRoomCode}</h1>
              <p className="subtitle">
                Frontend-only local prototype for shared state, presence,
                timelines, and decision workflows.
              </p>
            </div>

            <div className="room-summary" aria-label="Room details">
              <span className="status-pill strong">{selectedRoomType.label}</span>
              <span className="status-pill">Local Prototype</span>
              <span className="status-pill">Offline Mock</span>
            </div>
          </div>

          <div className="lobby-actions">
            <div className="room-code-block">
              <span>Invite Code</span>
              <strong>{activeRoomCode}</strong>
            </div>

            <button className="secondary-button" onClick={handleCopyInviteCode}>
              {copyStatus === "copied"
                ? "Copied!"
                : copyStatus === "failed"
                  ? "Copy Failed"
                  : "Copy Invite Code"}
            </button>
          </div>

          <div className="lobby-grid">
            <section className="panel members-panel" aria-labelledby="members-heading">
              <div className="panel-heading">
                <h2 id="members-heading">Members</h2>
                <span>{members.length} present</span>
              </div>

              <div className="member-list">
                {members.map((member) => (
                  <article className="member-card" key={`${member.name}-${member.role}`}>
                    <span className="status-dot online" aria-hidden="true"></span>
                    <div>
                      <strong>{member.name}</strong>
                      <p>{member.role}</p>
                    </div>
                    <span className="member-status">{member.status}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel timeline-panel" aria-labelledby="timeline-heading">
              <div className="panel-heading">
                <h2 id="timeline-heading">Timeline</h2>
                <span>{timelineEvents.length} events</span>
              </div>

              <div className="timeline-list">
                {timelineEvents.map((event) => (
                  <article className="timeline-card" key={event.id}>
                    <span className="event-type">{event.type}</span>
                    <p>{event.label}</p>
                    <time>{event.timestamp}</time>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel mode-panel" aria-labelledby="mode-heading">
              <div className="room-marker">{selectedRoomType.marker}</div>
              <div>
                <h2 id="mode-heading">{selectedRoomType.label}</h2>
                <p>{selectedRoomType.mode}</p>
              </div>
            </section>
          </div>

          <button className="leave-button" onClick={handleLeaveRoom}>
            Leave Room
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="home-shell" aria-labelledby="home-heading">
        <p className="eyebrow">Cloudflare RoomOS Prototype</p>

        <h1 id="home-heading">Shared Rooms for Games, Agents, and Decisions</h1>

        <p className="subtitle">
          RoomOS is a Cloudflare-native room engine for presence, shared state,
          events, voting, timelines, and real-time collaboration.
        </p>

        <div className="home-panel">
          <label className="field">
            <span>Player Name</span>
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Your name"
            />
          </label>

          <div className="room-type-section">
            <div className="section-heading">
              <h2>Room Type</h2>
              <p>Choose the local room model to preview.</p>
            </div>

            <div className="room-type-grid">
              {roomTypes.map((type) => (
                <button
                  className={`room-type-card ${roomType === type.id ? "selected" : ""}`}
                  key={type.id}
                  onClick={() => setRoomType(type.id)}
                  type="button"
                >
                  <span className="room-marker">{type.marker}</span>
                  <strong>{type.label}</strong>
                  <span>{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="primary-button" onClick={handleCreateRoom}>
            Create Room
          </button>

          <div className="join-section">
            <div className="section-heading">
              <h2>Join Room</h2>
              <p>Enter a 4-character invite code.</p>
            </div>

            <div className="join-row">
              <input
                aria-label="Room code"
                value={joinCode}
                maxLength={4}
                onChange={(event) => handleJoinCodeChange(event.target.value)}
                placeholder="ROOM"
              />
              <button
                className="secondary-button"
                disabled={!isJoinCodeValid}
                onClick={handleJoinRoom}
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
