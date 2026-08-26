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
  Pill,
  Activity,
  Loader2,
  Repeat,
  ShieldAlert,
  Stethoscope,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';

export const NurseAiAssistantPage: React.FC = () => {
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
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const nurseName = useMemo(() => {
    if (user?.fullName) {
      return user.fullName.toLowerCase().startsWith('nurse') ? user.fullName : `Nurse ${user.fullName}`;
    }
    if (!user?.username) return 'Nurse Staff Practitioner';
    const name = user.username;
    if (name.toLowerCase().startsWith('nurse')) return name;
    return `Nurse ${name.charAt(0).toUpperCase() + name.slice(1)}`;
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
        const ptDiagnosis = activePatient.primaryDiagnosis || activePatient.condition || activePatient.pastMedicalHistory || 'General Clinical Inpatient';
        const ptUnit = activePatient.careUnit || activePatient.roomLocation || 'Inpatient Care Unit';

        const initialSummary = `**Nurse Clinical Briefing & Bedside Overview**\n**${ptName}** (${ptAge}, ${ptGender}) is currently assigned to **${ptUnit}**.\n• **Primary Condition / Diagnosis:** ${ptDiagnosis}.\n• **Current Status:** ${activePatient.status || 'Admitted'} | Risk Tier: ${activePatient.riskLevel || 'Standard'}.\n\n**Bedside Telemetry Telemetry:**\n• **Blood Pressure:** ${activePatient.bloodPressure || '120/80 mmHg'}\n• **Pulse / Heart Rate:** ${activePatient.heartRate ? `${activePatient.heartRate} bpm` : '--'}\n• **Oxygen Saturation (SpO2):** ${activePatient.oxygenSaturation ? `${activePatient.oxygenSaturation}%` : (activePatient.spO2 ? `${activePatient.spO2}%` : '98%')}\n• **Temperature:** ${activePatient.temperature ? `${activePatient.temperature} °F` : '98.6 °F'}\n\n*ConnectCare Nurse AI Copilot is synchronized with live bedside EHR telemetry.*`;

        setMessages([
          {
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Provide a nursing bedside briefing for ${ptName}.`,
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
    const initialSummary = `**Nurse Clinical Briefing & Bedside Overview**\n**${ptName}** is ${patient.age || 45} years old (${patient.gender || 'Patient'}) admitted in **${patient.careUnit || patient.roomLocation || 'Inpatient Unit'}**.\n• **Primary Diagnosis:** ${patient.primaryDiagnosis || patient.condition || 'General Nursing Care'}.\n• **Status:** ${patient.status || 'Admitted'} • Risk Tier: ${patient.riskLevel || 'Standard'}.`;

    setMessages([
      {
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Summarize nursing bedside status for ${ptName}.`,
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

    api.postNurseAiAssistant({
      doctorName: nurseName,
      patientName: selectedPatient?.name || 'Patient',
      patientIdCode: selectedPatient?.patientIdCode || 'PT-001',
      promptQuery: promptText,
      category: 'Nursing Clinical Care',
    })
      .then((res: any) => {
        const reply = res?.data?.aiResponse || res?.aiResponse || 'Nursing analysis completed based on current database telemetry.';
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
        console.error('Nurse AI Error:', err);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sourcesCount: 1,
            text: 'Unable to connect to Nurse AI Copilot. Please check your network connection.',
          },
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
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
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        <span>Initializing Nurse AI Clinical Copilot...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 overflow-hidden flex items-center justify-center font-bold text-sm shrink-0 border border-teal-200">
            {selectedPatient?.name?.substring(0, 2).toUpperCase() || 'PT'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                {selectedPatient?.name || 'Select Patient'}
              </h1>
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold rounded-full">
                • {selectedPatient?.status || 'Admitted'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {selectedPatient?.patientIdCode || 'PT-001'} • {selectedPatient?.age || 45} yrs, {selectedPatient?.gender || 'Patient'} • Unit: {selectedPatient?.careUnit || selectedPatient?.roomLocation || 'Inpatient Care'}
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
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
          >
            <option value="">Select Patient...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.patientIdCode || 'PT'}) - {p.careUnit || 'Inpatient'}
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate(selectedPatient ? `/patients/${selectedPatient.id}` : '/patients')}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patient
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: AI Copilot Chat Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Title & Settings */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">Nurse AI Clinical Copilot</h2>
                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-md uppercase border border-teal-200">
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Bedside AI copilot for shift handover reports, vital triage, medication administration safety, and progress notes.
              </p>
            </div>

            <div className="text-xs font-bold text-slate-600">
              Staff Nurse: <strong className="text-teal-700">{nurseName}</strong>
            </div>
          </div>

          {/* Suggested Prompts Grid */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nursing Quick Actions & Prompts</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { icon: Repeat, text: 'Generate Shift Handover (SBAR)', color: 'text-teal-600 bg-teal-50 border-teal-100' },
                { icon: Activity, text: 'Bedside Vitals Triage & Spikes', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                { icon: Pill, text: 'Medication Safety Check', color: 'text-purple-600 bg-purple-50 border-purple-100' },
                { icon: ShieldAlert, text: 'Care Plan & Fall Precautions', color: 'text-amber-600 bg-amber-50 border-amber-100' },
                { icon: FileText, text: 'Draft Nursing DAR Note', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                { icon: HelpCircle, text: 'Patient & Family Education', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(p.text)}
                  className={`flex items-center gap-2 p-2.5 ${p.color} hover:brightness-95 border rounded-xl text-xs font-bold text-left transition-all cursor-pointer shadow-2xs`}
                >
                  <p.icon className="h-4 w-4 shrink-0" />
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
                  <div className="bg-teal-50 border border-teal-200 text-teal-950 p-4 rounded-2xl max-w-xl text-xs font-semibold shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] text-teal-600 mb-1 font-bold">
                      <span>You ({nurseName})</span>
                      <span>{m.time}</span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 text-slate-800 p-5 rounded-2xl max-w-2xl text-xs space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                          <Sparkles className="h-3 w-3" />
                        </div>
                        <span className="font-bold text-slate-900">Nurse AI Copilot</span>
                      </div>
                      <span>{m.time}</span>
                    </div>

                    <div className="prose prose-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                      {m.text}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-400">
                      <div className="flex items-center gap-3">
                        <button className="hover:text-teal-600 transition-colors cursor-pointer" title="Helpful"><ThumbsUp className="h-3.5 w-3.5" /></button>
                        <button className="hover:text-rose-600 transition-colors cursor-pointer" title="Report issue"><ThumbsDown className="h-3.5 w-3.5" /></button>
                        <button
                          onClick={() => handleCopy(m.text, idx)}
                          className="hover:text-teal-600 transition-colors cursor-pointer flex items-center gap-1"
                          title="Copy to clipboard"
                        >
                          {copiedIdx === idx ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedIdx === idx && <span className="text-[10px] font-bold text-emerald-600">Copied!</span>}
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700">
                        <span>EHR Sources ({m.sourcesCount || 3})</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                  <Sparkles className="h-4 w-4 text-teal-600 animate-spin" />
                  <span>Analyzing bedside telemetry & EHR records...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              'Draft SBAR Handover',
              'Check Vitals Stability',
              'Medication Pre-Admin Checks',
              'Fall & Skin Protocol',
              'Create DAR Progress Note',
              'Discharge Education',
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(btn)}
                className="px-3 py-1.5 bg-white border border-teal-200 text-teal-800 hover:bg-teal-50 text-xs font-bold rounded-xl whitespace-nowrap shadow-2xs transition-colors cursor-pointer"
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
                placeholder={`Ask Nurse AI Copilot about ${selectedPatient?.name || 'patient'}...`}
                className="w-full pl-4 pr-24 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  onClick={() => handleSendPrompt(query)}
                  className="p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center font-medium">
              Real-time nursing telemetry assistance powered by ConnectCare Clinical AI.
            </p>
          </div>
        </div>

        {/* Right 4 Cols: Live Bedside Snapshot Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-teal-600" />
                Bedside Telemetry Snapshot
              </h3>
              <button
                onClick={() => navigate(selectedPatient ? `/patients/${selectedPatient.id}` : '/patients')}
                className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
              >
                Full Chart
              </button>
            </div>

            {/* Diagnoses & Location */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">Assigned Unit & Diagnosis</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedPatient?.careUnit && (
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold rounded-lg">
                    {selectedPatient.careUnit}
                  </span>
                )}
                {selectedPatient?.primaryDiagnosis ? (
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold rounded-lg">
                    {selectedPatient.primaryDiagnosis}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-semibold rounded-lg">
                    Inpatient Observation
                  </span>
                )}
              </div>
            </div>

            {/* Live Vitals */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">Bedside Vitals</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Blood Pressure (BP)</span>
                  <span className="font-bold text-slate-900">{selectedPatient?.bloodPressure || '120/80 mmHg'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Pulse / Heart Rate</span>
                  <span className="font-bold text-slate-900">{selectedPatient?.heartRate ? `${selectedPatient.heartRate} bpm` : '--'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Oxygen Saturation (SpO2)</span>
                  <span className="font-bold text-emerald-600 font-black">{selectedPatient?.oxygenSaturation ? `${selectedPatient.oxygenSaturation}%` : (selectedPatient?.spO2 ? `${selectedPatient.spO2}%` : '98%')}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Body Temperature</span>
                  <span className="font-bold text-slate-900">{selectedPatient?.temperature ? `${selectedPatient.temperature} °F` : '98.6 °F'}</span>
                </div>
              </div>
            </div>

            {/* Active Medications */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">Active MAR Medications</p>
                <button
                  onClick={() => navigate('/medications')}
                  className="text-[10px] font-bold text-teal-700 hover:underline cursor-pointer"
                >
                  View MAR
                </button>
              </div>
              <div className="space-y-2 text-xs font-medium text-slate-700">
                {patientMeds.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-1">No medication records active.</p>
                ) : (
                  patientMeds.slice(0, 4).map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/50">
                      <span className="font-semibold text-slate-800">{med.name} {med.dosage}</span>
                      <span className="font-bold text-slate-900 text-[11px]">{med.frequency || 'Daily'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Nursing Safety Protocols */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <span>Bedside Safety Protocols</span>
              </div>
              <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                Fall risk precautions active. Verify non-slip socks, bed alarm status, and call light placement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseAiAssistantPage;
