
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../Components/HomePage';
import LoginPage from '../Components/LoginPage';
import AboutPage from '../Components/AboutPage';
import ShopNowPage from '../Components/ShopNowPage';
import OtpPage from '../Components/OtpPage';
import './App.css'
// import './index.css'
function App() {
  return (
    <Router>
      <Routes>
        {/* Định tuyến trang Home là trang đầu tiên */}
        <Route path="/" element={<HomePage />} />
        {/* Định tuyến trang Login */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} /> 
        <Route path="/shop" element={<ShopNowPage />} /> 
        <Route path="/otp" element={<OtpPage />} />
      </Routes>
    </Router>
  )
}

export default App
