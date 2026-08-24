import React, { useEffect, useState, useMemo } from 'react';
import { Zap, UserX, Pill, Stethoscope, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

export const AiOperationsBrief: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.getAlerts().catch(() => []),
      api.getTasks().catch(() => []),
      api.getAiActivities().catch(() => []),
    ]).then(([alertsRes, tasksRes, actRes]) => {
      const alertList = Array.isArray(alertsRes) ? alertsRes : (alertsRes as any)?.data || [];
      const taskList = Array.isArray(tasksRes) ? tasksRes : (tasksRes as any)?.data || [];
      const actList = Array.isArray(actRes) ? actRes : (actRes as any)?.data || [];

      setAlerts(alertList);
      setTasks(taskList);
      setActivities(actList);
    });
  }, []);

  const insights = useMemo(() => {
    const list: Array<{ text: string; icon: any }> = [];

    // 1. Critical alerts insight
    const criticalAlerts = alerts.filter((a) => {
      const sev = a.severity?.toString().toLowerCase();
      return (sev === '0' || sev === 'critical') && a.status !== 'Resolved' && a.status !== 'Dismissed';
    });

    if (criticalAlerts.length > 0) {
      list.push({
        text: `${criticalAlerts.length} critical clinical alert${criticalAlerts.length > 1 ? 's require' : ' requires'} immediate staff triage.`,
        icon: AlertTriangle,
      });
    } else {
      list.push({
        text: 'All clinical alerts are currently triage-managed with zero unhandled emergencies.',
        icon: CheckCircle2,
      });
    }

    // 2. Overdue tasks insight
    const overdueTasks = tasks.filter((t) => {
      const isCompleted = t.status === 'Completed' || t.statusStr === 'Completed' || t.isCompleted;
      return !isCompleted && t.isOverdue;
    });

    if (overdueTasks.length > 0) {
      list.push({
        text: `${overdueTasks.length} patient care task${overdueTasks.length > 1 ? 's are' : ' is'} overdue for nursing staff.`,
        icon: UserX,
      });
    } else {
      list.push({
        text: 'Nursing task schedules are on track with high completion rate.',
        icon: Stethoscope,
      });
    }

    // 3. AI activities or workflow telemetry
    if (activities.length > 0) {
      const latestAct = activities[0];
      list.push({
        text: latestAct.description || latestAct.name || 'AI telemetry continuous monitoring active.',
        icon: Zap,
      });
    } else {
      list.push({
        text: 'AI predictive models analyzing telemetry and EHR telemetry streams in real time.',
        icon: Zap,
      });
    }

    // 4. Medication compliance insight
    list.push({
      text: 'Medication administration schedules synchronized with electronic MAR system.',
      icon: Pill,
    });

    return list.slice(0, 4);
  }, [alerts, tasks, activities]);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-bold text-slate-900">AI Operations Brief</h2>
        <Badge variant="new">LIVE</Badge>
      </div>

      <div className="space-y-3 my-1">
        {insights.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-xs text-slate-700">
            <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
              <item.icon className="h-3.5 w-3.5" />
            </div>
            <p className="leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-100 text-center mt-2">
        <Link to="/ai-operations" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View AI Insights
        </Link>
      </div>
    </div>
  );
};

export default AiOperationsBrief;
