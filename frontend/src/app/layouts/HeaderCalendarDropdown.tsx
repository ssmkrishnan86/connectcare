import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Stethoscope, CheckSquare, Activity, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface CalendarEventItem {
  id: string;
  title: string;
  type: string;
  time: string;
  dateText: string;
  patientName: string;
  providerOrAssignee: string;
  location: string;
  status: string;
  priority: string;
}

interface HeaderCalendarDropdownProps {
  onClose: () => void;
}

export const HeaderCalendarDropdown: React.FC<HeaderCalendarDropdownProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const currentDate = new Date();

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate mini 7-day strip centered around today
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(currentDate.getDate() - 3 + i);
    return {
      dayName: daysOfWeek[d.getDay()],
      dayNumber: d.getDate(),
      isToday: d.getDate() === currentDate.getDate(),
      fullDate: d,
    };
  });

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await fetchApi('/api/calendar/events');
      const data = res?.data || res;
      if (data && Array.isArray(data.events)) {
        setEvents(data.events);
        setTodayCount(data.todayCount ?? data.events.length);
      } else if (Array.isArray(data)) {
        setEvents(data);
        setTodayCount(data.length);
      } else {
        setEvents([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch calendar events:', err);
      setError(err?.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getEventIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'consultation':
        return <Stethoscope className="h-4 w-4 text-indigo-600 shrink-0" />;
      case 'task':
        return <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />;
      case 'vital round':
        return <Activity className="h-4 w-4 text-sky-600 shrink-0" />;
      default:
        return <CalendarIcon className="h-4 w-4 text-slate-500 shrink-0" />;
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden text-slate-800 font-sans animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Schedule & Events</h3>
          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold">
            {todayCount} scheduled
          </span>
        </div>
        <span className="text-[11px] font-bold text-slate-500">{monthName}</span>
      </div>

      {/* Mini 7-Day Selector Strip */}
      <div className="px-3 py-2 bg-slate-900 text-white flex items-center justify-between gap-1 border-b border-slate-800">
        {weekDays.map(item => (
          <button
            key={item.dayNumber}
            onClick={() => setSelectedDay(item.dayNumber)}
            className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              selectedDay === item.dayNumber
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : item.isToday
                ? 'bg-slate-800 text-indigo-300 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.dayName}</span>
            <span className="text-xs font-extrabold">{item.dayNumber}</span>
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Loading schedule...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-xs font-semibold text-rose-600 mb-2">{error}</p>
            <button
              onClick={loadEvents}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-semibold">No scheduled events for this date</p>
          </div>
        ) : (
          events.map(ev => (
            <div
              key={ev.id}
              onClick={() => {
                onClose();
                if (ev.type?.toLowerCase() === 'consultation') {
                  navigate('/consultations');
                } else if (ev.type?.toLowerCase() === 'task') {
                  navigate('/tasks');
                } else {
                  navigate('/care-teams');
                }
              }}
              className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-slate-100 mt-0.5">{getEventIcon(ev.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{ev.title}</h4>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border shrink-0 ${getPriorityBadgeClass(
                      ev.priority
                    )}`}
                  >
                    {ev.status || ev.priority}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium mb-1">
                  <span className="flex items-center gap-1 font-bold text-indigo-600">
                    <Clock className="h-3 w-3" />
                    {ev.time}
                  </span>
                  <span>•</span>
                  <span className="truncate">{ev.patientName}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span className="truncate">{ev.providerOrAssignee}</span>
                  <span className="truncate">{ev.location}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
        <button
          onClick={() => {
            onClose();
            navigate('/consultations');
          }}
          className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          Consultations
        </button>
        <button
          onClick={() => {
            onClose();
            navigate('/care-teams');
          }}
          className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          Full Schedule →
        </button>
      </div>
    </div>
  );
};
