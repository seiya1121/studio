import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Tetris from './pages/tetris'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'tetris':
        return <Tetris onBackToHome={() => setCurrentPage('home')} />
      default:
        return (
          <>
            <div>
              <a href="https://vite.dev" target="_blank">
                <img src={viteLogo} className="logo" alt="Vite logo" />
              </a>
              <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react" alt="React logo" />
              </a>
            </div>
            <h1>Game Studio</h1>
            <div className="card">
              <button onClick={() => setCurrentPage('tetris')} className="game-button">
                Play Tetris
              </button>
              <p>
                Click the button above to play Tetris!
              </p>
            </div>
            <p className="read-the-docs">
              Click on the Vite and React logos to learn more
            </p>
          </>
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
