import JoinGameRoom from './components/JoinGameRoom'
import CreateUser from './components/CreateUser'

function App() {
  return (
    <div className="app">
      <h1>ft_transcendence — Othello</h1>
      <p>Le plateau de jeu arrive ici .</p>
      <CreateUser />
      <JoinGameRoom />
    </div>
  )
}

export default App
