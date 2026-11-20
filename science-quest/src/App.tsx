
import GameCanvas from './components/GameCanvas';
import './App.css';

function App() {
  return (
    <main className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">⚡</span>
          <span>SCIENCE QUEST</span>
        </div>

        <span className="level-badge">WORLD 01</span>
      </header>

      <section className="game-section">
        <div className="game-heading">
          <div>
            <p className="eyebrow">WELCOME, EXPLORER!</p>
            <h1>Magnet & Force</h1>
            <p>Discover the invisible power of magnets.</p>
          </div>
        </div>

        <GameCanvas />

        <footer className="game-footer">
          <span>SCIENCE QUEST</span>
          <span>LEARN · EXPLORE · DISCOVER</span>
        </footer>
      </section>
    </main>
  );
}

export default App;
