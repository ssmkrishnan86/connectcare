import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  ArrowLeft,
  Settings,
  Sparkles,
  Send,
  Paperclip,
  Mic,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ChevronDown,
  FileText,
  HeartPulse,
  Pill,
  Activity
} from 'lucide-react';
import { api } from '@/lib/api';

export const DoctorAiAssistantPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([
    {
      sender: 'user',
      time: '10:30 AM',
      text: 'Summarize Robert Johnson\'s health status and recent concerns.'
    },
    {
      sender: 'ai',
      time: '10:30 AM',
      sourcesCount: 4,
      text: `**Patient Summary**
Robert Johnson is a 68-year-old male with a history of hypertension, type 2 diabetes mellitus, and hyperlipidemia. He is under regular follow-up for cardiovascular risk management.

**Recent Concerns**
• Blood pressure has been slightly elevated in recent visits (avg 146/88 mmHg).
• HbA1c improved to 7.2% (Apr 28, 2024) from 7.8%.
• Reports occasional chest discomfort on exertion.
• Mild ankle swelling noted in last visit.

**Current Medications**
• Lisinopril 10 mg once daily
• Metformin 500 mg twice daily
• Atorvastatin 20 mg once daily
• Aspirin 81 mg once daily

**Allergies**
• No known drug allergies`
    },
    {
      sender: 'user',
      time: '10:31 AM',
      text: 'Any potential drug interactions with his current medications?'
    },
    {
      sender: 'ai',
      time: '10:31 AM',
      sourcesCount: 3,
      text: `No major drug interactions found among current medications. However, consider the following:

• **Aspirin** may increase the risk of bleeding if taken with NSAIDs.
• **Atorvastatin** may interact with certain antibiotics (e.g., clarithromycin) or antifungals.
• **Monitor kidney function** periodically due to Metformin and Lisinopril combination.

*This information is for reference only. Please use clinical judgment.*`
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally fetch past AI conversations from backend
  }, []);

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg = {
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: promptText
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    api.postDoctorAiAssistant({
      doctorName: 'Dr. Sarah Wilson',
      patientName: 'Robert Johnson',
      patientIdCode: 'PT-10001',
      promptQuery: promptText,
      category: 'General Clinical'
    })
      .then((res: any) => {
        if (res?.data?.aiResponse) {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sourcesCount: 3,
              text: res.data.aiResponse
            }
          ]);
        }
      })
      .catch((err) => {
        console.error('AI Error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800">
      
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-sm text-slate-700 shrink-0">
            RJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">Robert Johnson</h1>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                • Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              PT-10001 • 68 years, Male • May 12, 1956 (DOB) • O+
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Patient Overview
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: AI Assistant Chat Workspace */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Title & Settings */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">AI Assistant</h2>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md uppercase">Beta</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Your intelligent clinical assistant. Ask questions, get insights, and create notes.
              </p>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">
              <Settings className="h-3.5 w-3.5" />
              Assistant Settings
            </button>
          </div>

          {/* Suggested Prompts Grid */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Suggested Prompts</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { icon: FileText, text: 'Summarize patient history' },
                { icon: Activity, text: 'Recent lab abnormalities' },
                { icon: Pill, text: 'Drug interactions' },
                { icon: HeartPulse, text: 'Care plan suggestions' },
                { icon: FileText, text: 'Draft SOAP note' },
                { icon: HelpCircle, text: 'Clinical guidelines' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(p.text)}
                  className="flex items-center gap-2 p-2.5 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 hover:text-indigo-800 text-left transition-all cursor-pointer"
                >
                  <p.icon className="h-4 w-4 shrink-0 text-indigo-600" />
                  <span>{p.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Stream History */}
          <div className="space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'user' ? (
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-950 p-4 rounded-2xl max-w-xl text-xs font-semibold shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] text-indigo-400 mb-1">
                      <span>You</span>
                      <span>{m.time}</span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 text-slate-800 p-5 rounded-2xl max-w-2xl text-xs space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Sparkles className="h-3 w-3" />
                        </div>
                        <span className="font-bold text-slate-900">AI Assistant</span>
                      </div>
                      <span>{m.time}</span>
                    </div>

                    <div className="prose prose-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                      {m.text}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-400">
                      <div className="flex items-center gap-3">
                        <button className="hover:text-indigo-600 transition-colors"><ThumbsUp className="h-3.5 w-3.5" /></button>
                        <button className="hover:text-rose-600 transition-colors"><ThumbsDown className="h-3.5 w-3.5" /></button>
                        <button className="hover:text-indigo-600 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 cursor-pointer">
                        <span>Sources ({m.sourcesCount || 3})</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600 animate-spin" />
                  <span>Analyzing clinical data...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              'Create SOAP Note',
              'Suggest Care Plan',
              'Order Lab Tests',
              'Patient Education'
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(btn)}
                className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold rounded-xl whitespace-nowrap shadow-2xs transition-colors"
              >
                + {btn}
              </button>
            ))}
          </div>

          {/* Prompt Input Field */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt(query)}
                placeholder="Ask anything about this patient..."
                className="w-full pl-4 pr-24 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60">
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleSendPrompt(query)}
                  className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center font-medium">
              AI-generated content may be inaccurate. Please verify important information.
            </p>
          </div>

        </div>

        {/* Right 4 Cols: Patient Snapshot Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Patient Snapshot</h3>
              <button className="text-xs font-bold text-indigo-600 hover:underline">View Full</button>
            </div>

            {/* Visits & Appts */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold">Last Visit</p>
                <p className="font-bold text-slate-900 mt-0.5">May 15, 2024</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold">Next Appointment</p>
                <p className="font-bold text-indigo-600 mt-0.5">May 22, 2024</p>
                <p className="text-[10px] text-slate-500 font-medium">02:30 PM</p>
              </div>
            </div>

            {/* Diagnoses Tags */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">Diagnoses</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold rounded-lg">
                  Hypertension
                </span>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold rounded-lg">
                  Type 2 Diabetes Mellitus
                </span>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold rounded-lg">
                  Hyperlipidemia
                </span>
              </div>
            </div>

            {/* Vitals (Last 3) */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">Vitals (Last 3)</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">BP</span>
                  <span className="font-bold text-slate-900">146/88 mmHg</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Pulse</span>
                  <span className="font-bold text-slate-900">78 bpm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Weight</span>
                  <span className="font-bold text-slate-900">78 kg</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Temp</span>
                  <span className="font-bold text-slate-900">98.2 °F</span>
                </div>
              </div>
            </div>

            {/* Recent Labs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">Recent Labs</p>
                <button className="text-[10px] font-bold text-indigo-600">View All</button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">HbA1c</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">7.2%</span>
                    <span className="text-[9px] text-slate-400 block">Apr 28, 2024</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Fasting Glucose</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">128 mg/dL</span>
                    <span className="text-[9px] text-slate-400 block">Apr 28, 2024</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">LDL Cholesterol</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">92 mg/dL</span>
                    <span className="text-[9px] text-slate-400 block">Apr 20, 2024</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Creatinine</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">1.0 mg/dL</span>
                    <span className="text-[9px] text-slate-400 block">Apr 20, 2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Medications */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">Active Medications</p>
                <button className="text-[10px] font-bold text-indigo-600">View All</button>
              </div>
              <div className="space-y-2 text-xs font-medium text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Lisinopril 10 mg</span>
                  <span className="font-bold text-slate-900">OD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Metformin 500 mg</span>
                  <span className="font-bold text-slate-900">BD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Atorvastatin 20 mg</span>
                  <span className="font-bold text-slate-900">OD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Aspirin 81 mg</span>
                  <span className="font-bold text-slate-900">OD</span>
                </div>
              </div>
            </div>

            {/* Recent Documents */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">Recent Documents</p>
                <button className="text-[10px] font-bold text-indigo-600">View All</button>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Lab Report', date: 'Apr 28, 2024' },
                  { name: 'Echocardiogram Report', date: 'Apr 20, 2024' },
                  { name: 'Consultation Note', date: 'May 15, 2024' },
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">{doc.name}</p>
                      <p className="text-[9px] text-slate-400">{doc.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
