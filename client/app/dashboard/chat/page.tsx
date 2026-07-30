import { AIChatInterface } from '@/components/AIChatInterface';

export const metadata = {
  title: 'AI Assistant | HealthEase',
  description: 'Chat with your secure, context-aware AI medical assistant',
};

export default function ChatPage() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Medical AI Assistant</h1>
        <p className="text-slate-500 mt-2">
          Your AI assistant is context-aware. It has securely read your profile to provide personalized guidance.
        </p>
      </div>

      <div className="mt-8">
        <AIChatInterface />
      </div>
    </div>
  );
}
