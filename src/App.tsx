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
  const [roomCode, setRoomCode] = useState("");

  function handleCreateRoom() {
    setRoomCode(createRoomCode());
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
          <button onClick={handleCreateRoom}>Create Room</button>

          {roomCode && (
            <div className="room-result">
              <p>Your room code is</p>
              <strong>{roomCode}</strong>
            </div>
          )}

          <div className="join-row">
            <input placeholder="Enter room code" />
            <button>Join Room</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;