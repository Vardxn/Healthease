import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { useContext, useEffect } from 'react';
import SidebarLayout from './components/SidebarLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import FeaturesIndex from './pages/features/FeaturesIndex';
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

// Guest tour mode provider
import { GuestProvider, GuestContext } from './context/GuestContext';

// Simple placeholder shell for public-facing features with liquid-glass token styling
const PublicFeatureShell = ({ title, description }) => {
  const { demoData, triggerAuthIntercept } = useContext(GuestContext);
  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-inter">
      <div className="liquid-glass max-w-2xl w-full rounded-3xl p-8 border border-white/5 bg-neutral-950 flex flex-col gap-6 animate-fade-up">
        <div className="flex flex-col gap-2">
          <span className="font-dmsans text-xs uppercase tracking-widest text-emerald-400 font-medium">Public Feature Preview</span>
          <h2 className="font-dmsans text-3xl sm:text-4xl tracking-[-0.05em] font-normal text-white">{title}</h2>
          <p className="font-light text-sm sm:text-base text-white/70 leading-relaxed mt-2">{description}</p>
        </div>

        {/* High-fidelity simulation/demo data display box */}
        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
          <span className="text-xs text-white/40 tracking-wider uppercase font-medium">Active Simulation Data</span>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-white/50">Active Patient Profile</span>
              <span className="text-sm font-medium text-white">{demoData.profile.name}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-white/50">Heart Rate Telemetry</span>
              <span className="text-sm font-medium text-emerald-400 animate-pulse">{demoData.biometricVitalsSeries.at(-1)?.heartRate} bpm</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-white/50">Simulated Vitals</span>
              <span className="text-sm font-medium text-white">
                {demoData.biometricVitalsSeries.at(-1)?.systolic}/{demoData.biometricVitalsSeries.at(-1)?.diastolic} mmHg
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-white/50">Digitized Record Count</span>
              <span className="text-sm font-medium text-white">{demoData.ocrScanHistory.length} files</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-2">
          <a href="/" className="text-xs text-white/50 hover:text-white underline transition-colors">
            &larr; Back to Landing Page
          </a>
          <a
            href="/dashboard"
            onClick={(event) => {
              event.preventDefault();
              triggerAuthIntercept('Sign in to use live HealthEase features, or enter the pre-populated demo patient workspace instantly.', '/dashboard');
            }}
            className="liquid-glass rounded-full px-5 py-2.5 text-xs font-medium text-white bg-white/[0.02] hover:bg-white/10 transition-colors"
          >
            Authenticate to Live Engine &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};

const ProtectedShell = ({ children, message }) => {
  const { user } = useContext(AuthContext);
  const { triggerAuthIntercept } = useContext(GuestContext);
  const location = useLocation();
  const intent = `${location.pathname}${location.search}`;

  console.log(`ProtectedShell('${intent}'): Render. User:`, user);

  useEffect(() => {
    console.log(`ProtectedShell('${intent}'): useEffect triggered. User:`, user);
    if (!user) {
      console.log(`ProtectedShell('${intent}'): No user, triggering auth intercept.`);
      triggerAuthIntercept(
        message || 'Sign in to continue using this HealthEase feature. You can also open the fully populated demo patient workspace.',
        intent
      );
    }
  }, [user, message, intent, triggerAuthIntercept]);

  if (user) {
    console.log(`ProtectedShell('${intent}'): User exists, rendering children.`);
    return <SidebarLayout>{children}</SidebarLayout>;
  }

  console.log(`ProtectedShell('${intent}'): No user, returning null.`);
  return null;
};

