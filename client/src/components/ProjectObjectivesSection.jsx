import React from 'react';

function IconStack(props) {
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
      <path d="M12 3l9 5-9 5-9-5 9-5Z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 16.5l9 4.5 9-4.5" />
    </svg>
  );
}

function IconBrain(props) {
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
      <path d="M8.5 6.5a3 3 0 0 1 5.7-1.2 3 3 0 0 1 3.3 4.4 3 3 0 0 1-1 5.8 3 3 0 0 1-5.7 1.2 3 3 0 0 1-3.3-4.4 3 3 0 0 1 1-5.8Z" />
      <path d="M10 8.5c.7.2 1.3.7 1.5 1.5" />
      <path d="M14 13.5c-.7-.2-1.3-.7-1.5-1.5" />
    </svg>
  );
}

function IconUsersLayout(props) {
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
      <path d="M4.5 5.5h9v6h-9z" />
      <path d="M4.5 13.5h9v5h-9z" />
      <path d="M16.5 7.25a2.25 2.25 0 1 1 0.01 0" />
      <path d="M14.75 18.5c.6-2.1 1.9-3.2 3.75-3.2s3.15 1.1 3.75 3.2" />
    </svg>
  );
}

function IconChat(props) {
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
      <path d="M4.5 6.5A3.5 3.5 0 0 1 8 3h8a3.5 3.5 0 0 1 3.5 3.5V14A3.5 3.5 0 0 1 16 17.5H10l-4.5 3v-3A3.5 3.5 0 0 1 4.5 14V6.5Z" />
      <path d="M8 9h8" />
      <path d="M8 12.5h5" />
    </svg>
  );
}

const OBJECTIVES = [
  {
    icon: IconStack,
    text:
      'Build a robust, scalable web application using MongoDB, Express.js, React.js, and Node.js.',
  },
  {
    icon: IconBrain,
    text:
      'Develop and train an AI model capable of identifying and predicting medicine names from handwritten notes.',
  },
  {
    icon: IconUsersLayout,
    text: 'Create a unified dashboard for family health management.',
  },
  {
    icon: IconChat,
    text: 'Integrate an intelligent chatbot to act as a 24/7 medical assistant.',
  },
];

export default function ProjectObjectivesSection() {
  return (
    <section
      aria-labelledby="project-objectives-title"
      className="w-full bg-[#111827] text-white py-20"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <h1
          id="project-objectives-title"
          className="text-4xl sm:text-5xl font-medium tracking-tight text-white"
        >
          Project Objectives
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-x-14 gap-y-10 md:grid-cols-2">
          {OBJECTIVES.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.text} className="flex items-start gap-5">
                <div className="mt-1 rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
                  <Icon className="h-6 w-6 text-primary-200" />
                </div>
                <p className="text-lg leading-relaxed text-gray-200">{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

