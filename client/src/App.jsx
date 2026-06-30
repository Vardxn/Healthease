import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { useContext } from 'react';
import SidebarLayout from './components/SidebarLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import UploadPrescription from './pages/UploadPrescription';
import PrescriptionList from './pages/PrescriptionList';
import PatientProfile from './pages/PatientProfile';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import DrugInteractions from './pages/DrugInteractions';
import ConsultationRoom from './pages/ConsultationRoom';
import DoctorDirectory from './pages/DoctorDirectory';
import DoctorLogin from './pages/DoctorLogin';
import DoctorRegister from './pages/DoctorRegister';
import MyConsultations from './pages/MyConsultations';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorConsultationNotes from './pages/DoctorConsultationNotes';
import CareTimeline from './pages/CareTimeline';
import MedicineTracker from './pages/MedicineTracker';
import ReminderHistory from './pages/ReminderHistory';
import SymptomChecker from './pages/SymptomChecker';
import VitalsDashboard from './pages/VitalsDashboard';
import Notifications from './pages/Notifications';
import HealthScore from './pages/HealthScore';

// Premium SaaS Features
import HealthAssistant from './pages/HealthAssistant';
import ExportEngine from './pages/ExportEngine';
import AdminDashboard from './pages/AdminDashboard';
import { WebSocketProvider } from './context/WebSocketContext';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Pages - No Sidebar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/doctor/register" element={<DoctorRegister />} />

      {/* Landing Page */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />

      {/* Protected Routes - With Sidebar */}
      <Route
        path="/dashboard"
        element={user ? <SidebarLayout><Dashboard /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/upload"
        element={user ? <SidebarLayout><UploadPrescription /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/prescriptions"
        element={user ? <SidebarLayout><PrescriptionList /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile"
        element={user ? <SidebarLayout><PatientProfile /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/dashboard/analytics"
        element={user ? <SidebarLayout><AnalyticsDashboard /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/interactions"
        element={user ? <SidebarLayout><DrugInteractions /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/doctors"
        element={user ? <SidebarLayout><DoctorDirectory /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/consultations/my"
        element={user ? <SidebarLayout><MyConsultations /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/timeline"
        element={user ? <SidebarLayout><CareTimeline /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/medicine-tracker"
        element={user ? <SidebarLayout><MedicineTracker /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/medicine-history"
        element={user ? <SidebarLayout><ReminderHistory /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/vitals"
        element={user ? <SidebarLayout><VitalsDashboard /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/symptom-checker"
        element={user ? <SidebarLayout><SymptomChecker /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/doctor/dashboard"
        element={user ? <SidebarLayout><DoctorDashboard /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/consultation/:id"
        element={user ? <SidebarLayout><ConsultationRoom /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/consultation/:id/notes"
        element={user ? <SidebarLayout><DoctorConsultationNotes /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/notifications"
        element={user ? <SidebarLayout><Notifications /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/health-score"
        element={user ? <SidebarLayout><HealthScore /></SidebarLayout> : <Navigate to="/login" replace />}
      />

      {/* New SaaS Portfolio Routes */}
      <Route
        path="/assistant"
        element={user ? <SidebarLayout><HealthAssistant /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/exports"
        element={user ? <SidebarLayout><ExportEngine /></SidebarLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/dashboard"
        element={user ? <SidebarLayout><AdminDashboard /></SidebarLayout> : <Navigate to="/login" replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <NotificationProvider>
            <WebSocketProvider>
              <AuthProvider>
                <Router basename={import.meta.env.BASE_URL}>
                  <AppContent />
                </Router>
              </AuthProvider>
            </WebSocketProvider>
          </NotificationProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
