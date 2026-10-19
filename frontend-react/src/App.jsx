
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Apply from './pages/Apply'
import Offers from './pages/Offers'
import MyApplications from './pages/MyApplications'
import Auth from './pages/Auth'
import Eligibility from './pages/Eligibility'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/eligibility" element={<Eligibility />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} /> 
        <Route path="/privacy" element={<Privacy />} /> 
        <Route path="/terms" element={<Terms />} /> 
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />  
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

