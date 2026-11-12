import { BrowserRouter, Route, Routes } from 'react-router'
import LigtasApp from './features/LigtasApp'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<LigtasApp />} />
        <Route path="*" element={<LigtasApp />} />
      </Routes>
    </BrowserRouter>
  )
}
