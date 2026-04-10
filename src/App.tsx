import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import CharacterSelect from './pages/CharacterSelect'
import CharacterCreator from './pages/CharacterCreator'
import Game from './pages/Game'
import Highscore from './pages/Highscore'
import Teacher from './pages/Teacher'
import UnitCircleApp from './pages/UnitCircleApp'
import MiniGames from './pages/MiniGames'
import Intro from './pages/Intro'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/einheitskreis" element={<UnitCircleApp />} />
        <Route path="/charakter" element={<CharacterSelect />} />
        <Route path="/charakter-erstellen" element={<CharacterCreator />} />
        <Route path="/spiel" element={<Game />} />
        <Route path="/highscore" element={<Highscore />} />
        <Route path="/lehrer" element={<Teacher />} />
        <Route path="/minispiele" element={<MiniGames />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
