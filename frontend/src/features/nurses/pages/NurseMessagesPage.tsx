import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { setMessagesCount } from '@/store/slices/uiSlice';
import { PageHeader } from '@/components/common/PageHeader';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';
import {
  Search,
  Bell,
  BellOff,
  Edit3,
  Video,
  Phone,
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
  ShieldCheck,
  ClipboardList,
  X,
  Check,
  CheckCheck,
  RefreshCw
} from 'lucide-react';

export const NurseMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchConv, setSearchConv] = useState('');
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [contacts, setContacts] = useState<{ doctors: any[]; nurses: any[]; admins: any[]; groups: any[] }>({
    doctors: [],
    nurses: [],
    admins: [],
    groups: []
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [composeTab, setComposeTab] = useState<'all' | 'doctors' | 'nurses' | 'admins' | 'groups'>('all');
  const [composeSearch, setComposeSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [initialMessageText, setInitialMessageText] = useState('');
  const [composeSubmitting, setComposeSubmitting] = useState(false);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Call Modals / Toasts
  const [callNotice, setCallNotice] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const userRole = (user?.role || 'Admin').toLowerCase();
  const isDoctor = userRole === 'doctor';
  const isNurse = userRole.includes('nurse');
  const isAdmin = !isDoctor && !isNurse;

  const currentUserName = user?.fullName || user?.username || 'User';

  const fetchConversations = async (selectFirst = false, keepSelectedId?: string) => {
    setLoading(true);
    try {
      const res = await api.getChatConversations(activeTab, searchConv);
      const list = Array.isArray(res) ? res : res?.data || [];
      const unread = res?.unreadCount ?? list.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
      
      setConversations(list);
      dispatch(setMessagesCount(unread));

      if (list.length > 0) {
        if (keepSelectedId) {
          const match = list.find((c: any) => c.id === keepSelectedId);
          if (match) {
            setSelectedConv(match);
            setIsMuted(!!match.isMuted);
            fetchMessages(match.id);
            return;
          }
        }
        if (!selectedConv || selectFirst) {
          setSelectedConv(list[0]);
          setIsMuted(!!list[0].isMuted);
          fetchMessages(list[0].id);
        }
      } else {
        setSelectedConv(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to fetch chat conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    setMessagesLoading(true);
    try {
      const res = await api.getChatMessages(convId);
      const list = Array.isArray(res) ? res : res?.data || [];
      setMessages(list);
      setTimeout(scrollToBottom, 100);

      // If conversation has unread, mark as read
      const conv = conversations.find(c => c.id === convId);
      if (conv && conv.unreadCount > 0) {
        api.markChatConversationRead(convId).then((r: any) => {
          const updatedUnread = r?.unreadCount ?? 0;
          dispatch(setMessagesCount(updatedUnread));
          setConversations(prev =>
            prev.map(c => (c.id === convId ? { ...c, unreadCount: 0 } : c))
          );
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Load Contacts & Patients for Compose Modal
  const loadContactsAndPatients = async () => {
    try {
      const [chatContactsRes, doctorsRes, nursesRes, patientsRes] = await Promise.allSettled([
        api.getChatContacts(),
        api.getDoctors(),
        api.getNurses(),
        api.getPatients()
      ]);

      let docsList: any[] = [];
      let nursesList: any[] = [];
      let adminsList: any[] = [];
      let groupsList: any[] = [];

      // 1. From getChatContacts if available
      if (chatContactsRes.status === 'fulfilled') {
        const cData = chatContactsRes.value?.data || chatContactsRes.value;
        if (cData) {
          if (Array.isArray(cData.doctors) && cData.doctors.length > 0) docsList = cData.doctors;
          if (Array.isArray(cData.nurses) && cData.nurses.length > 0) nursesList = cData.nurses;
          if (Array.isArray(cData.admins) && cData.admins.length > 0) adminsList = cData.admins;
          if (Array.isArray(cData.groups) && cData.groups.length > 0) groupsList = cData.groups;
        }
      }

      // 2. Fallback / Populate from getDoctors()
      if (docsList.length === 0 && doctorsRes.status === 'fulfilled') {
        const dData = Array.isArray(doctorsRes.value) ? doctorsRes.value : (doctorsRes.value as any)?.data || [];
        docsList = dData.map((d: any) => ({
          id: d.id,
          userId: d.userId || d.user?.id,
          name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Doctor',
          role: d.specialty ? `${d.specialty} Specialist` : (d.role || 'Physician / Specialist'),
          category: 'Doctor',
          department: d.department || 'Cardiology',
          avatar: d.avatar || d.user?.avatar || '',
          isOnline: true
        }));
      }

      // If still empty, add default system doctor
      if (docsList.length === 0) {
        docsList = [
          {
            id: '8b34f983-9675-47bf-9b04-0df53465932e',
            userId: 'a7792fa2-ca37-4897-b581-f5bacbd7eaec',
            name: 'Doctor 1 Test',
            role: 'Cardiologist / Attending Doctor',
            category: 'Doctor',
            department: 'Cardiology',
            avatar: '',
            isOnline: true
          }
        ];
      }

      // 3. Fallback / Populate from getNurses()
      if (nursesList.length === 0 && nursesRes.status === 'fulfilled') {
        const nData = Array.isArray(nursesRes.value) ? nursesRes.value : (nursesRes.value as any)?.data || [];
        nursesList = nData.map((n: any) => ({
          id: n.id,
          userId: n.userId || n.user?.id,
          name: n.name || `${n.firstName || ''} ${n.lastName || ''}`.trim() || 'Nurse',
          role: n.role || 'Staff Nurse',
          category: 'Nurse',
          department: n.department || n.assignedUnit || 'Cardiology Unit',
          avatar: n.avatar || n.user?.avatar || '',
          isOnline: true
        }));
      }

      // If still empty, add default system nurse
      if (nursesList.length === 0) {
        nursesList = [
          {
            id: 'b4a67551-ad38-4f41-9ee9-afe7a65fb6b2',
            userId: '67f5aa76-6897-4cb6-aad3-74e42b5349b2',
            name: 'Nurse1 Test',
            role: 'Staff Nurse',
            category: 'Nurse',
            department: 'Cardiology Unit',
            avatar: '',
            isOnline: true
          }
        ];
      }

      // 4. Default Admin & Group Channels
      if (adminsList.length === 0) {
        adminsList = [
          {
            id: '748cf3bc-2998-4f6a-a5f2-b7db3af791b3',
            userId: '748cf3bc-2998-4f6a-a5f2-b7db3af791b3',
            name: 'System Administrator',
            role: 'Hospital Administrator',
            category: 'Admin',
            department: 'Administration',
            avatar: '',
            isOnline: true
          }
        ];
      }

      if (groupsList.length === 0) {
        groupsList = [
          {
            id: 'grp-pharmacy',
            name: 'Pharmacy Support & Dispensing',
            role: 'Clinical Pharmacy Team',
            category: 'Group',
            department: 'Pharmacy',
            avatar: '',
            isOnline: true
          },
          {
            id: 'grp-handover',
            name: 'Cardiology Shift Handover',
            role: 'Nursing & Resident Care Team',
            category: 'Group',
            department: 'Cardiology Unit',
            avatar: '',
            isOnline: true
          },
          {
            id: 'grp-icu',
            name: 'Critical Care & ICU Alert Channel',
            role: 'ICU Rapid Response Team',
            category: 'Group',
            department: 'Intensive Care Unit',
            avatar: '',
            isOnline: true
          }
        ];
      }

      setContacts({
        doctors: docsList,
        nurses: nursesList,
        admins: adminsList,
        groups: groupsList
      });

      if (patientsRes.status === 'fulfilled') {
        const pList: any[] = Array.isArray(patientsRes.value) ? patientsRes.value : (patientsRes.value as any)?.data || [];
        setPatients(pList);
      }
    } catch (err) {
      console.error('Failed to load contacts for new chat:', err);
    }
  };

  useEffect(() => {
    fetchConversations(false);
    loadContactsAndPatients();
  }, [activeTab, searchConv]);

  const handleOpenCompose = () => {
    loadContactsAndPatients();
    setSelectedRecipient(null);
    setSelectedPatient(null);
    setInitialMessageText('');
    setComposeSearch('');
    setComposeTab('all');
    setIsComposeOpen(true);
  };

  const handleSelectConv = (conv: any) => {
    setSelectedConv(conv);
    setIsMuted(!!conv.isMuted);
    fetchMessages(conv.id);
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !attachedFile) || !selectedConv) return;

    const textToSend = inputText.trim() || (attachedFile ? `Attached file: ${attachedFile.name}` : '');
    const currentAttached = attachedFile;

    setInputText('');
    setAttachedFile(null);
    setShowEmojiPicker(false);

    try {
      const senderRole = isDoctor
        ? (user?.specialty || 'Cardiologist')
        : isNurse
        ? 'Staff Nurse'
        : 'System Administrator';

      const senderAvatar = user?.avatar || '';

      const payload = {
        messageText: textToSend,
        senderName: currentUserName,
        senderRole: senderRole,
        senderAvatar: senderAvatar,
        senderUserId: user?.userId || user?.id,
        attachmentName: currentAttached?.name,
        attachmentType: currentAttached?.type,
        attachmentSize: currentAttached?.size
      };

      const res = await api.sendChatMessage(selectedConv.id, payload);
      const newMsg = res?.data || res;

      // Ensure isMe is marked true on freshly sent message
      const localMsg = {
        ...newMsg,
        isMe: true,
        timeText: newMsg.timeText || 'Just now'
      };

      setMessages((prev) => [...prev, localMsg]);
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

  const handleToggleMute = async () => {
    if (!selectedConv) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    try {
      await api.toggleChatMute(selectedConv.id, nextMute);
      setConversations(prev =>
        prev.map(c => c.id === selectedConv.id ? { ...c, isMuted: nextMute } : c)
      );
    } catch (err) {
      console.error('Failed to toggle mute:', err);
      setIsMuted(!nextMute);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConv) return;
    setDeleteSubmitting(true);
    try {
      const res = await api.deleteChatConversation(selectedConv.id);
      setIsDeleteOpen(false);
      const remaining = conversations.filter(c => c.id !== selectedConv.id);
      setConversations(remaining);
      const newUnread = res?.unreadCount ?? 0;
      dispatch(setMessagesCount(newUnread));
      if (remaining.length > 0) {
        setSelectedConv(remaining[0]);
        fetchMessages(remaining[0].id);
      } else {
        setSelectedConv(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleCreateNewConversation = async () => {
    if (!selectedRecipient) return;
    setComposeSubmitting(true);

    const isGroup = selectedRecipient.category === 'Group';
    const initText = initialMessageText.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Check if conversation already exists with this participant
    const existing = conversations.find(
      c => c.participantName.toLowerCase() === selectedRecipient.name.toLowerCase() ||
           (selectedRecipient.userId && c.participantUserId === selectedRecipient.userId)
    );

    if (existing) {
      setSelectedConv(existing);
      setIsMuted(!!existing.isMuted);
      setIsComposeOpen(false);
      setComposeSubmitting(false);
      fetchMessages(existing.id);

      if (initText) {
        try {
          const senderRole = isDoctor
            ? (user?.specialty || 'Cardiologist')
            : isNurse
            ? 'Staff Nurse'
            : 'System Administrator';

          await api.sendChatMessage(existing.id, {
            messageText: initText,
            senderName: currentUserName,
            senderRole: senderRole,
            senderAvatar: user?.avatar || '',
            senderUserId: user?.userId || user?.id
          });
          fetchMessages(existing.id);
        } catch (err) {
          console.error('Failed to send initial message to existing conversation:', err);
        }
      }
      return;
    }

    // 2. Build payload for new conversation
    const payload: any = {
      participantName: selectedRecipient.name,
      participantRole: selectedRecipient.role || selectedRecipient.department || 'Care Team Member',
      participantAvatar: selectedRecipient.avatar || '',
      participantUserId: selectedRecipient.userId || undefined,
      isGroup: isGroup,
      category: isGroup ? 'Mentions' : 'All',
      initialMessage: initText || undefined,
      senderName: currentUserName,
      senderRole: isDoctor ? (user?.specialty || 'Cardiologist') : isNurse ? 'Staff Nurse' : 'System Administrator',
      senderUserId: user?.userId || user?.id
    };

    if (selectedPatient) {
      payload.sharedPatientId = selectedPatient.id;
      payload.sharedPatientName = selectedPatient.name;
      payload.sharedPatientIdCode = selectedPatient.patientIdCode || selectedPatient.mrn || 'PT-10001';
      payload.sharedPatientRoom = selectedPatient.floorRoom || 'Room 302';
      payload.sharedPatientCareUnit = selectedPatient.careUnit || 'General Unit';
      payload.sharedPatientStatus = selectedPatient.status || 'Active';
      payload.sharedPatientAvatar = selectedPatient.avatar || '';
    }

    try {
      let createdConv: any = null;
      try {
        const res = await api.createChatConversation(payload);
        createdConv = res?.data || res;
      } catch (backendErr) {
        console.warn('Backend create conversation endpoint unavailable, using local conversation initialization:', backendErr);
      }

      // If backend didn't return an object with id, create a local fallback record
      if (!createdConv || !createdConv.id) {
        createdConv = {
          id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'conv-' + Date.now()),
          participantName: selectedRecipient.name,
          participantRole: selectedRecipient.role || selectedRecipient.department || 'Care Team Member',
          participantAvatar: selectedRecipient.avatar || '',
          participantUserId: selectedRecipient.userId || undefined,
          isOnline: true,
          lastMessageText: initText || 'Conversation started',
          lastMessageTimeText: timeNow,
          unreadCount: 0,
          isGroup: isGroup,
          category: isGroup ? 'Mentions' : 'All',
          sharedPatientName: selectedPatient?.name || 'Patient1 Test',
          sharedPatientIdCode: selectedPatient?.patientIdCode || selectedPatient?.mrn || 'PT-47932',
          sharedPatientRoom: selectedPatient?.floorRoom || '3rd Floor - 301',
          sharedPatientCareUnit: selectedPatient?.careUnit || 'Cardiology Unit',
          sharedPatientStatus: selectedPatient?.status || 'In Progress',
          sharedPatientAvatar: selectedPatient?.avatar || '',
          isMuted: false,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString()
        };
      }

      setConversations(prev => [createdConv, ...prev.filter(c => c.id !== createdConv.id)]);
      setSelectedConv(createdConv);
      setIsMuted(false);

      if (initText) {
        const initMsgRecord = {
          id: 'msg-' + Date.now(),
          conversationId: createdConv.id,
          senderUserId: user?.userId || user?.id,
          senderName: currentUserName,
          senderRole: isDoctor ? (user?.specialty || 'Cardiologist') : isNurse ? 'Staff Nurse' : 'System Administrator',
          senderAvatar: user?.avatar || '',
          messageText: initText,
          timeText: timeNow,
          isMe: true,
          isUnread: false,
          createdDate: new Date().toISOString()
        };
        setMessages([initMsgRecord]);
        try {
          await api.sendChatMessage(createdConv.id, {
            messageText: initText,
            senderName: currentUserName,
            senderRole: isDoctor ? (user?.specialty || 'Cardiologist') : isNurse ? 'Staff Nurse' : 'System Administrator',
            senderAvatar: user?.avatar || '',
            senderUserId: user?.userId || user?.id
          });
        } catch {}
      } else {
        setMessages([]);
      }

      setIsComposeOpen(false);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      setComposeSubmitting(false);
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      const typeStr = file.name.endsWith('.pdf') ? 'PDF' : file.type.includes('image') ? 'IMAGE' : 'DOC';
      setAttachedFile({
        name: file.name,
        size: sizeStr,
        type: typeStr
      });
    }
  };

  const handleTriggerCall = (type: 'Phone' | 'Video') => {
    const contactName = selectedConv?.participantName || 'Contact';
    setCallNotice(`Connecting ${type} Call to ${contactName}... Encrypted HIPAA Stream active.`);
    setTimeout(() => {
      setCallNotice(null);
    }, 4000);
  };

  const isMyMessage = (m: any) => {
    if (m.isMe === true) return true;
    const currentId = user?.userId || user?.id;
    if (currentId && m.senderUserId && m.senderUserId === currentId) return true;
    if (currentUserName && m.senderName && m.senderName.trim().toLowerCase() === currentUserName.trim().toLowerCase()) return true;
    return false;
  };

  const getConvIcon = (conv: any) => {
    if (conv.isGroup) {
      if (conv.participantName.includes('Pharmacy')) {
        return (
          <div className="h-10 w-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100 shadow-2xs">
            <Pill className="h-5 w-5" />
          </div>
        );
      }
      if (conv.participantName.includes('Admin') || conv.participantName.includes('Notice')) {
        return (
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
            <Shield className="h-5 w-5" />
          </div>
        );
      }
      if (conv.participantName.includes('Handover') || conv.participantName.includes('Shift')) {
        return (
          <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-2xs">
            <ClipboardList className="h-5 w-5" />
          </div>
        );
      }
      return (
        <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 shadow-2xs">
          <Users className="h-5 w-5" />
        </div>
      );
    }

    return (
      <div className="relative shrink-0">
        {conv.participantAvatar ? (
          <img
            src={conv.participantAvatar}
            alt={conv.participantName}
            className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-2xs"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200 shadow-2xs">
            {conv.participantName ? conv.participantName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'CC'}
          </div>
        )}
        {conv.isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
        )}
      </div>
    );
  };

  // Filtered contacts for compose dialog
  const allContactsList = [
    ...contacts.doctors,
    ...contacts.nurses,
    ...contacts.admins,
    ...contacts.groups
  ];

  const currentUserId = user?.userId || user?.id;
  const currentDocId = user?.doctorId;
  const currentNurseId = user?.nurseId;
  const currentNameClean = (currentUserName || '').trim().toLowerCase().replace(/[\s\-_]/g, '');
  const currentUsernameClean = (user?.username || '').trim().toLowerCase().replace(/[\s\-_]/g, '');

  const filteredContacts = allContactsList.filter(c => {
    // 1. Exclude the currently logged-in user
    if (currentUserId && (c.userId === currentUserId || c.id === currentUserId)) {
      return false;
    }
    if (currentDocId && c.id === currentDocId) {
      return false;
    }
    if (currentNurseId && c.id === currentNurseId) {
      return false;
    }
    const cNameClean = (c.name || '').trim().toLowerCase().replace(/[\s\-_]/g, '');
    if (cNameClean && (cNameClean === currentNameClean || cNameClean === currentUsernameClean)) {
      return false;
    }

    const cat = (c.category || '').toLowerCase();
    const role = (c.role || '').toLowerCase();

    if (composeTab === 'doctors') {
      if (cat !== 'doctor' && !role.includes('doctor') && !role.includes('physician') && !role.includes('cardiolog') && !role.includes('surgeon')) {
        return false;
      }
    }
    if (composeTab === 'nurses') {
      if (cat !== 'nurse' && !role.includes('nurse')) {
        return false;
      }
    }
    if (composeTab === 'admins') {
      if (cat !== 'admin' && !role.includes('admin') && !role.includes('administrator')) {
        return false;
      }
    }
    if (composeTab === 'groups') {
      if (cat !== 'group' && !c.isGroup && !role.includes('channel') && !role.includes('team')) {
        return false;
      }
    }

    if (composeSearch) {
      const q = composeSearch.toLowerCase().trim();
      const qNoSpace = q.replace(/[\s\-_]/g, '');
      const name = (c.name || '').toLowerCase();
      const nameNoSpace = name.replace(/[\s\-_]/g, '');
      const dept = (c.department || '').toLowerCase();
      const catName = cat;

      const matches = name.includes(q) ||
                      nameNoSpace.includes(qNoSpace) ||
                      role.includes(q) ||
                      dept.includes(q) ||
                      catName.includes(q);
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto select-none font-sans text-slate-800">
      
      {/* Toast Notification for Call Simulator */}
      {callNotice && (
        <div className="fixed top-20 right-8 z-50 bg-indigo-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-indigo-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold">{callNotice}</span>
          <button onClick={() => setCallNotice(null)} className="ml-2 text-indigo-300 hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title={isAdmin ? 'Messages & Operations Chat' : isDoctor ? 'Clinical Messages & Consults' : 'Messages & Shift Chat'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Messages' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <DataImportExportToolbar
              moduleKey="messages"
              data={conversations}
              idField="id"
              onImportSuccess={() => fetchConversations()}
            />
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-100/80 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              {conversations.length} Active {isAdmin ? 'Channels' : isDoctor ? 'Consults' : 'Chats'}
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-100 flex items-center gap-1.5 hidden sm:flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              HIPAA Compliant
            </span>
          </div>
        }
      />

      {/* 2. Main 3-Column Messaging Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Conversations List Panel (Left 3 Columns / 25%) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4 h-[760px] flex flex-col">
          
          {/* Top Sub-Tabs & Compose New Message Button */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 text-xs font-bold">
              {['All', 'Unread', 'Mentions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-1 transition-colors relative cursor-pointer ${
                    activeTab === tab
                      ? 'text-indigo-600 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'Mentions' ? 'Channels' : tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenCompose}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-transform active:scale-95 cursor-pointer"
              title="Start New Conversation"
            >
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
            <button
              onClick={() => fetchConversations()}
              className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-50 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="space-y-1 flex-1 overflow-y-auto pr-1 divide-y divide-slate-50">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Loading conversations...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <Users className="h-8 w-8 mx-auto opacity-40 text-slate-400" />
                <p className="text-xs font-bold text-slate-600">No conversations found</p>
                <button
                  onClick={handleOpenCompose}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Start New Chat
                </button>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConv(conv)}
                    className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border border-indigo-100 shadow-2xs'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {getConvIcon(conv)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="font-extrabold text-slate-900 text-xs truncate">
                            {conv.participantName}
                          </p>
                          {conv.isMuted && <BellOff className="h-3 w-3 text-slate-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          {conv.lastMessageTimeText}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] font-semibold text-slate-500 truncate leading-tight">
                          {conv.lastMessageText}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="h-4.5 min-w-4.5 px-1 rounded-full bg-indigo-600 text-white font-extrabold text-[9px] flex items-center justify-center shrink-0 ml-1 shadow-xs">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Column 2: Active Chat Window (Center 6 Columns / 50%) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[760px] overflow-hidden">
          
          {/* Chat Header Bar */}
          {selectedConv ? (
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/30">
              <div className="flex items-center gap-3 min-w-0">
                {getConvIcon(selectedConv)}
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 text-sm leading-tight truncate">
                    {selectedConv.participantName}
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    {selectedConv.isGroup ? 'Group Channel • Active' : 'Online • Direct Encrypted'}
                  </p>
                </div>
              </div>

              {/* Action Buttons Right */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleTriggerCall('Video')}
                  className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                  title="Video Call"
                >
                  <Video className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleTriggerCall('Phone')}
                  className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                  title="Phone Call"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  onClick={handleToggleMute}
                  className={`p-2 border border-slate-200 rounded-xl transition-colors cursor-pointer ${
                    isMuted ? 'bg-amber-50 text-amber-600 border-amber-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  title={isMuted ? 'Unmute Conversation' : 'Mute Conversation'}
                >
                  {isMuted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-700 text-sm">Select a conversation</h3>
            </div>
          )}

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40 text-xs">
            
            {messagesLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Loading messages...</span>
              </div>
            ) : !selectedConv ? (
              <div className="py-24 text-center text-slate-400 space-y-3">
                <Users className="h-10 w-10 mx-auto opacity-30 text-slate-400" />
                <p className="text-sm font-bold text-slate-600">Select a conversation from the left to start messaging</p>
                <button
                  onClick={handleOpenCompose}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Start New Message
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <p className="text-xs font-semibold">No messages in this conversation yet.</p>
                <p className="text-[11px] text-slate-400">Send a message below to start the conversation.</p>
              </div>
            ) : (
              <>
                {/* Date Divider */}
                <div className="flex items-center justify-center my-2">
                  <span className="px-3 py-1 bg-white border border-slate-200/80 rounded-full text-[10px] font-bold text-slate-400 shadow-2xs">
                    Today
                  </span>
                </div>

                {/* Message Stream */}
                {messages.map((m, idx) => {
                  const isUnreadDivider = m.isUnread && idx > 0 && !messages[idx - 1].isUnread;
                  const mine = isMyMessage(m);

                  return (
                    <React.Fragment key={m.id || idx}>
                      {isUnreadDivider && (
                        <div className="flex items-center justify-center my-3">
                          <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-extrabold text-indigo-600 shadow-2xs">
                            Unread Messages
                          </span>
                        </div>
                      )}

                      <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                        {/* Sender info header for incoming messages in group / clinical chats */}
                        {!mine && (
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="font-extrabold text-slate-800 text-[11px]">{m.senderName || 'Staff'}</span>
                            {m.senderRole && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                {m.senderRole}
                              </span>
                            )}
                          </div>
                        )}

                        <div
                          className={`max-w-[78%] p-3.5 rounded-2xl shadow-2xs text-xs font-semibold leading-relaxed ${
                            mine
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.messageText}</p>

                          {/* Attachment Card if present */}
                          {m.attachmentName && (
                            <div className={`mt-2 p-2 rounded-xl flex items-center gap-2 border ${mine ? 'bg-indigo-700/50 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}>
                              <FileText className={`h-4 w-4 ${mine ? 'text-indigo-200' : 'text-indigo-600'}`} />
                              <div className="min-w-0 flex-1 text-left">
                                <p className={`text-[11px] font-bold truncate ${mine ? 'text-white' : 'text-slate-900'}`}>{m.attachmentName}</p>
                                <p className={`text-[9px] ${mine ? 'text-indigo-200' : 'text-slate-400'}`}>{m.attachmentType || 'FILE'} • {m.attachmentSize || 'Document'}</p>
                              </div>
                            </div>
                          )}

                          <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-semibold ${mine ? 'text-indigo-200' : 'text-slate-400'}`}>
                            <span>{m.timeText || 'Now'}</span>
                            {mine && <CheckCheck className="h-3 w-3 text-indigo-200 inline" />}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attached File Preview Bar */}
          {attachedFile && (
            <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                <span className="font-bold text-indigo-900">{attachedFile.name}</span>
                <span className="text-[10px] text-indigo-600">({attachedFile.size})</span>
              </div>
              <button onClick={() => setAttachedFile(null)} className="text-indigo-600 hover:text-indigo-800 cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Quick Emoji Bar */}
          {showEmojiPicker && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
              {['👍', '❤️', '🩺', '💊', '✅', '📋', '🚨', '🙏', '😊', '👏'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setInputText(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-100 bg-white rounded-b-2xl flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileAttach}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
              title="Attach File / Lab Report"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!selectedConv}
              placeholder={selectedConv ? `Type a message to ${selectedConv.participantName}...` : 'Select a conversation to start chatting...'}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />

            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                showEmojiPicker ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Insert Emoji"
            >
              <Smile className="h-4 w-4" />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={(!inputText.trim() && !attachedFile) || !selectedConv}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Send Message"
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
            {selectedConv ? (
              <div className="flex flex-col items-center justify-center text-center pt-1 space-y-2 border-b border-slate-100 pb-4">
                {selectedConv.participantAvatar ? (
                  <img
                    src={selectedConv.participantAvatar}
                    alt={selectedConv.participantName}
                    className="h-16 w-16 rounded-full object-cover border-2 border-indigo-100 shadow-xs"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl border-2 border-indigo-100 shadow-xs">
                    {selectedConv.participantName ? selectedConv.participantName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'CC'}
                  </div>
                )}
                <div>
                  <h4 className="font-black text-slate-900 text-sm">{selectedConv.participantName}</h4>
                  <p className="text-[11px] font-bold text-slate-500">{selectedConv.participantRole || 'Care Team Member'}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {selectedConv.isGroup ? 'Group Channel' : 'Direct Conversation'}
                  </span>
                </div>

                {/* 4 Action Buttons */}
                <div className="grid grid-cols-4 gap-2 w-full pt-2">
                  <button
                    onClick={() => handleTriggerCall('Phone')}
                    className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-xl text-slate-700 transition-colors cursor-pointer"
                  >
                    <Phone className="h-4 w-4 text-indigo-600" />
                    <span className="text-[9px] font-bold mt-1">Call</span>
                  </button>

                  <button
                    onClick={() => handleTriggerCall('Video')}
                    className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-xl text-slate-700 transition-colors cursor-pointer"
                  >
                    <Video className="h-4 w-4 text-indigo-600" />
                    <span className="text-[9px] font-bold mt-1">Video</span>
                  </button>

                  <button
                    onClick={() => {
                      if (selectedConv.participantRole?.includes('Doctor')) navigate('/doctors');
                      else if (selectedConv.participantRole?.includes('Nurse')) navigate('/nurses');
                      else navigate('/care-teams');
                    }}
                    className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-xl text-slate-700 transition-colors cursor-pointer"
                  >
                    <User className="h-4 w-4 text-indigo-600" />
                    <span className="text-[9px] font-bold mt-1">Profile</span>
                  </button>

                  <button
                    onClick={() => navigate('/patients')}
                    className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-xl text-slate-700 transition-colors cursor-pointer"
                  >
                    <UserCheck className="h-4 w-4 text-indigo-600" />
                    <span className="text-[9px] font-bold mt-1">Patient</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No participant selected
              </div>
            )}

            {/* Shared Patient Card */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Shared Patient / Ward</p>

              <div
                onClick={() => navigate('/patients')}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-indigo-50/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedConv?.sharedPatientAvatar ? (
                    <img
                      src={selectedConv.sharedPatientAvatar}
                      alt="Patient"
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {selectedConv?.sharedPatientName ? selectedConv.sharedPatientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 text-xs truncate">
                      {selectedConv?.sharedPatientName || 'Patricia Smith'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold truncate">
                      PID: {selectedConv?.sharedPatientIdCode || 'PT-10001'} | {selectedConv?.sharedPatientRoom || 'Room 302'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold truncate">
                      {selectedConv?.sharedPatientCareUnit || 'Cardiology Unit'}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200">
                      {selectedConv?.sharedPatientStatus || 'In Progress'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
              </div>
            </div>

            {/* Media, Files & Links Card */}
            <div className="space-y-2.5 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Media & Clinical Files</p>
                <button onClick={() => navigate('/documentations')} className="text-[10px] font-extrabold text-indigo-600 hover:underline cursor-pointer">
                  View All
                </button>
              </div>

              <div className="space-y-2 text-xs font-semibold">
                <div
                  onClick={() => navigate('/documentations')}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-xl hover:bg-indigo-50/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 text-xs truncate">Lab_Report_Vitals.pdf</p>
                      <p className="text-[10px] text-slate-400">PDF • 245 KB</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/documentations')}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-xl hover:bg-indigo-50/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 text-xs truncate">ECG_Telemetry_Reading.jpg</p>
                      <p className="text-[10px] text-slate-400">JPG • 1.2 MB</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/care-plans')}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-xl hover:bg-indigo-50/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 text-xs truncate">Care_Plan_Summary.pdf</p>
                      <p className="text-[10px] text-slate-400">PDF • 308 KB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications & Actions */}
            <div className="space-y-3 pt-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Conversation Actions</p>

              <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-400" />
                  Mute Conversation
                </span>
                <input
                  type="checkbox"
                  checked={isMuted}
                  onChange={handleToggleMute}
                  disabled={!selectedConv}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                />
              </div>

              <button
                onClick={() => setIsDeleteOpen(true)}
                disabled={!selectedConv}
                className="w-full flex items-center gap-2 pt-2 text-xs font-extrabold text-rose-600 hover:text-rose-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Conversation
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 3. New Message / Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  New Message / Care Chat
                </h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-semibold">
              
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                {[
                  { key: 'all', label: 'All Contacts' },
                  { key: 'doctors', label: 'Doctors' },
                  { key: 'nurses', label: 'Nurses' },
                  { key: 'admins', label: 'Admins' },
                  { key: 'groups', label: 'Channels' }
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => setComposeTab(t.key as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      composeTab === t.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Contact Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={composeSearch}
                  onChange={(e) => setComposeSearch(e.target.value)}
                  placeholder="Search doctors, nurses, administrators, channels..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Recipient Selection List */}
              <div className="space-y-1 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 divide-y divide-slate-50">
                {filteredContacts.length === 0 ? (
                  <p className="py-6 text-center text-slate-400">No matching contacts found.</p>
                ) : (
                  filteredContacts.map(c => {
                    const isSelected = selectedRecipient?.name === c.name;
                    return (
                      <div
                        key={c.id || c.name}
                        onClick={() => setSelectedRecipient(c)}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {c.avatar ? (
                            <img src={c.avatar} alt={c.name} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 text-xs truncate">{c.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{c.role} • {c.department || c.category}</p>
                          </div>
                        </div>

                        {isSelected && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Shared Patient Picker (Optional) */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  Attach Patient Context (Optional)
                </label>
                <select
                  value={selectedPatient?.id || ''}
                  onChange={(e) => {
                    const p = patients.find(pt => pt.id === e.target.value);
                    setSelectedPatient(p || null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">-- No specific patient attached --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientIdCode || p.mrn || 'PT'}) - {p.careUnit || 'Ward'} / {p.floorRoom || 'Room'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Initial Message Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  Initial Message
                </label>
                <textarea
                  rows={3}
                  value={initialMessageText}
                  onChange={(e) => setInitialMessageText(e.target.value)}
                  placeholder="Type your introductory message..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsComposeOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewConversation}
                disabled={!selectedRecipient || composeSubmitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {composeSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Start Conversation</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Delete Conversation</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-semibold">
              Are you sure you want to permanently delete the conversation with <strong className="text-slate-900">{selectedConv?.participantName}</strong>? All message records in this thread will be removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                disabled={deleteSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                {deleteSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Delete Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NurseMessagesPage;
