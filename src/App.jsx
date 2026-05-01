import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import PinVerify from './pages/PinVerify'
import Dashboard from './pages/Dashboard'
import AddPassword from './components/AddPassword'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pin" element={<PinVerify />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add" element={<AddPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App