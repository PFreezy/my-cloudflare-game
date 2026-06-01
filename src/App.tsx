import "./App.css";

function App() {
  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Cloudflare Multiplayer Prototype</p>

        <h1>Paul's First Cloudflare Game</h1>

        <p className="subtitle">
          Create a room, invite a friend, and build the foundation for a
          real-time multiplayer game running entirely on Cloudflare.
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