import { useState } from 'react'
import './App.css'
import Tetris from './pages/tetris'
import SpaceAdventure from './pages/space-adventure'
import BattleArena from './pages/battle-arena'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'tetris':
        return <Tetris onBackToHome={() => setCurrentPage('home')} />
      case 'space-adventure':
        return <SpaceAdventure onBackToHome={() => setCurrentPage('home')} />
      case 'battle-arena':
        return <BattleArena onBackToHome={() => setCurrentPage('home')} />
      default:
        return (
          <div className="home-content">
            <header className="header">
              <div className="logo">
                <span className="logo-text">Studio</span>
                <div className="logo-accent"></div>
              </div>
              <nav className="nav">
                <span className="nav-item active">Games</span>
                <span className="nav-item">About</span>
                <span className="nav-item">Contact</span>
              </nav>
            </header>
            
            <main className="main-content">
              <div className="hero-section">
                <h1 className="hero-title">Welcome to Game Studio</h1>
                <p className="hero-subtitle">Discover amazing games and experiences</p>
              </div>
              
              <div className="games-catalog">
                <h2 className="catalog-title">Featured Games</h2>
                <div className="games-grid">
                  <div className="game-card tetris-card" onClick={() => setCurrentPage('tetris')}>
                    <div className="game-icon">🎮</div>
                    <h3 className="game-title">Tetris</h3>
                    <p className="game-description">Classic puzzle game with modern twist</p>
                    <div className="game-tags">
                      <span className="tag">Puzzle</span>
                      <span className="tag">Classic</span>
                    </div>
                    <button className="play-button">Play Now</button>
                  </div>
                  
                  <div className="game-card space-adventure-card" onClick={() => setCurrentPage('space-adventure')}>
                    <div className="game-icon">🚀</div>
                    <h3 className="game-title">Space Adventure</h3>
                    <p className="game-description">Epic space shooting game with cyberpunk style</p>
                    <div className="game-tags">
                      <span className="tag">Shooting</span>
                      <span className="tag">Sci-Fi</span>
                    </div>
                    <button className="play-button">Play Now</button>
                  </div>
                  
                  <div className="game-card battle-arena-card" onClick={() => setCurrentPage('battle-arena')}>
                    <div className="game-icon">⚔️</div>
                    <h3 className="game-title">Battle Arena</h3>
                    <p className="game-description">ターンベース戦略バトルゲーム</p>
                    <div className="game-tags">
                      <span className="tag">Strategy</span>
                      <span className="tag">Turn-based</span>
                    </div>
                    <button className="play-button">Play Now</button>
                  </div>
                </div>
              </div>
            </main>
            
            <footer className="footer">
              <p>Powered by React & Vite ⚡</p>
            </footer>
          </div>
        )
    }
  }

  return (
    <div className="app-container">
      {renderPage()}
    </div>
  )
}

export default App
