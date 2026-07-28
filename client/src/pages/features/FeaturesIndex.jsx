import { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  FileText,
  Gift,
  HeartPulse,
  PillBottle,
  ScanLine,
  Stethoscope,
  TrafficCone,
  Video
} from 'lucide-react';
import { GuestContext } from '../../context/GuestContext';

const glassCardClass =
  'bg-white/[0.01] backdrop-blur-[4px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden before:absolute before:inset-0 before:rounded-inherit before:p-[1.4px] before:bg-gradient-to-b before:from-white/45 before:via-white/15 before:to-white/45 before:pointer-events-none';

const features = [
  {
    title: 'Prescription OCR',
    path: '/features/ocr',
    livePath: '/upload',
    focus: 'Extract deep medical semantics from physical prescriptions instantly.',
    stat: '94%',
    tag: 'OCR semantic confidence',
    icon: ScanLine
  },
  {
    title: 'Telemedicine Consults',
    path: '/features/telemedicine',
    livePath: '/consultations/my',
    focus: 'Live clinical consultation rooms integrated with real-time vitals streams.',
    stat: 'Live',
    tag: 'clinical room telemetry',
    icon: Video
  },
  {
    title: 'Medicine Tracker',
    path: '/features/tracker',
    livePath: '/medicine-tracker',
    focus: 'Dose compliance maps, active inventory telemetry, and automated refills.',
    stat: '26/28',
    tag: 'doses completed',
    icon: PillBottle
  },
  {
    title: 'Vitals Dashboard',
    path: '/features/vitals',
    livePath: '/vitals',
    focus: 'Biometric trend visualization engines monitoring BP, SpO2, and glucose.',
    stat: '6 wk',
    tag: 'biometric trend depth',
    icon: HeartPulse
  },
  {
    title: 'Gamification & Rewards',
    path: '/features/rewards',
    livePath: '/health-score',
    focus: 'Patient adherence streaks, health milestone tracking, and engagement metrics.',
    stat: '9 day',
    tag: 'active streak model',
    icon: Gift
  },
  {
    title: 'Symptom Checker',
    path: '/features/symptom-checker',
    livePath: '/symptom-checker',
    focus: 'Clinical triage system mapping urgency protocols (Red/Yellow/Green).',
    stat: 'R/Y/G',
    tag: 'urgency protocol lanes',
    icon: TrafficCone
  },
  {
    title: 'Dr. AI Health Assistant',
    path: '/features/dr-ai',
    livePath: '/assistant',
    focus: 'Context-aware conversational intelligence mapped directly to your medication history.',
    stat: 'Rx AI',
    tag: 'context-aware responses',
    icon: Bot
  },
  {
    title: 'Clinical Report Engine',
    path: '/features/reports',
    livePath: '/exports',
    focus: 'Structured medical log PDF generation for external physician review.',
    stat: 'PDF',
    tag: 'physician-ready export',
    icon: FileText
  },
  {
    title: 'Clinician Portal Portal',
    path: '/for-doctors',
    livePath: '/doctor/dashboard',
    focus: 'Verified provider command interfaces built for patient panel coordination.',
    stat: 'MD',
    tag: 'provider command layer',
    icon: Stethoscope
  }
];

const FeaturesIndex = () => {
  const { triggerAuthIntercept } = useContext(GuestContext);

  const handleLiveVersion = (event, feature) => {
    event.preventDefault();
    triggerAuthIntercept(
      `${feature.title} uses live account data. Sign in or create an account to open the live API version without losing this feature tour.`,
      feature.livePath
    );
  };

  return (
    <main className="min-h-screen bg-[#0A0A0B] px-5 py-16 text-white sm:px-8 md:px-12 lg:px-20">
      <section className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-4xl text-center animate-fade-in">
          <p className="font-inter text-xs font-medium uppercase tracking-wider text-cyan-300/80">
            Guest Tour Mode
          </p>
          <h1 className="mt-4 font-dmsans text-5xl font-normal tracking-[-0.05em] text-white sm:text-6xl md:text-7xl">
            Explore the clinical workspace.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-inter text-sm font-light leading-relaxed tracking-[-0.03em] text-white/60 sm:text-base">
            Browse every HealthEase module through simulation routes, then unlock authenticated workflows when you are ready to use live patient data.
          </p>
        </div>

        <div className="rounded-full bg-white/[0.02] border border-white/10 px-6 py-2 flex items-center gap-3 max-w-2xl mx-auto mb-12 animate-fade-in">
          <span className="bg-cyan-400 animate-pulse w-2 h-2 rounded-full flex-shrink-0" />
          <span className="text-white/70 font-inter text-xs tracking-wider uppercase font-medium">
            Viewing clinical feature simulation space. Select any workspace module below to experience live guest telemetry.
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className={`${glassCardClass} rounded-3xl p-6 animate-fade-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative z-10 flex min-h-[310px] flex-col">
                  <div className="mb-8 flex items-start justify-between gap-5">
                    <div>
                      <h2 className="font-dmsans text-2xl font-normal tracking-[-0.05em] text-white">
                        {feature.title}
                      </h2>
                      <p className="mt-3 font-inter text-sm font-light leading-relaxed tracking-[-0.03em] text-white/55">
                        {feature.focus}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <p className="font-dmsans text-3xl font-medium tracking-[-0.05em] text-white">
                      {feature.stat}
                    </p>
                    <p className="mt-1 font-inter text-xs tracking-normal text-white/50">
                      {feature.tag}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <Link
                        to={feature.path}
                        className="rounded-full border border-white/10 px-5 py-2.5 font-inter text-xs font-medium tracking-[-0.03em] text-white/70 transition-all duration-300 hover:border-cyan-400/50 hover:text-white"
                      >
                        Launch Simulation Workspace
                      </Link>
                      <a
                        href={feature.livePath}
                        onClick={(event) => handleLiveVersion(event, feature)}
                        className="font-inter text-xs font-medium tracking-[-0.03em] text-white/40 underline underline-offset-4 transition-colors duration-300 hover:text-cyan-300"
                      >
                        See Live API Version
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default FeaturesIndex;
