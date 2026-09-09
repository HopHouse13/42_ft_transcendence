import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import Nav from './components/Nav'
import CreateUserPage from './pages/CreateUserPage'
import RoomPage from './pages/RoomPage'
import GamePage from './pages/GamePage'

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="app">
          <h1>ft_transcendence — Othello</h1>
          <Nav />
          <Routes>
            <Route path="/" element={<CreateUserPage />} />
            <Route path="/room" element={<RoomPage />} />
            <Route path="/game/:gameId" element={<GamePage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App
