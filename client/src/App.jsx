import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Rewards from './pages/Rewards'
import EcoProfile from './pages/EcoProfile'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/shop" element={<EcoProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
