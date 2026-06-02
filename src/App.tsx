import "./App.css";

function App() {
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
          <button>Create Room</button>

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