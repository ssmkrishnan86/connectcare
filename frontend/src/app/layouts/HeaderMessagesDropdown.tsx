import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, MessageSquare, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { setMessagesCount } from '@/store/slices/uiSlice';

interface ConversationItem {
  id: string;
  participantName: string;
  participantRole: string;
  participantAvatar: string;
  isOnline: boolean;
  lastMessageText: string;
  lastMessageTimeText: string;
  unreadCount: number;
  isGroup: boolean;
  category: string;
}

interface HeaderMessagesDropdownProps {
  onClose: () => void;
}

export const HeaderMessagesDropdown: React.FC<HeaderMessagesDropdownProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await fetchApi('/messages/conversations');
      const dataArray = Array.isArray(res) ? res : res?.data;
      if (Array.isArray(dataArray)) {
        setConversations(dataArray);
        const count = res?.unreadCount ?? dataArray.reduce((acc: number, c: ConversationItem) => acc + (c.unreadCount || 0), 0);
        setUnreadCount(count);
        dispatch(setMessagesCount(count));
      } else {
        setConversations([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      setError(err?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden text-slate-800 font-sans animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Messages & Care Chat</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Loading conversations...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-xs font-semibold text-rose-600 mb-2">{error}</p>
            <button
              onClick={loadMessages}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-semibold">No recent messages</p>
          </div>
        ) : (
          conversations.map(c => (
            <div
              key={c.id}
              onClick={() => {
                onClose();
                navigate('/messages');
              }}
              className={`p-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                c.unreadCount > 0 ? 'bg-indigo-50/30' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {c.participantAvatar ? (
                  <img
                    src={c.participantAvatar}
                    alt={c.participantName}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {c.participantName ? c.participantName.substring(0, 2).toUpperCase() : 'CC'}
                  </div>
                )}
                {c.isOnline && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>

              {/* Message Summary */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{c.participantName}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">{c.lastMessageTimeText}</span>
                </div>
                <p className="text-xs text-slate-500 truncate leading-tight mb-1">{c.participantRole}</p>
                <p className="text-xs text-slate-700 truncate leading-snug">{c.lastMessageText}</p>
              </div>

              {/* Unread Badge */}
              {c.unreadCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
        <button
          onClick={() => {
            onClose();
            navigate('/messages');
          }}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          View All Messages →
        </button>
      </div>
    </div>
  );
};
