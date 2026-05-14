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
import ConsultationRoom from './pages/ConsultationRoom';
import DoctorDirectory from './pages/DoctorDirectory';
import DoctorLogin from './pages/DoctorLogin';
import DoctorRegister from './pages/DoctorRegister';
import DoctorDashboard from './pages/DoctorDashboard';
import MyConsultations from './pages/MyConsultations';
import DoctorConsultationNotes from './pages/DoctorConsultationNotes';
import CareTimeline from './pages/CareTimeline';
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
              <Route path="/doctors" element={<DoctorDirectory />} />
              <Route path="/consultations/my" element={<MyConsultations />} />
              <Route path="/timeline" element={<CareTimeline />} />
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/doctor/register" element={<DoctorRegister />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/consultation/:id" element={<ConsultationRoom />} />
              <Route path="/consultation/:id/notes" element={<DoctorConsultationNotes />} />
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
