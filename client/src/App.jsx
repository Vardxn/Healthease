import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadPrescription from './pages/UploadPrescription';
import PrescriptionList from './pages/PrescriptionList';
import PatientProfile from './pages/PatientProfile';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import DrugInteractions from './pages/DrugInteractions';
import AIChatbot from './components/AIChatbot';

function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen">
          <Navbar />
          <main className="container mx-auto px-4 py-8 animate-fadeIn">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/upload" element={<UploadPrescription />} />
              <Route path="/prescriptions" element={<PrescriptionList />} />
              <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
              <Route path="/profile" element={<PatientProfile />} />
              <Route path="/interactions" element={<DrugInteractions />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <AIChatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
