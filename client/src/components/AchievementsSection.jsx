import React from 'react';

function IconRocket(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 14c4.5-1 7.5-4 9-9 3.5 1.5 6 5 5 9-5 1.5-8 4.5-9 9-4-1-6.5-4.5-5-9Z" />
      <path d="M9 15l-4 4" />
      <path d="M13 11a1 1 0 1 0 0.01 0" />
    </svg>
  );
}

function IconDevices(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3.5 6.5A2.5 2.5 0 0 1 6 4h10a2.5 2.5 0 0 1 2.5 2.5V13A2.5 2.5 0 0 1 16 15.5H6A2.5 2.5 0 0 1 3.5 13V6.5Z" />
      <path d="M8 19.5h6" />
      <path d="M12 15.5v4" />
      <path d="M20 8.25A2.25 2.25 0 0 1 22.25 10.5v7A2.5 2.5 0 0 1 19.75 20H18" />
    </svg>
  );
}

function IconDashboard(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4.5 4.5h7v7h-7z" />
      <path d="M12.5 4.5h7v4.5h-7z" />
      <path d="M12.5 10.5h7v9h-7z" />
      <path d="M4.5 12.5h7v7h-7z" />
      <path d="M17.5 9.5a2.25 2.25 0 1 1 0.01 0" />
      <path d="M16.25 8.75a3.5 3.5 0 0 0-2.25-.8" />
    </svg>
  );
}

const ACHIEVEMENTS = [
  {
    icon: IconRocket,
    textLabel: 'Current Status:',
    text: 'We have successfully reached our 40% completion milestone, transitioning from planning to active execution.',
  },
  {
    icon: IconDevices,
    textLabel: 'Responsive Design:',
    text: 'Frontend fully built using React.js with large, accessible buttons.',
  },
  {
    icon: IconDashboard,
    textLabel: 'Smart Dashboard & Profiles:',
    text: 'Unified view for tracking medicines and interface created to manage multiple family members.',
  },
];

export default function AchievementsSection() {
  return (
    <section
      aria-labelledby="achievements-title"
      className="w-full bg-[#111827] text-white py-20"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <h1
          id="achievements-title"
          className="text-4xl sm:text-5xl font-medium tracking-tight text-white"
        >
          What We Have Achieved
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.textLabel}
                className="flex flex-col items-start rounded-xl bg-[#1f2937] p-6 ring-1 ring-white/10"
              >
                <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
                  <Icon className="h-7 w-7 text-primary-200" />
                </div>

                <p className="mt-4 text-lg leading-relaxed text-gray-100">
                  <span className="font-semibold text-white">{item.textLabel}</span>{' '}
                  <span className="text-gray-200">{item.text}</span>
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

