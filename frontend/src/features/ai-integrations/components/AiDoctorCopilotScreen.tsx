import React, { useState } from 'react';
import {
  Send,
  Stethoscope,
  ShieldCheck,
  CheckSquare,
  Loader2,
  Layers,
  BookOpen,
  ChevronLeft
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { AiContextInspectorModal } from '@/features/ai/components/AiContextInspectorModal';
import { AiEvidenceDrawer } from './common/AiEvidenceDrawer';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  citations?: string[];
  modelVersion?: string;
  latencyMs?: number;
  safetyStatus?: string;
  timestamp?: string;
}

interface AiDoctorCopilotScreenProps {
  patientId?: string;
  patientName?: string;
  onBack?: () => void;
}

export const AiDoctorCopilotScreen: React.FC<AiDoctorCopilotScreenProps> = ({
  patientId,
  patientName = 'Resident',
  onBack,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'Ask AI' | 'Differential Dx' | 'Treatment Options' | 'Guidelines'>('Ask AI');
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'ai',
      text: `Hello Doctor. I am connected to the ConnectCare Clinical Intelligence Pipeline for ${patientName}. Ask clinical diagnostic questions, differential exploration, or order synthesis. All inquiries enforce minimum-necessary PHI safety guardrails.`,
      modelVersion: 'gpt-4o',
      safetyStatus: 'Approved',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    `What are the most likely causes of ${patientName}'s recent vital changes?`,
    `Review current medications for potential renal dose adjustments.`,
    `Draft a clinical follow-up assessment for cardiology consultation.`,
    `Evaluate discharge readiness against inpatient criteria.`
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await api.postAiDoctorCopilot({
        patientId: patientId || undefined,
        promptQuery: query,
        targetRole: 'Doctor',
        category: activeTab
      });

      const data = res?.data ?? res;

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data?.responseText || 'No response returned from AI clinical orchestration.',
        citations: data?.citations || [],
        modelVersion: data?.modelVersion || 'gpt-4o',
        latencyMs: data?.latencyMs,
        safetyStatus: data?.safetyStatus || 'Approved',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Doctor Copilot error:', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Unable to generate clinical response: ${err.message || 'AI service unavailable.'}. No fabricated information is returned under ConnectCare clinical safety policy.`,
        safetyStatus: 'Service Error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreateTaskFromAi = async (msgText: string) => {
    if (!patientId) {
      toast.info('Please select a resident to create a linked task.');
      return;
    }

    try {
      await api.createTask({
        patientId: patientId,
        title: `[Copilot Action] Clinical follow-up for ${patientName}`,
        description: msgText.slice(0, 300),
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        assignedRole: 'Doctor',
        status: 'Pending'
      });
      toast.success('Task created in ConnectCare workflow from Doctor Copilot recommendation.');
    } catch (err: any) {
      toast.error(`Failed to create task: ${err.message}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer mr-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
          <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-indigo-600" />
            <span>AI Doctor Copilot — {patientName}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {patientId && (
            <button
              onClick={() => setShowContextModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>Context</span>
            </button>
          )}
          <button
            onClick={() => setShowEvidenceDrawer(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-indigo-600" />
            <span>Evidence</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-1 overflow-x-auto bg-slate-50/30">
        {(['Ask AI', 'Differential Dx', 'Treatment Options', 'Guidelines'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Suggested:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isTyping}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-[11px] font-medium whitespace-nowrap shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Workspace Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 min-h-[380px]">
        {/* Messages List */}
        <div className="space-y-4 overflow-y-auto max-h-[420px] pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col space-y-1.5 ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400 font-semibold">
                <span>{msg.sender === 'user' ? 'Attending Physician' : 'ConnectCare AI Doctor Copilot'}</span>
                <span>• {msg.timestamp}</span>
                {msg.latencyMs && <span>({msg.latencyMs} ms)</span>}
              </div>

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-xs rounded-br-xs'
                    : msg.safetyStatus === 'Service Error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-bl-xs'
                    : 'bg-slate-50 border border-slate-200/90 text-slate-800 shadow-2xs rounded-bl-xs space-y-2.5'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Authoritative Citations
                    </span>
                    <ul className="space-y-0.5 text-[11px] text-indigo-900 font-medium">
                      {msg.citations.map((c, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="w-1 h-1 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.sender === 'ai' && msg.safetyStatus !== 'Service Error' && (
                  <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Safety Guardrails Enforced</span>
                    </span>

                    <button
                      onClick={() => handleCreateTaskFromAi(msg.text)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-700 rounded-md font-bold shadow-2xs transition cursor-pointer"
                    >
                      <CheckSquare className="w-3 h-3" />
                      <span>Create Task from Recommendation</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 w-fit text-xs text-slate-500 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Orchestrating clinical response with real patient context...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask Doctor AI Copilot about ${patientName}...`}
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isTyping}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            {isTyping ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {patientId && (
        <AiContextInspectorModal
          isOpen={showContextModal}
          patientId={patientId}
          onClose={() => setShowContextModal(false)}
        />
      )}

      <AiEvidenceDrawer
        isOpen={showEvidenceDrawer}
        onClose={() => setShowEvidenceDrawer(false)}
        patientId={patientId}
        workflowName="Doctor AI Copilot"
      />
    </div>
  );
};

export default AiDoctorCopilotScreen;
