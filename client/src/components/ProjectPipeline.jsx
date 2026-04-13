import React, { useMemo, useRef, useState } from 'react';

function IconBrainGear(props) {
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
      <path d="M12 4.25a3.25 3.25 0 0 1 3.22 2.82 3.2 3.2 0 0 1 2.82 3.17 3.2 3.2 0 0 1-1.05 2.39 3.2 3.2 0 0 1-4.99 2.34 3.2 3.2 0 0 1-4.99-2.34 3.2 3.2 0 0 1-1.05-2.39A3.2 3.2 0 0 1 8.78 7.07 3.25 3.25 0 0 1 12 4.25Z" />
      <path d="M12 8.5v3" />
      <path d="M10.25 10.25h3.5" />
      <path d="M18.6 14.2l.8 1.35-1.15 1.15-1.35-.8-.65.38-.35 1.52h-1.62l-.35-1.52-.65-.38-1.35.8-1.15-1.15.8-1.35-.38-.65-1.52-.35v-1.62l1.52-.35.38-.65-.8-1.35 1.15-1.15 1.35.8.65-.38.35-1.52h1.62l.35 1.52.65.38 1.35-.8 1.15 1.15-.8 1.35.38.65 1.52.35v1.62l-1.52.35-.38.65Z" />
      <path d="M15 12.5a1.5 1.5 0 1 0 0.01 0" />
    </svg>
  );
}

function IconMessage(props) {
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
      <path d="M4.5 6.75A3.75 3.75 0 0 1 8.25 3h7.5A3.75 3.75 0 0 1 19.5 6.75v6A3.75 3.75 0 0 1 15.75 16.5H10l-4.5 3v-3A3.75 3.75 0 0 1 4.5 12.75v-6Z" />
      <path d="M8.25 8.25h7.5" />
      <path d="M8.25 11.25h4.5" />
    </svg>
  );
}

function IconSpinner(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3.25a8.75 8.75 0 1 0 8.75 8.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PipelineCard({
  item,
  isActive,
  isLoading,
  onToggle,
  children,
}) {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onToggle}
        className={[
          'w-full text-left',
          'rounded-2xl border',
          'px-6 py-5 sm:px-8 sm:py-6',
          'flex items-center justify-between gap-6',
          'transition-colors',
          isActive
            ? 'bg-white border-gray-300'
            : 'bg-transparent border-gray-200 hover:bg-white/70',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F9FAFB]',
        ].join(' ')}
        aria-expanded={isActive}
      >
        <div className="flex items-start gap-5">
          <div className="mt-0.5 rounded-xl bg-white border border-gray-200 p-3 text-gray-900">
            <item.LeftIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <div className="text-gray-900 text-xl sm:text-2xl leading-tight">
              <strong className="font-semibold">{item.title}</strong>
            </div>
            <p className="mt-2 text-gray-700 text-base sm:text-lg leading-relaxed max-w-3xl">
              {item.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="sr-only">{isActive ? 'Close simulation' : 'Run simulation'}</span>
          <div
            className={[
              'rounded-xl border border-gray-200 bg-white',
              'p-3 text-gray-900',
              'transition-colors',
              isActive ? 'border-gray-300' : 'group-hover:border-gray-300',
            ].join(' ')}
            aria-hidden="true"
          >
            {isLoading ? (
              <IconSpinner className="h-6 w-6 animate-spin" />
            ) : (
              <item.RightIcon className="h-6 w-6" />
            )}
          </div>
        </div>
      </button>

      {isActive ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

function ChatMessage({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={['flex', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      <div
        className={[
          'max-w-[min(42rem,90%)] rounded-2xl px-4 py-3',
          isUser ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-800',
        ].join(' ')}
      >
        <p className="text-sm sm:text-base leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

function ProjectChatSimulation({ initialAssistantLine }) {
  const cannedAssistantResponses = useMemo(
    () => [
      initialAssistantLine,
      'I can help explain symptoms, medications, and when it might be appropriate to seek urgent care. What’s your question?',
      'Thanks for sharing. If symptoms are severe, worsening, or you’re unsure, it’s best to consult a clinician. Would you like general guidance or next-step suggestions?',
    ],
    [initialAssistantLine]
  );

  const [messages, setMessages] = useState(() => [
    { role: 'assistant', content: initialAssistantLine },
  ]);
  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const scrollRef = useRef(null);

  const send = async () => {
    const text = input.trim();
    if (!text || isReplying) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsReplying(true);

    const next =
      cannedAssistantResponses[Math.min(messages.length, cannedAssistantResponses.length - 1)];

    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content: next }]);
      setIsReplying(false);
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 550);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <p className="text-gray-900 font-semibold">Simulated Chat</p>
          <p className="text-gray-600 text-sm">Canned medical assistant responses for demo</p>
        </div>
        <div
          className={[
            'text-xs font-medium px-2.5 py-1 rounded-full',
            isReplying ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700',
          ].join(' ')}
        >
          {isReplying ? 'Responding…' : 'Ready'}
        </div>
      </div>

      <div className="px-6 py-5 space-y-3 max-h-[22rem] overflow-auto bg-[#F9FAFB]">
        {messages.map((m, idx) => (
          <ChatMessage key={`${m.role}-${idx}`} role={m.role} content={m.content} />
        ))}
        <div ref={scrollRef} />
      </div>

      <form
        className="px-6 py-4 border-t border-gray-200 flex items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label className="sr-only" htmlFor="pipeline-chat-input">
          Type your message
        </label>
        <input
          id="pipeline-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a health question to simulate…"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
        <button
          type="submit"
          disabled={!input.trim() || isReplying}
          className="rounded-xl bg-gray-900 text-white px-5 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default function ProjectPipeline() {
  const upcomingFeatures = useMemo(
    () => [
      {
        id: 'openai-chatbot',
        title: 'OpenAI Chatbot:',
        description:
          'Integrating the OpenAI API to activate a 24/7 Medical Assistant chat interface.',
        LeftIcon: IconBrainGear,
        RightIcon: IconMessage,
        assistantGreeting: 'Hello, how can I assist you with your health questions today?',
      },
    ],
    []
  );

  const [activeSimulation, setActiveSimulation] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const toggle = (id) => {
    if (loadingId) return;

    if (activeSimulation === id) {
      setActiveSimulation(null);
      return;
    }

    setLoadingId(id);
    window.setTimeout(() => {
      setActiveSimulation(id);
      setLoadingId(null);
    }, 500);
  };

  return (
    <section className="w-full bg-[#F9FAFB] text-[#1F2937] py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <h1 className="text-5xl sm:text-6xl font-medium tracking-tight">
          Steps Remaining
        </h1>

        <div className="mt-12 space-y-10">
          {upcomingFeatures.map((item) => {
            const isActive = activeSimulation === item.id;
            const isLoading = loadingId === item.id;
            return (
              <PipelineCard
                key={item.id}
                item={item}
                isActive={isActive}
                isLoading={isLoading}
                onToggle={() => toggle(item.id)}
              >
                <ProjectChatSimulation initialAssistantLine={item.assistantGreeting} />
              </PipelineCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

