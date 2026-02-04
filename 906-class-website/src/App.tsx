import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Bulletin from './pages/Bulletin';
import Schedule from './pages/Schedule';
import Calendar from './pages/Calendar';
import Homework from './pages/Homework';
import HonorRoll from './pages/HonorRoll';
import Seating from './pages/Seating';
import Gallery from './pages/Gallery';
import Graffiti from './pages/Graffiti';
import ClassFund from './pages/ClassFund';
import Violations from './pages/Violations';
import Stories from './pages/Stories';
import Fortune from './pages/Fortune';
import Polling from './pages/Polling';
import ExternalLinks from './pages/ExternalLinks';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/bulletin" element={<Bulletin />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/honor-roll" element={<HonorRoll />} />
            <Route path="/seating" element={<Seating />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/graffiti" element={<Graffiti />} />
            <Route path="/class-fund" element={<ClassFund />} />
            <Route path="/violations" element={<Violations />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/fortune" element={<Fortune />} />
            <Route path="/polling" element={<Polling />} />
            <Route path="/external-links" element={<ExternalLinks />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