function AppContent() {
  const { user, loading } = useContext(AuthContext);

  console.log('AppContent: Render. Loading:', loading, 'User:', user);

  if (loading) {
    console.log('AppContent: Auth loading, rendering spinner.');
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  console.log('AppContent: Auth loaded, rendering Routes.');

  return (
    <Routes>
      {/* Auth Pages - No Sidebar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/doctor/register" element={<DoctorRegister />} />

      {/* Landing Page mapped to root - accessible to all */}
      <Route path="/" element={<Landing />} />

      {/* Public Feature Preview Routes (Unauthenticated Simulation Layers) */}
      <Route
        path="/features"
        element={<FeaturesIndex />}
      />
      <Route
        path="/features/ocr"
        element={<PublicFeatureShell title="Prescription OCR Simulator" description="Upload, extract, and structure handwritten prescription scripts instantly using our vision intelligence models." />}
      />
      <Route
        path="/features/telemedicine"
        element={<PublicFeatureShell title="Clinical Consultation Preview" description="Real-time telehealth room with high-fidelity video feeds, chat handshakes, and virtual prescription builders." />}
      />
      <Route
        path="/features/tracker"
        element={<PublicFeatureShell title="Medication Inventory & Adherence" description="Manage drug doses, log schedule compliance streaks, and coordinate inventory count depletion indicators." />}
      />
      <Route
        path="/features/vitals"
        element={<PublicFeatureShell title="Biometric Telemetry Charts" description="Interactive, real-time visualization of BP, blood sugar, heart rate, and biometric sensor sync dashboards." />}
      />
      <Route
        path="/features/rewards"
        element={<PublicFeatureShell title="Patient Engagement & Rewards" description="Track wellness streaks, log positive vital metrics, and unlock gamified health achievements." />}
      />
      <Route
        path="/features/symptom-checker"
        element={<PublicFeatureShell title="Clinical Triage Simulator" description="Input symptoms to evaluate triage color tiers (Red/Yellow/Green) and initial clinical next-step guidance." />}
      />
      <Route
        path="/features/dr-ai"
        element={<PublicFeatureShell title="Conversational Health Assistant Showcase" description="Consult our floating medical chat assistant, aware of profile history, allergies, and scheduled active prescriptions." />}
      />
      <Route
        path="/features/reports"
        element={<PublicFeatureShell title="Clinical Data PDF Export" description="Generate and download print-ready, high-fidelity PDF medical dossiers for primary care physicians." />}
      />
      <Route
        path="/how-it-works"
        element={<PublicFeatureShell title="Operational Pipeline View" description="Step-by-step documentation detailing how data traverses client scanners, FastAPI OCR parser nodes, and Mongoose collections." />}
      />
      <Route
        path="/for-doctors"
        element={<PublicFeatureShell title="Verified Clinician Portal" description="Comprehensive medical review interface built specifically for verified doctors, queue managers, and consulting specialists." />}
      />

      {/* Protected Routes - With Sidebar */}
      <Route
        path="/dashboard"
        element={<ProtectedShell><Dashboard /></ProtectedShell>}
      />
      <Route
        path="/upload"
        element={<ProtectedShell message="Authentication required to scan and parse prescriptions. Sign in or view the demo patient to test the OCR pipeline."><UploadPrescription /></ProtectedShell>}
      />
      <Route
        path="/prescriptions"
        element={<ProtectedShell><PrescriptionList /></ProtectedShell>}
      />
      <Route
        path="/profile"
        element={<ProtectedShell><PatientProfile /></ProtectedShell>}
      />
      <Route
        path="/dashboard/analytics"
        element={<ProtectedShell><AnalyticsDashboard /></ProtectedShell>}
      />
      <Route
        path="/interactions"
        element={<ProtectedShell><DrugInteractions /></ProtectedShell>}
      />
      <Route
        path="/doctors"
        element={<ProtectedShell><DoctorDirectory /></ProtectedShell>}
      />
      <Route
        path="/consultations/my"
        element={<ProtectedShell><MyConsultations /></ProtectedShell>}
      />
      <Route
        path="/timeline"
        element={<ProtectedShell><CareTimeline /></ProtectedShell>}
      />
      <Route
        path="/medicine-tracker"
        element={<ProtectedShell message="Sign in to add medicines or mark doses taken and skipped. The demo patient includes seeded adherence history."><MedicineTracker /></ProtectedShell>}
      />
      <Route
        path="/medicine-history"
        element={<ProtectedShell><ReminderHistory /></ProtectedShell>}
      />
      <Route
        path="/vitals"
        element={<ProtectedShell message="Sign in to view or enter account-linked vitals. The demo patient includes six weeks of sample readings."><VitalsDashboard /></ProtectedShell>}
      />
      <Route
        path="/symptom-checker"
        element={<ProtectedShell><SymptomChecker /></ProtectedShell>}
      />
      <Route
        path="/doctor/dashboard"
        element={<ProtectedShell message="Doctor dashboards require an authenticated clinical account."><DoctorDashboard /></ProtectedShell>}
      />
      <Route
        path="/consultation/:id"
        element={<ProtectedShell message="Sign in to start or join the consultation room."><ConsultationRoom /></ProtectedShell>}
      />
      <Route
        path="/consultation/:id/notes"
        element={<ProtectedShell><DoctorConsultationNotes /></ProtectedShell>}
      />
      <Route
        path="/notifications"
        element={<ProtectedShell><Notifications /></ProtectedShell>}
      />
      <Route
        path="/health-score"
        element={<ProtectedShell><HealthScore /></ProtectedShell>}
      />

      {/* New SaaS Portfolio Routes */}
      <Route
        path="/assistant"
        element={<ProtectedShell message="Sign in to send messages to Dr. AI with your prescription and vitals context."><HealthAssistant /></ProtectedShell>}
      />
      <Route
        path="/exports"
        element={<ProtectedShell><ExportEngine /></ProtectedShell>}
      />
      <Route
        path="/admin/dashboard"
        element={<ProtectedShell message="Admin dashboards require an authenticated admin session."><AdminDashboard /></ProtectedShell>}
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
                <GuestProvider>
                  <Router basename={import.meta.env.BASE_URL}>
                    <AppContent />
                  </Router>
                </GuestProvider>
              </AuthProvider>
            </WebSocketProvider>
          </NotificationProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
