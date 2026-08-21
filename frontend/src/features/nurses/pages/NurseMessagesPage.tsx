import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Sun,
  Search,
  MessageSquare,
  Bell,
  Edit3,
  SlidersHorizontal,
  Video,
  Phone,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Info,
  User,
  UserCheck,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Trash2,
  Users,
  Pill,
  Shield,
  ClipboardList,
  ChevronDown
} from 'lucide-react';

export const NurseMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchConv, setSearchConv] = useState('');
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.getChatConversations(activeTab, searchConv);
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setConversations(list);

      if (list.length > 0 && !selectedConv) {
        setSelectedConv(list[0]);
        fetchMessages(list[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch chat conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await api.getChatMessages(convId);
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setMessages(list);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [activeTab, searchConv]);

  const handleSelectConv = (conv: any) => {
    setSelectedConv(conv);
    fetchMessages(conv.id);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedConv) return;

    const textToSend = inputText;
    setInputText('');

    try {
      const senderName = user?.username
        ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
        : 'Emma Johnson';

      const res = await api.sendChatMessage(selectedConv.id, textToSend, senderName);
      const newMsg = (res as any)?.data || res;

      setMessages((prev) => [...prev, newMsg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? { ...c, lastMessageText: textToSend, lastMessageTimeText: 'Just now' }
            : c
        )
      );

      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to send chat message:', err);
    }
  };

  const getConvIcon = (conv: any) => {
    if (conv.isGroup) {
      if (conv.participantName.includes('Pharmacy')) {
        return (
          <div className="h-10 w-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
            <Pill className="h-5 w-5" />
          </div>
        );
      }
      if (conv.participantName.includes('Admin')) {
        return (
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Shield className="h-5 w-5" />
          </div>
        );
      }
      if (conv.participantName.includes('Handover')) {
        return (
          <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <ClipboardList className="h-5 w-5" />
          </div>
        );
      }
      return (
        <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
          <Users className="h-5 w-5" />
        </div>
      );
    }

    return (
      <div className="relative shrink-0">
        <img
          src={conv.participantAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
          alt={conv.participantName}
          className="h-10 w-10 rounded-full object-cover border border-slate-200"
        />
        {conv.isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
        )}
      </div>
    );
  };

  const isDoctor = user?.role?.toLowerCase() === 'doctor';

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 space-y-5 p-6 max-w-[1700px] mx-auto select-none">
      
      {/* 1. Top Header Bar (Nurse View Only) */}
      {!isDoctor && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Communicate securely with care team members, doctors and staff.
            </p>
          </div>

          {/* Header Right Controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Shift Selector */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
              <Sun className="h-4 w-4 text-amber-500 fill-amber-400" />
              <div className="flex flex-col text-[11px]">
                <span className="font-extrabold text-slate-900">Day Shift</span>
                <span className="text-[10px] text-slate-500 font-semibold">07:00 AM - 03:00 PM</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="pl-9 pr-4 py-2 w-56 sm:w-64 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Icon Badges */}
            <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Unread">
              <MessageSquare className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">8</span>
            </button>

            <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">6</span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
                alt="Nurse Avatar"
                className="h-9 w-9 rounded-full object-cover border border-indigo-200 shadow-xs"
              />
              <div className="text-left">
                <p className="text-xs font-extrabold text-slate-900 leading-tight">
                  {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Emma Johnson'}
                </p>
                <p className="text-[10px] font-semibold text-slate-400">Staff Nurse</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. Main 3-Column Messaging Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Conversations List Panel (Left 3 Columns / 25%) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4 h-[760px] flex flex-col">
          
          {/* Top Sub-Tabs & Edit New Message Button */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 text-xs font-bold">
              {["All", "Unread", "Mentions"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-1 transition-colors relative cursor-pointer ${
                    activeTab === tab
                      ? 'text-indigo-600 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            <button className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-transform active:scale-95 cursor-pointer">
              <Edit3 className="h-4 w-4" />
            </button>
          </div>

          {/* Search Conversations Input */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchConv}
                onChange={(e) => setSearchConv(e.target.value)}
                placeholder="Search conversations..."
                className="pl-8 pr-3 py-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-50 cursor-pointer">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="space-y-1 flex-1 overflow-y-auto pr-1">
            {conversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 border border-indigo-100'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {getConvIcon(conv)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-slate-900 text-xs truncate">
                        {conv.participantName}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {conv.lastMessageTimeText}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[11px] font-semibold text-slate-500 truncate leading-tight">
                        {conv.lastMessageText}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="h-4 w-4 rounded-full bg-indigo-600 text-white font-extrabold text-[9px] flex items-center justify-center shrink-0 ml-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Column 2: Active Chat Window (Center 6 Columns / 50%) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[760px]">
          
          {/* Chat Header Bar */}
          {selectedConv && (
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedConv.participantAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                    alt={selectedConv.participantName}
                    className="h-10 w-10 rounded-full object-cover border border-indigo-100"
                  />
                  {selectedConv.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm leading-tight">{selectedConv.participantName}</h3>
                  <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Online
                  </p>
                </div>
              </div>

              {/* Action Buttons Right */}
              <div className="flex items-center gap-2">
                <button className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer" title="Video Call">
                  <Video className="h-4 w-4 text-indigo-600" />
                </button>
                <button className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer" title="Phone Call">
                  <Phone className="h-4 w-4 text-indigo-600" />
                </button>
                <button className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer" title="More Options">
                  <MoreVertical className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40 text-xs">
            
            {/* Date Divider */}
            <div className="flex items-center justify-center my-2">
              <span className="px-3 py-1 bg-white border border-slate-200/80 rounded-full text-[10px] font-bold text-slate-400 shadow-2xs">
                Today
              </span>
            </div>

            {/* Message Stream */}
            {messages.map((m, idx) => {
              const isUnreadDivider = m.isUnread && idx > 0 && !messages[idx - 1].isUnread;

              return (
                <React.Fragment key={m.id || idx}>
                  {isUnreadDivider && (
                    <div className="flex items-center justify-center my-3">
                      <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-extrabold text-indigo-600 shadow-2xs">
                        1 Unread Message
                      </span>
                    </div>
                  )}

                  <div className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[78%] p-3.5 rounded-2xl shadow-2xs text-xs font-semibold leading-relaxed ${
                        m.isMe
                          ? 'bg-[#EEF2FF] border border-indigo-100 text-slate-900 rounded-br-none'
                          : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      <p>{m.messageText}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-semibold ${m.isMe ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <span>{m.timeText}</span>
                        {m.isMe && <span>✓✓</span>}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-100 bg-white rounded-b-2xl flex items-center gap-2 shrink-0">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer">
              <Paperclip className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer">
              <Smile className="h-4 w-4" />
            </button>

            <button
              onClick={handleSendMessage}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-transform active:scale-95 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

        </div>

        {/* Column 3: Conversation Details Sidebar (Right 3 Columns / 25%) */}
        <div className="lg:col-span-3 h-[760px] flex flex-col justify-between">
          
          {/* Details Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4 h-full overflow-y-auto">
            
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs">Conversation Details</h3>
              <Info className="h-4 w-4 text-slate-400 cursor-pointer" />
            </div>

            {/* Participant Card */}
            {selectedConv && (
              <div className="flex flex-col items-center justify-center text-center pt-1 space-y-2 border-b border-slate-100 pb-4">
                <img
                  src={selectedConv.participantAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedConv.participantName}
                  className="h-16 w-16 rounded-full object-cover border-2 border-indigo-100 shadow-xs"
                />
                <div>
                  <h4 className="font-black text-slate-900 text-sm">{selectedConv.participantName}</h4>
                  <p className="text-[11px] font-bold text-slate-500">Cardiologist</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Attending Doctor
                  </span>
                </div>

                {/* 4 Action Buttons */}
                <div className="grid grid-cols-4 gap-2 w-full pt-2">
                  <button className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-xl text-slate-700 transition-colors cursor-pointer">
                    <Phone className="h-4 w-4 text-indigo-600" />
                    <span className="text-[9px] font-bold mt-1">Call</span>
                  </button>

                  <button className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-xl text-slate-700 transition-colors cursor-pointer">
                    <Video className="h-4 w-4 text-indigo-600" />
                    <span className="text-[9px] font-bold mt-1">Video Call</span>
                  </button>

                  <button className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-xl text-slate-700 transition-colors cursor-pointer">
                    <User className="h-4 w-4 text-indigo-600" />
                    <span className="text-[9px] font-bold mt-1">Profile</span>
                  </button>

                  <button className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-xl text-slate-700 transition-colors cursor-pointer">
                    <UserCheck className="h-4 w-4 text-indigo-600" />
                    <span className="text-[9px] font-bold mt-1">View Patient</span>
                  </button>
                </div>
              </div>
            )}

            {/* Shared Patient Card */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Shared Patient</p>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-indigo-50/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedConv?.sharedPatientAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                    alt="Patient"
                    className="h-9 w-9 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">{selectedConv?.sharedPatientName || 'Patricia Smith'}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">PID: {selectedConv?.sharedPatientIdCode || 'PT-10001'} | {selectedConv?.sharedPatientRoom || 'Room 302'}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{selectedConv?.sharedPatientCareUnit || 'Cardiology Unit'}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200">
                      {selectedConv?.sharedPatientStatus || 'In Progress'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Media, Files & Links Card */}
            <div className="space-y-2.5 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Media, Files & Links</p>
                <button className="text-[10px] font-extrabold text-indigo-600 hover:underline">View All</button>
              </div>

              <div className="space-y-2 text-xs font-semibold">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">Lab Report_22May.pdf</p>
                      <p className="text-[10px] text-slate-400">PDF • 245 KB</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">X-Ray_21May.jpg</p>
                      <p className="text-[10px] text-slate-400">JPG • 1.2 MB</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">Care Plan_Patricia.pdf</p>
                      <p className="text-[10px] text-slate-400">PDF • 308 KB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications & Actions */}
            <div className="space-y-3 pt-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Notifications</p>

              <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-400" />
                  Mute Conversation
                </span>
                <input
                  type="checkbox"
                  checked={isMuted}
                  onChange={(e) => setIsMuted(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <button className="w-full flex items-center gap-2 pt-2 text-xs font-extrabold text-rose-600 hover:text-rose-700 cursor-pointer">
                <Trash2 className="h-4 w-4" />
                Delete Conversation
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default NurseMessagesPage;
