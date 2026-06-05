import { useState } from "react";
import "./App.css";

function createRoomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 4; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }

  return code;
}

function App() {
  const [playerName, setPlayerName] = useState("Paul");
  const [joinCode, setJoinCode] = useState("");
  const [activeRoomCode, setActiveRoomCode] = useState("");
  const [screen, setScreen] = useState<"home" | "lobby">("home");

  function handleCreateRoom() {
    const newCode = createRoomCode();
    setActiveRoomCode(newCode);
    setScreen("lobby");
  }

  function handleJoinRoom() {
    if (!joinCode.trim()) return;
    setActiveRoomCode(joinCode.trim().toUpperCase());
    setScreen("lobby");
  }

  function handleLeaveRoom() {
    setActiveRoomCode("");
    setJoinCode("");
    setScreen("home");
  }

  if (screen === "lobby") {
    return (
      <main className="app">
        <section className="hero">
          <p className="eyebrow">RoomOS Lobby</p>

          <h1>Room {activeRoomCode}</h1>

          <p className="subtitle">
            A local prototype of a shared room with members, presence, and an
            event timeline.
          </p>

          <div className="card lobby-card">
            <div className="room-code-pill">
              Room Code <strong>{activeRoomCode}</strong>
            </div>

            <div className="lobby-grid">
              <section className="lobby-panel">
                <h2>Members</h2>

                <div className="member-row">
                  <span className="status-dot online"></span>
                  <div>
                    <strong>{playerName || "Guest"}</strong>
                    <p>Host</p>
                  </div>
                </div>

                <div className="member-row muted">
                  <span className="status-dot"></span>
                  <div>
                    <strong>Waiting...</strong>
                    <p>Invite another member</p>
                  </div>
                </div>
              </section>

              <section className="lobby-panel">
                <h2>Timeline</h2>

                <div className="event-row">
                  <span>01</span>
                  <p>Room {activeRoomCode} created</p>
                </div>

                <div className="event-row">
                  <span>02</span>
                  <p>{playerName || "Guest"} joined the room</p>
                </div>
              </section>
            </div>

            <button onClick={handleLeaveRoom}>Leave Room</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Cloudflare RoomOS Prototype</p>

        <h1>Shared Rooms for Games, Agents, and Decisions</h1>

        <p className="subtitle">
          A Cloudflare-native room engine for presence, shared state, events,
          voting, timelines, and real-time collaboration.
        </p>

        <div className="card">
          <input
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Your name"
          />

          <button onClick={handleCreateRoom}>Create Room</button>

          <div className="join-row">
            <input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder="Enter room code"
            />
            <button onClick={handleJoinRoom}>Join Room</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;