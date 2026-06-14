import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User as UserIcon,
  Brain,
  Activity,
  Calendar,
  Pill,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { AuthContext } from '../context/AuthContext';

export default function HealthAssistant() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello ${user?.name || 'there'}! I am your HealthEase AI Assistant. I can analyze your active prescriptions, monitor daily vitals timelines, summarize medicine compliance scores, or answer health questions. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const suggestedPrompts = [
    { text: 'Summarize my health history', icon: Calendar },
    { text: 'Which medicines am I currently taking?', icon: Pill },
    { text: 'Show my blood pressure trend', icon: Activity },
    { text: 'Analyze my drug adherence compliance', icon: TrendingUp }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Generate responsive smart answer based on queries
    setTimeout(() => {
      let aiResponseText = '';
      let aiElement = null;

      const lowerText = text.toLowerCase();

      if (lowerText.includes('history') || lowerText.includes('summarize')) {
        aiResponseText = `Based on your digital records, here is your HealthEase clinical summary:`;
        aiElement = (
          <div className="mt-3 space-y-3">
            <div className="border border-border p-3.5 rounded-custom bg-slate-50 dark:bg-slate-900/30">
              <p className="font-bold text-xs text-text-primary mb-2 flex items-center gap-1.5">
                <FileText size={14} className="text-primary" /> Active Diagnoses & Logs
              </p>
              <ul className="text-xs text-text-secondary space-y-1.5 list-disc pl-4">
                <li>Primary: Hypertension (Mild) - monitored via weekly Vitals Logs.</li>
                <li>Secondary: Seasonal allergy (Dust/Pollen) - treated as-needed.</li>
                <li>Adherence: 94% Medication Compliance ratio over the past 30 days.</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Badge variant="success">Active Plan</Badge>
              <Badge variant="secondary">Verified by Doctor</Badge>
            </div>
          </div>
        );
      } else if (lowerText.includes('medicine') || lowerText.includes('pill') || lowerText.includes('drug')) {
        aiResponseText = `You have 3 active medications configured in your tracker schedule:`;
        aiElement = (
          <div className="mt-3 space-y-2.5">
            {[
              { name: 'Metformin HCl 500mg', dosage: '1 Tablet', timing: 'Twice daily - After Meals', stock: '22 tablets remaining' },
              { name: 'Lisinopril 10mg', dosage: '1 Tablet', timing: 'Once daily - Morning', stock: '8 tablets remaining (Refill recommended)' },
              { name: 'Atorvastatin 20mg', dosage: '1 Tablet', timing: 'Once daily - Night', stock: '45 tablets remaining' }
            ].map((med, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-custom bg-white dark:bg-slate-900/50">
                <div>
                  <p className="font-bold text-xs text-text-primary">{med.name}</p>
                  <p className="text-[10px] text-text-secondary">{med.dosage} • {med.timing}</p>
                </div>
                <Badge variant={med.stock.includes('Refill') ? 'warning' : 'success'}>
                  {med.stock}
                </Badge>
              </div>
            ))}
          </div>
        );
      } else if (lowerText.includes('pressure') || lowerText.includes('blood') || lowerText.includes('trend') || lowerText.includes('vital')) {
        aiResponseText = `Here is your blood pressure trend overview for the last 7 logs:`;
        aiElement = (
          <div className="mt-3 p-4 border border-border rounded-custom bg-slate-50 dark:bg-slate-900/30 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold text-text-secondary">Average Reading</span>
              <span className="text-sm font-black text-primary">124/82 mmHg</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Highest Logged BP</span>
                <span className="font-bold text-danger">130/85 mmHg (June 10)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Lowest Logged BP</span>
                <span className="font-bold text-success">118/79 mmHg (June 14)</span>
              </div>
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed pt-1">
              💡 Assistant Note: Your diastolic reading remains stable under normal values. Ensure your Lisinopril medication schedule remains consistent.
            </p>
          </div>
        );
      } else {
        aiResponseText = `I have logged your question regarding: "${text}". I will run this request through the parsing core and reply with structured metrics shortly. Let me know if you would like me to compile a standard medical summary or show active drug interaction reports.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: aiResponseText,
          customElement: aiElement,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-4 font-sans max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between p-4 border border-border bg-white dark:bg-card rounded-custom">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Brain size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black text-text-primary tracking-tight">AI Health Assistant</h2>
            <p className="text-xs text-text-secondary">Interactive medical insights helper</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="animate-pulse">Active Context</Badge>
        </div>
      </div>

      {/* Messages Pane */}
      <div className="flex-1 bg-white dark:bg-card border border-border rounded-custom p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isAI = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isAI ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-text-primary'
              }`}>
                {isAI ? <Bot size={16} /> : <UserIcon size={16} />}
              </div>

              {/* Bubble Body */}
              <div className="space-y-1">
                <div className={`p-4 rounded-custom text-sm ${
                  isAI 
                    ? 'bg-slate-50 dark:bg-slate-900/50 text-text-primary border border-border' 
                    : 'bg-primary text-white font-medium shadow-md shadow-primary/10'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.customElement && msg.customElement}
                </div>
                <p className={`text-[10px] text-text-secondary ${isAI ? 'text-left' : 'text-right'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-text-primary border border-border rounded-custom text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-text-secondary/60 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-text-secondary/60 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-text-secondary/60 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestedPrompts.map((prompt, idx) => {
          const Icon = prompt.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(prompt.text)}
              className="flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-card border border-border rounded-custom text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-150 text-xs font-bold text-text-secondary hover:text-text-primary group"
            >
              <Icon size={14} className="text-primary group-hover:scale-110 transition-transform" />
              <span>{prompt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Input panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputValue);
        }}
        className="flex gap-3"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask AI Assistant about prescriptions, doses, or BP logs..."
          className="flex-1 px-4 py-3.5 bg-white dark:bg-card border border-border rounded-custom text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
        />
        <Button type="submit" className="px-5 rounded-custom flex items-center justify-center">
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
