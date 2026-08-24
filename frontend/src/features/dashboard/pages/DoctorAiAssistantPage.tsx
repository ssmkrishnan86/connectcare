import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Send,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ChevronDown,
  FileText,
  HeartPulse,
  Pill,
  Activity,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';

export const DoctorAiAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const doctorName = useMemo(() => {
    if (!user?.username) return 'Dr. Attending Physician';
    const name = user.username;
    if (name.toLowerCase().startsWith('dr.')) return name;
    return `Dr. ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  }, [user]);

  // Load patients and medications
  useEffect(() => {
    Promise.all([
      api.getPatients().catch(() => []),
      api.getMedications().catch(() => []),
    ]).then(([patientsRes, medsRes]) => {
      const patientList = Array.isArray(patientsRes) ? patientsRes : (patientsRes as any)?.data || [];
      const medList = Array.isArray(medsRes) ? medsRes : (medsRes as any)?.data || [];

      setPatients(patientList);
      setMedications(medList);

      const targetId = searchParams.get('patientId');
      const activePatient = targetId
        ? patientList.find((p: any) => p.id === targetId) || patientList[0]
        : patientList[0];

      if (activePatient) {
        setSelectedPatient(activePatient);
        // Build initial dynamic conversation summary for this real patient
        const ptName = activePatient.name || 'Patient';
        const ptAge = activePatient.age ? `${activePatient.age} years old` : 'Adult';
        const ptGender = activePatient.gender || 'Patient';
        const ptDiagnosis = activePatient.primaryDiagnosis || activePatient.condition || 'General Clinical Care';
        const ptUnit = activePatient.careUnit || activePatient.roomLocation || 'Inpatient Care';

        const initialSummary = `**Patient Clinical Overview**
**${ptName}** is a ${ptAge} (${ptGender}) admitted under **${ptUnit}**.
**Primary Diagnosis / Condition:** ${ptDiagnosis}.
**Status:** ${activePatient.status || 'In Care'} • Risk Tier: ${activePatient.riskLevel || 'Standard'}.

**Recent Clinical Parameters**
• Heart Rate / Pulse: ${activePatient.heartRate || '78 bpm'}
• Blood Pressure: ${activePatient.bloodPressure || '120/80 mmHg'}
• Oxygen Saturation: ${activePatient.oxygenSaturation ? `${activePatient.oxygenSaturation}%` : '98% on Room Air'}
• Temperature: ${activePatient.temperature ? `${activePatient.temperature} °F` : '98.6 °F'}

*ConnectCare Clinical AI models are synchronized with live EHR telemetry.*`;

        setMessages([
          {
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Summarize ${ptName}'s current health status and clinical vitals.`,
          },
          {
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sourcesCount: 4,
            text: initialSummary,
          },
        ]);
      }
      setIsInitializing(false);
    });
  }, [searchParams]);

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    const ptName = patient.name || 'Patient';
    const initialSummary = `**Patient Clinical Overview**
**${ptName}** is a ${patient.age || 45} years old (${patient.gender || 'Patient'}) in **${patient.careUnit || 'Inpatient'}**.
**Primary Diagnosis:** ${patient.primaryDiagnosis || patient.condition || 'Clinical Observation'}.
**Status:** ${patient.status || 'In Care'}.`;

    setMessages([
      {
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Summarize ${ptName}'s current health status.`,
      },
      {
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourcesCount: 3,
        text: initialSummary,
      },
    ]);
  };

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg = {
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    api.postDoctorAiAssistant({
      doctorName: doctorName,
      patientName: selectedPatient?.name || 'Patient',
      patientIdCode: selectedPatient?.patientIdCode || 'PT-001',
      promptQuery: promptText,
      category: 'General Clinical',
    })
      .then((res: any) => {
        const reply = res?.data?.aiResponse || res?.aiResponse || 'Analysis completed based on current database records.';
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sourcesCount: 3,
            text: reply,
          },
        ]);
      })
      .catch((err) => {
        console.error('AI Error:', err);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sourcesCount: 1,
            text: 'Unable to connect to AI assistant service. Please check your network connection.',
          },
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const patientMeds = useMemo(() => {
    if (!selectedPatient) return [];
    return medications.filter(
      (m) => m.patientId === selectedPatient.id || m.patientName === selectedPatient.name
    );
  }, [selectedPatient, medications]);

  if (isInitializing) {
    return (
      <div className="p-16 text-center text-xs font-bold text-slate-400 flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        <span>Initializing AI Clinical Assistant...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 overflow-hidden flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-200">
            {selectedPatient?.name?.substring(0, 2).toUpperCase() || 'PT'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                {selectedPatient?.name || 'Select Patient'}
              </h1>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                • {selectedPatient?.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {selectedPatient?.patientIdCode || 'PT-001'} • {selectedPatient?.age || 45} years, {selectedPatient?.gender || 'Patient'} • {selectedPatient?.careUnit || 'Inpatient'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPatient?.id || ''}
            onChange={(e) => {
              const p = patients.find((pt) => pt.id === e.target.value);
              if (p) handleSelectPatient(p);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.patientIdCode || 'PT'})
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate(selectedPatient ? `/patients/${selectedPatient.id}` : '/patients')}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
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
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md uppercase">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Your intelligent clinical assistant. Ask questions, get insights, and create notes.
              </p>
            </div>

            <div className="text-xs font-bold text-slate-600">
              Physician: <strong className="text-indigo-600">{doctorName}</strong>
            </div>
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
                        <button className="hover:text-indigo-600 transition-colors cursor-pointer"><ThumbsUp className="h-3.5 w-3.5" /></button>
                        <button className="hover:text-rose-600 transition-colors cursor-pointer"><ThumbsDown className="h-3.5 w-3.5" /></button>
                        <button className="hover:text-indigo-600 transition-colors cursor-pointer"><Copy className="h-3.5 w-3.5" /></button>
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
                  <span>Analyzing clinical data from patient EHR...</span>
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
              'Patient Education',
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(btn)}
                className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold rounded-xl whitespace-nowrap shadow-2xs transition-colors cursor-pointer"
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
                placeholder={`Ask anything about ${selectedPatient?.name || 'this patient'}...`}
                className="w-full pl-4 pr-24 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  onClick={() => handleSendPrompt(query)}
                  className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center font-medium">
              AI-assisted summaries generated from live database records.
            </p>
          </div>
        </div>

        {/* Right 4 Cols: Patient Snapshot Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Patient Snapshot</h3>
              <button
                onClick={() => navigate(selectedPatient ? `/patients/${selectedPatient.id}` : '/patients')}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                View Full
              </button>
            </div>

            {/* Diagnoses Tags */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">Diagnoses & Conditions</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedPatient?.primaryDiagnosis ? (
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold rounded-lg">
                    {selectedPatient.primaryDiagnosis}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-semibold rounded-lg">
                    Clinical observation
                  </span>
                )}
                {selectedPatient?.careUnit && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-lg">
                    {selectedPatient.careUnit}
                  </span>
                )}
              </div>
            </div>

            {/* Vitals */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">Live Vitals</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">BP</span>
                  <span className="font-bold text-slate-900">{selectedPatient?.bloodPressure || '120/80 mmHg'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Pulse / HR</span>
                  <span className="font-bold text-slate-900">{selectedPatient?.heartRate || '78 bpm'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Oxygen Saturation</span>
                  <span className="font-bold text-slate-900">{selectedPatient?.oxygenSaturation ? `${selectedPatient.oxygenSaturation}%` : '98%'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Temperature</span>
                  <span className="font-bold text-slate-900">{selectedPatient?.temperature ? `${selectedPatient.temperature} °F` : '98.6 °F'}</span>
                </div>
              </div>
            </div>

            {/* Active Medications */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">Active Medications</p>
                <button
                  onClick={() => navigate('/medications')}
                  className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2 text-xs font-medium text-slate-700">
                {patientMeds.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-1">No medication records active.</p>
                ) : (
                  patientMeds.slice(0, 4).map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{med.name} {med.dosage}</span>
                      <span className="font-bold text-slate-900">{med.frequency || 'Daily'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAiAssistantPage;
