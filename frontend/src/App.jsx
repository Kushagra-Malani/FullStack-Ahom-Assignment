import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Home from './pages/Home';
import SessionDetail from './pages/SessionDetail';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import CreatorDashboard from './pages/CreatorDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Toast />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/creator" element={<CreatorDashboard />} />
          </Routes>
        </main>
        <footer className="footer">
          &copy; {new Date().getFullYear()} SessionHub. Built with Django + React.
        </footer>
      </AuthProvider>
    </BrowserRouter>
  );
}
