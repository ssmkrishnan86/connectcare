import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useLocalization } from '@/features/localization/context/LocalizationContext';
import {
  Search,
  AlertTriangle,
  Activity,
  Pill,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  AlertCircle,
  Clock,
  RefreshCw,
  Trash2,
  CheckCheck,
  XCircle,
  Loader2,
  Eye,
  MoreVertical,
  FileEdit,
  Send,
  ArrowUpRight,
  User,
  ChevronDown,
  X,
  Monitor,
  Info,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { AlertCreateModal } from '../components/AlertCreateModal';
import { DatePickerInput } from '@/components/common/DatePickerInput';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatDate } = useLocalization();
  const confirm = useConfirm();


  const [alerts, setAlerts] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [activeTab, setActiveTab] = useState('All Alerts');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [careUnitFilter, setCareUnitFilter] = useState('All');
  const [patientFilter, setPatientFilter] = useState('All');
  const [alertTypeFilter, setAlertTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Drawers State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [isDetailDrawerCollapsed, setIsDetailDrawerCollapsed] = useState(false);

  // 3-Dots Dropdown Menu State
  const [openMenuAlertId, setOpenMenuAlertId] = useState<string | null>(null);
  const [openStatusDropdownAlertId, setOpenStatusDropdownAlertId] = useState<string | null>(null);

  // Quick Action Modal States
  const [addNoteModalAlert, setAddNoteModalAlert] = useState<any | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const [escalateModalAlert, setEscalateModalAlert] = useState<any | null>(null);
  const [escalateReason, setEscalateReason] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);

  const [notifyModalAlert, setNotifyModalAlert] = useState<any | null>(null);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);

  const [resolveModalAlert, setResolveModalAlert] = useState<any | null>(null);
  const [resolutionNoteInput, setResolutionNoteInput] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Selected Checkbox IDs for Bulk Actions
  const [selectedAlertIds, setSelectedAlertIds] = useState<Record<string, boolean>>({});
  const [isBulkActionRunning, setIsBulkActionRunning] = useState(false);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch Alerts & Patients from Database
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const nurseIdParam = user?.role === 'Nurse' ? user?.nurseId : undefined;
      const doctorIdParam = user?.role === 'Doctor' ? user?.doctorId : undefined;

      const [alertData, patientData] = await Promise.all([
        api.getAlerts({ nurseId: nurseIdParam, doctorId: doctorIdParam }),
        api.getPatients(undefined, undefined, undefined, doctorIdParam, nurseIdParam).catch(() => []),
      ]);

      const alertList = Array.isArray(alertData) ? alertData : (alertData as any)?.data || [];
      const patientList = Array.isArray(patientData) ? patientData : (patientData as any)?.data || [];

      setAlerts(alertList);
      if (patientList && patientList.length > 0) {
        setPatients(patientList);
      }

      if (alertList.length > 0) {
        if (!selectedAlert || !alertList.some((a: any) => a.id === selectedAlert.id)) {
          setSelectedAlert(alertList[0]);
        } else {
          const fresh = alertList.find((a: any) => a.id === selectedAlert.id);
          if (fresh) setSelectedAlert(fresh);
        }
      }
    } catch (err) {
      console.error('Failed to fetch alerts from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user?.nurseId, user?.doctorId]);

  // Close 3-dots menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenuAlertId(null);
      setOpenStatusDropdownAlertId(null);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // --- Quick Action Handlers ---

  // 1. Acknowledge Alert
  const handleAcknowledge = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.acknowledgeAlert(id, 'Attending Staff');
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: 'Acknowledged',
                isAcknowledged: true,
                acknowledgedBy: 'Attending Staff',
                acknowledgedDate: new Date().toISOString(),
              }
            : a
        )
      );
      if (selectedAlert?.id === id) {
        setSelectedAlert((prev: any) => ({
          ...prev,
          status: 'Acknowledged',
          isAcknowledged: true,
          acknowledgedBy: 'Attending Staff',
          acknowledgedDate: new Date().toISOString(),
        }));
      }
      showToast('Alert Acknowledged', 'Status updated to Acknowledged and logged to patient chart.');
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      showToast('Action Failed', 'Could not acknowledge alert.', 'error');
    }
  };

  // 2. Add Note Handler
  const handleOpenAddNote = (alert: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAddNoteModalAlert(alert);
    setNewNoteText('');
  };

  const handleSaveNote = async () => {
    if (!addNoteModalAlert || !newNoteText.trim()) return;
    setIsSavingNote(true);
    try {
      await api.addAlertNote(addNoteModalAlert.id, newNoteText.trim(), 'Attending Staff');
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newEntry = `[${timestamp} - Attending Staff]: ${newNoteText.trim()}`;

      setAlerts((prev) =>
        prev.map((a) =>
          a.id === addNoteModalAlert.id
            ? {
                ...a,
                notes: a.notes ? `${a.notes}\n${newEntry}` : newEntry,
              }
            : a
        )
      );
      if (selectedAlert?.id === addNoteModalAlert.id) {
        setSelectedAlert((prev: any) => ({
          ...prev,
          notes: prev.notes ? `${prev.notes}\n${newEntry}` : newEntry,
        }));
      }
      setAddNoteModalAlert(null);
      setNewNoteText('');
      showToast('Note Added', 'Clinical progress note saved to alert record.');
    } catch (err) {
      console.error('Failed to add note:', err);
      showToast('Action Failed', 'Could not add note.', 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  // 3. Notify Care Team Handler
  const handleOpenNotifyModal = (alert: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifyModalAlert(alert);
    setNotifyMessage(
      `URGENT: Care team notification for ${alert.patientName} (${alert.roomLocation || alert.careUnit}) regarding '${alert.title}'.`
    );
  };

  const handleSendCareTeamNotification = async () => {
    if (!notifyModalAlert) return;
    setIsNotifying(true);
    try {
      await api.notifyCareTeam(notifyModalAlert.id, notifyMessage, 'Clinical Coordinator');
      const noteEntry = `[CARE TEAM DISPATCH - ${new Date().toLocaleTimeString()}]: Notification dispatched to on-duty nurses & physicians.`;
      
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === notifyModalAlert.id
            ? {
                ...a,
                notes: a.notes ? `${a.notes}\n${noteEntry}` : noteEntry,
              }
            : a
        )
      );
      if (selectedAlert?.id === notifyModalAlert.id) {
        setSelectedAlert((prev: any) => ({
          ...prev,
          notes: prev.notes ? `${prev.notes}\n${noteEntry}` : noteEntry,
        }));
      }
      setNotifyModalAlert(null);
      showToast('Care Team Notified', 'Push notification and SMS broadcast sent to attending team.');
    } catch (err) {
      console.error('Failed to notify care team:', err);
      showToast('Notification Failed', 'Could not dispatch notification.', 'error');
    } finally {
      setIsNotifying(false);
    }
  };

  // 4. Escalate Alert Handler
  const handleOpenEscalateModal = (alert: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEscalateModalAlert(alert);
    setEscalateReason('Condition Deteriorating');
  };

  const handleConfirmEscalation = async () => {
    if (!escalateModalAlert) return;
    setIsEscalating(true);
    try {
      await api.escalateAlert(escalateModalAlert.id, escalateReason, 'Attending Staff');
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === escalateModalAlert.id
            ? {
                ...a,
                severity: 'Critical',
                status: 'In Progress',
                isAcknowledged: true,
              }
            : a
        )
      );
      if (selectedAlert?.id === escalateModalAlert.id) {
        setSelectedAlert((prev: any) => ({
          ...prev,
          severity: 'Critical',
          status: 'In Progress',
          isAcknowledged: true,
        }));
      }
      setEscalateModalAlert(null);
      showToast('Alert Escalated', 'Severity upgraded to Critical. On-call physician paged.');
    } catch (err) {
      console.error('Failed to escalate alert:', err);
      showToast('Escalation Failed', 'Could not escalate alert.', 'error');
    } finally {
      setIsEscalating(false);
    }
  };

  // 5. Update Status Directly
  const handleUpdateStatus = async (alertId: string, newStatus: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.updateAlertStatus(alertId, newStatus, 'Attending Staff');
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? {
                ...a,
                status: newStatus,
                isAcknowledged: newStatus === 'Acknowledged' || newStatus === 'Resolved' ? true : a.isAcknowledged,
              }
            : a
        )
      );
      if (selectedAlert?.id === alertId) {
        setSelectedAlert((prev: any) => ({
          ...prev,
          status: newStatus,
          isAcknowledged: newStatus === 'Acknowledged' || newStatus === 'Resolved' ? true : prev.isAcknowledged,
        }));
      }
      setOpenStatusDropdownAlertId(null);
      showToast('Status Updated', `Alert status marked as ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Update Failed', 'Could not update status.', 'error');
    }
  };

  // 6. Resolve Alert Handler
  const handleOpenResolveModal = (alert: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setResolveModalAlert(alert);
    setResolutionNoteInput(alert.resolutionNotes || '');
  };

  const handleConfirmResolve = async () => {
    if (!resolveModalAlert) return;
    setIsResolving(true);
    try {
      await api.resolveAlert(resolveModalAlert.id, resolutionNoteInput, 'Attending Staff');
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === resolveModalAlert.id
            ? {
                ...a,
                status: 'Resolved',
                isAcknowledged: true,
                resolvedBy: 'Attending Staff',
                resolvedDate: new Date().toISOString(),
                resolutionNotes: resolutionNoteInput,
              }
            : a
        )
      );
      if (selectedAlert?.id === resolveModalAlert.id) {
        setSelectedAlert((prev: any) => ({
          ...prev,
          status: 'Resolved',
          isAcknowledged: true,
          resolvedBy: 'Attending Staff',
          resolvedDate: new Date().toISOString(),
          resolutionNotes: resolutionNoteInput,
        }));
      }
      setResolveModalAlert(null);
      setResolutionNoteInput('');
      showToast('Alert Resolved', 'Incident marked as Resolved with resolution notes saved.');
    } catch (err) {
      console.error('Failed to resolve alert:', err);
      showToast('Resolution Failed', 'Could not resolve alert.', 'error');
    } finally {
      setIsResolving(false);
    }
  };

  // 7. Dismiss Alert
  const handleDismiss = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.dismissAlert(id, 'Dismissed non-actionable alert', 'Attending Staff');
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: 'Dismissed',
                isAcknowledged: true,
                resolvedBy: 'Attending Staff',
                resolvedDate: new Date().toISOString(),
              }
            : a
        )
      );
      if (selectedAlert?.id === id) {
        setSelectedAlert((prev: any) => ({
          ...prev,
          status: 'Dismissed',
          isAcknowledged: true,
        }));
      }
      showToast('Alert Dismissed', 'Alert dismissed from active monitoring.');
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  // 8. Delete Alert
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const confirmed = await confirm({
      title: 'Delete Alert Record',
      message: 'Are you sure you want to permanently delete this alert record?',
      confirmText: 'Delete Alert',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.deleteAlert(id);
      const remaining = alerts.filter((a) => a.id !== id);
      setAlerts(remaining);
      if (selectedAlert?.id === id) {
        setSelectedAlert(remaining.length > 0 ? remaining[0] : null);
      }
      showToast('Alert Deleted', 'Alert record was removed.');
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  // Bulk Actions
  const selectedCount = useMemo(() => {
    return Object.values(selectedAlertIds).filter(Boolean).length;
  }, [selectedAlertIds]);

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const newSelected: Record<string, boolean> = {};
    filteredAlerts.forEach((a) => {
      newSelected[a.id] = checked;
    });
    setSelectedAlertIds(newSelected);
  };

  const toggleSelectAlert = (id: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    setSelectedAlertIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBulkAction = async (action: 'acknowledge' | 'resolve' | 'dismiss' | 'escalate') => {
    const ids = Object.keys(selectedAlertIds).filter((id) => selectedAlertIds[id]);
    if (ids.length === 0) return;

    setIsBulkActionRunning(true);
    try {
      await api.bulkAlertAction(action, ids, `Bulk ${action} applied`, 'Attending Staff');
      await fetchAlerts();
      setSelectedAlertIds({});
      showToast('Bulk Action Applied', `Successfully updated ${ids.length} alerts.`);
    } catch (err) {
      console.error(`Bulk ${action} failed:`, err);
      showToast('Bulk Action Failed', 'Could not process bulk action.', 'error');
    } finally {
      setIsBulkActionRunning(false);
    }
  };

  const resetAllFilters = () => {
    setSearch('');
    setSelectedDate('');
    setCareUnitFilter('All');
    setPatientFilter('All');
    setAlertTypeFilter('All');
    setStatusFilter('All');
    setActiveTab('All Alerts');
    setCurrentPage(1);
  };

  const getNormalizedSeverity = (sev: any): string => {
    if (sev === undefined || sev === null) return 'Medium';
    const str = sev.toString().toLowerCase();
    if (str === '0' || str === 'critical') return 'Critical';
    if (str === '1' || str === 'high') return 'High';
    if (str === '2' || str === 'medium') return 'Medium';
    if (str === '3' || str === 'low' || str === 'information') return 'Information';
    return 'Medium';
  };

  // KPI Calculations (Live from DB)
  const criticalCount = useMemo(
    () => alerts.filter((a) => getNormalizedSeverity(a.severity) === 'Critical' && a.status !== 'Resolved' && a.status !== 'Dismissed').length,
    [alerts]
  );
  const highCount = useMemo(
    () => alerts.filter((a) => getNormalizedSeverity(a.severity) === 'High' && a.status !== 'Resolved' && a.status !== 'Dismissed').length,
    [alerts]
  );
  const mediumCount = useMemo(
    () => alerts.filter((a) => getNormalizedSeverity(a.severity) === 'Medium' && a.status !== 'Resolved' && a.status !== 'Dismissed').length,
    [alerts]
  );
  const infoCount = useMemo(
    () => alerts.filter((a) => getNormalizedSeverity(a.severity) === 'Information' && a.status !== 'Resolved' && a.status !== 'Dismissed').length,
    [alerts]
  );
  const resolvedCount = useMemo(
    () => alerts.filter((a) => a.status === 'Resolved' || a.status === 'Dismissed').length,
    [alerts]
  );

  // Time Formatter for Table Row
  const formatTimeDisplay = (alert: any) => {
    let timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    let relativeStr = alert.timestampText || 'Just now';

    if (alert.createdDate) {
      try {
        const d = new Date(alert.createdDate);
        if (!isNaN(d.getTime())) {
          timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          
          const now = new Date().getTime();
          const diffMins = Math.floor((now - d.getTime()) / (1000 * 60));
          if (diffMins < 2) relativeStr = 'Just now';
          else if (diffMins < 60) relativeStr = `${diffMins} mins ago`;
          else if (diffMins < 1440) relativeStr = `${Math.floor(diffMins / 60)} hour ago`;
          else relativeStr = formatDate(alert.createdDate);
        }
      } catch (e) {
        console.error(e);
      }
    }

    return { timeStr, relativeStr };
  };

  // Filtered List
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      // 1. Tab filter
      const normSev = getNormalizedSeverity(a.severity);
      if (activeTab === 'Critical' && (normSev !== 'Critical' || a.status === 'Resolved' || a.status === 'Dismissed')) return false;
      if (activeTab === 'High' && (normSev !== 'High' || a.status === 'Resolved' || a.status === 'Dismissed')) return false;
      if (activeTab === 'Medium' && (normSev !== 'Medium' || a.status === 'Resolved' || a.status === 'Dismissed')) return false;
      if (activeTab === 'Information' && (normSev !== 'Information' || a.status === 'Resolved' || a.status === 'Dismissed')) return false;
      if (activeTab === 'Resolved' && a.status !== 'Resolved' && a.status !== 'Dismissed') return false;


      // 2. Date filter
      if (selectedDate && a.createdDate) {
        try {
          const alertDateISO = new Date(a.createdDate).toISOString().substring(0, 10);
          if (alertDateISO !== selectedDate) return false;
        } catch (e) {}
      }

      // 3. Care Unit filter
      if (careUnitFilter !== 'All') {
        const unit = (a.careUnit || a.roomLocation || '').toLowerCase();
        if (!unit.includes(careUnitFilter.toLowerCase())) return false;
      }

      // 4. Patient filter
      if (patientFilter !== 'All') {
        if (a.patientId !== patientFilter && a.patientName !== patientFilter) {
          return false;
        }
      }

      // 5. Alert Category filter
      if (alertTypeFilter !== 'All' && (a.type || '').toLowerCase() !== alertTypeFilter.toLowerCase()) {
        return false;
      }

      // 6. Status filter
      if (statusFilter !== 'All' && (a.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // 7. Search query
      if (search) {
        const query = search.toLowerCase();
        const matchTitle = (a.title || a.triggerCondition || '').toLowerCase().includes(query);
        const matchPatient = (a.patientName || a.patientIdCode || '').toLowerCase().includes(query);
        const matchCode = (a.alertIdCode || '').toLowerCase().includes(query);
        const matchDesc = (a.description || '').toLowerCase().includes(query);
        if (!matchTitle && !matchPatient && !matchCode && !matchDesc) return false;
      }

      return true;
    });
  }, [alerts, activeTab, selectedDate, careUnitFilter, patientFilter, alertTypeFilter, statusFilter, search]);

  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAlerts.slice(start, start + pageSize);
  }, [filteredAlerts, currentPage]);

  const totalPages = Math.ceil(filteredAlerts.length / pageSize) || 1;

  // Severity Badges Helper
  const getSeverityBadge = (severity: string) => {
    const sev = getNormalizedSeverity(severity);
    if (sev === 'Critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
          Critical
        </span>
      );
    }
    if (sev === 'High') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
          High
        </span>
      );
    }
    if (sev === 'Medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200">
        Information
      </span>
    );
  };

  // Status Badges Helper
  const getStatusBadge = (status: string) => {
    if (status === 'New' || status === 'Open') {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
          New
        </span>
      );
    }
    if (status === 'Acknowledged') {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-50 text-blue-600 border border-blue-200">
          Acknowledged
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-purple-50 text-purple-600 border border-purple-200">
          In Progress
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200">
          Pending
        </span>
      );
    }
    if (status === 'Dismissed') {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
          Dismissed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200">
        Resolved
      </span>
    );
  };

  // Category Pill Helper
  const getTypePill = (type: string) => {
    switch (type) {
      case 'Vital Signs':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Activity className="h-3.5 w-3.5 text-rose-500" /> Vital Signs
          </span>
        );
      case 'Medication':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Pill className="h-3.5 w-3.5 text-indigo-500" /> Medication
          </span>
        );
      case 'Patient Safety':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Patient Safety
          </span>
        );
      case 'Equipment':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Monitor className="h-3.5 w-3.5 text-blue-500" /> Equipment
          </span>
        );
      case 'Lab Result':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <FlaskConical className="h-3.5 w-3.5 text-purple-500" /> Lab Result
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <AlertCircle className="h-3.5 w-3.5 text-slate-400" /> {type || 'Clinical Alert'}
          </span>
        );
    }
  };

  // Patient Initials Helper
  const getPatientInitials = (name: string) => {
    if (!name) return 'PT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto select-none font-sans text-slate-800 relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-top-4">
          <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{toastMessage.title}</p>
            <p className="text-[11px] text-slate-300 font-medium">{toastMessage.desc}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Alerts"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Alerts' },
          ]}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAlerts}
            title="Refresh alerts"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>New Alert</span>
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 overflow-x-auto">
        {[
          { label: 'All Alerts', count: alerts.length },
          { label: 'Critical', count: criticalCount, isAlert: criticalCount > 0 },
          { label: 'High', count: highCount },
          { label: 'Medium', count: mediumCount },
          { label: 'Information', count: infoCount },
          { label: 'Resolved', count: resolvedCount },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => {
              setActiveTab(tab.label);
              setCurrentPage(1);
            }}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === tab.label
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                tab.isAlert
                  ? 'bg-rose-100 text-rose-700 font-black'
                  : 'bg-slate-100 text-slate-600 font-bold'
              }`}
            >
              {tab.count}
            </span>
            {activeTab === tab.label && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Stat Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Critical Alerts */}
        <div className="bg-rose-50/40 p-4.5 rounded-2xl border border-rose-200/70 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0 relative">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-600 animate-ping"></span>
            )}
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 leading-none">{criticalCount}</p>
            <p className="text-xs font-extrabold text-slate-900 mt-1">Critical Alerts</p>
            <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Require immediate action</p>
          </div>
        </div>

        {/* High Alerts */}
        <div className="bg-amber-50/40 p-4.5 rounded-2xl border border-amber-200/70 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 leading-none">{highCount}</p>
            <p className="text-xs font-extrabold text-slate-900 mt-1">High Alerts</p>
            <p className="text-[11px] font-semibold text-amber-600 mt-0.5">Need attention soon</p>
          </div>
        </div>

        {/* Medium Alerts */}
        <div className="bg-amber-50/20 p-4.5 rounded-2xl border border-amber-200/50 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-100/70 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Clock className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 leading-none">{mediumCount}</p>
            <p className="text-xs font-extrabold text-slate-900 mt-1">Medium Alerts</p>
            <p className="text-[11px] font-semibold text-amber-700 mt-0.5">Monitor closely</p>
          </div>
        </div>

        {/* Information */}
        <div className="bg-blue-50/40 p-4.5 rounded-2xl border border-blue-200/70 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Info className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 leading-none">{infoCount}</p>
            <p className="text-xs font-extrabold text-slate-900 mt-1">Information</p>
            <p className="text-[11px] font-semibold text-blue-600 mt-0.5">For your awareness</p>
          </div>
        </div>
      </div>

      {/* 4. Complete Filter Toolbar */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52 sm:w-60"
              />
            </div>

            {/* Date Filter */}
            <div className="w-44">
              <DatePickerInput
                value={selectedDate}
                onChange={(val) => {
                  setSelectedDate(val);
                  setCurrentPage(1);
                }}
                placeholder="Pick date..."
              />
            </div>

            {/* Care Unit Filter */}
            <select
              value={careUnitFilter}
              onChange={(e) => {
                setCareUnitFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="All">All Care Units</option>
              <option value="Cardiology Unit">Cardiology Unit</option>
              <option value="Med-Surg Unit 1">Med-Surg Unit 1</option>
              <option value="Pulmonology Unit">Pulmonology Unit</option>
              <option value="Intensive Care Unit (ICU)">Intensive Care (ICU)</option>
              <option value="Emergency Department">Emergency Department</option>
              <option value="Neurology Unit">Neurology Unit</option>
              <option value="General Ward">General Ward</option>
            </select>

            {/* Patient Filter */}
            <select
              value={patientFilter}
              onChange={(e) => {
                setPatientFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="All">All Patients</option>
              {patients.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Alert Types Filter */}
            <select
              value={alertTypeFilter}
              onChange={(e) => {
                setAlertTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="All">All Alert Types</option>
              <option value="Vital Signs">Vital Signs</option>
              <option value="Patient Safety">Patient Safety</option>
              <option value="Medication">Medication</option>
              <option value="Equipment">Equipment</option>
              <option value="Lab Result">Lab Result</option>
              <option value="Care Plan">Care Plan</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Dismissed">Dismissed</option>
            </select>

            {/* Filters Reset Button */}
            {(search || selectedDate || careUnitFilter !== 'All' || patientFilter !== 'All' || alertTypeFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-slate-500">
            Showing <strong className="text-slate-900">{filteredAlerts.length}</strong> alerts
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 px-4 py-2.5 rounded-xl shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono">
                {selectedCount}
              </span>
              <span>alerts selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={isBulkActionRunning}
                onClick={() => handleBulkAction('acknowledge')}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Bulk Acknowledge</span>
              </button>
              <button
                disabled={isBulkActionRunning}
                onClick={() => handleBulkAction('resolve')}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Bulk Resolve</span>
              </button>
              <button
                disabled={isBulkActionRunning}
                onClick={() => handleBulkAction('escalate')}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>Bulk Escalate</span>
              </button>
              <button
                disabled={isBulkActionRunning}
                onClick={() => handleBulkAction('dismiss')}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors cursor-pointer"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Bulk Dismiss</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Master-Detail Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Alerts Table (7 or 8 cols depending on sidebar) */}
        <div className={`${isDetailDrawerCollapsed ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4`}>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-visible">
            {loading ? (
              <div className="p-16 text-center text-xs font-bold text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <span>Loading clinical alerts...</span>
              </div>
            ) : paginatedAlerts.length === 0 ? (
              <div className="p-16 text-center text-xs font-bold text-slate-400 flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-slate-300" />
                <span>No alerts found matching filter criteria.</span>
                <button
                  onClick={resetAllFilters}
                  className="mt-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto min-h-[350px]">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-3 w-8">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={
                            filteredAlerts.length > 0 &&
                            filteredAlerts.every((a) => selectedAlertIds[a.id])
                          }
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-3.5 px-3">ALERT</th>
                      <th className="py-3.5 px-3">PATIENT</th>
                      <th className="py-3.5 px-3">ALERT TYPE</th>
                      <th className="py-3.5 px-3">SEVERITY</th>
                      <th className="py-3.5 px-3">TIME</th>
                      <th className="py-3.5 px-3">STATUS</th>
                      <th className="py-3.5 px-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedAlerts.map((alert) => {
                      const isSelected = selectedAlert?.id === alert.id;
                      const isChecked = Boolean(selectedAlertIds[alert.id]);
                      const isMenuOpen = openMenuAlertId === alert.id;
                      const { timeStr, relativeStr } = formatTimeDisplay(alert);
                      const normSev = getNormalizedSeverity(alert.severity);

                      return (
                        <tr
                          key={alert.id}
                          onClick={() => setSelectedAlert(alert)}
                          className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50/30' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => toggleSelectAlert(alert.id, e)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>

                          {/* Alert & Trigger */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                  normSev === 'Critical'
                                    ? 'bg-rose-100 text-rose-600'
                                    : normSev === 'High'
                                    ? 'bg-amber-100 text-amber-600'
                                    : normSev === 'Medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-blue-100 text-blue-600'
                                }`}
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-900 text-xs line-clamp-1">
                                  {alert.title}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                                  {alert.triggerCondition || alert.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Patient */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[11px] shrink-0 border border-indigo-200">
                                {getPatientInitials(alert.patientName)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                  {alert.patientName || 'Patient'}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  {alert.roomLocation || alert.careUnit || 'Cardiology Unit'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Alert Type */}
                          <td className="py-3.5 px-3">{getTypePill(alert.type)}</td>

                          {/* Severity */}
                          <td className="py-3.5 px-3">{getSeverityBadge(alert.severity)}</td>

                          {/* Time */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900 text-xs">{timeStr}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{relativeStr}</p>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3">{getStatusBadge(alert.status)}</td>

                          {/* Action Buttons & 3 Dots Menu */}
                          <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5 relative">
                              
                              {/* Eye Button (Select & View Detail) */}
                              <button
                                onClick={() => {
                                  setSelectedAlert(alert);
                                  setIsDetailDrawerCollapsed(false);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                                title="View Alert Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {/* 3 Dots Menu Button */}
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuAlertId(isMenuOpen ? null : alert.id);
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    isMenuOpen
                                      ? 'bg-slate-200 text-slate-900'
                                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                  }`}
                                  title="More Actions"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>

                                {/* 3-Dots Action Dropdown Menu */}
                                {isMenuOpen && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 font-sans"
                                  >
                                    {/* View Details */}
                                    <button
                                      onClick={() => {
                                        setSelectedAlert(alert);
                                        setIsDetailDrawerCollapsed(false);
                                        setOpenMenuAlertId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                                      <span>View Details</span>
                                    </button>

                                    {/* Acknowledge Alert */}
                                    {!alert.isAcknowledged && alert.status !== 'Resolved' && (
                                      <button
                                        onClick={(e) => {
                                          handleAcknowledge(alert.id, e);
                                          setOpenMenuAlertId(null);
                                        }}
                                        className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors cursor-pointer"
                                      >
                                        <CheckCheck className="h-3.5 w-3.5 text-indigo-500" />
                                        <span>Acknowledge Alert</span>
                                      </button>
                                    )}

                                    {/* Add Note */}
                                    <button
                                      onClick={(e) => {
                                        handleOpenAddNote(alert, e);
                                        setOpenMenuAlertId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <FileEdit className="h-3.5 w-3.5 text-slate-400" />
                                      <span>Add Note</span>
                                    </button>

                                    {/* Notify Care Team */}
                                    <button
                                      onClick={(e) => {
                                        handleOpenNotifyModal(alert, e);
                                        setOpenMenuAlertId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Send className="h-3.5 w-3.5 text-blue-500" />
                                      <span>Notify Care Team</span>
                                    </button>

                                    {/* Escalate Alert */}
                                    {alert.severity !== 'Critical' && (
                                      <button
                                        onClick={(e) => {
                                          handleOpenEscalateModal(alert, e);
                                          setOpenMenuAlertId(null);
                                        }}
                                        className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2 transition-colors cursor-pointer"
                                      >
                                        <ArrowUpRight className="h-3.5 w-3.5 text-rose-500" />
                                        <span>Escalate Alert</span>
                                      </button>
                                    )}

                                    {/* Resolve Alert */}
                                    {alert.status !== 'Resolved' && (
                                      <button
                                        onClick={(e) => {
                                          handleOpenResolveModal(alert, e);
                                          setOpenMenuAlertId(null);
                                        }}
                                        className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 transition-colors cursor-pointer"
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>Resolve Alert</span>
                                      </button>
                                    )}

                                    {/* Dismiss Alert */}
                                    {alert.status !== 'Dismissed' && (
                                      <button
                                        onClick={(e) => {
                                          handleDismiss(alert.id, e);
                                          setOpenMenuAlertId(null);
                                        }}
                                        className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
                                      >
                                        <XCircle className="h-3.5 w-3.5 text-slate-400" />
                                        <span>Dismiss Alert</span>
                                      </button>
                                    )}

                                    <div className="border-t border-slate-100 my-1"></div>

                                    {/* Delete Alert */}
                                    <button
                                      onClick={(e) => {
                                        handleDelete(alert.id, e);
                                        setOpenMenuAlertId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                      <span>Delete Alert</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>
                Showing {filteredAlerts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                {Math.min(currentPage * pageSize, filteredAlerts.length)} of {filteredAlerts.length} alerts
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold text-xs">
                  {currentPage}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: ALERT DETAILS Drawer & Quick Actions Panel (4 cols) */}
        {!isDetailDrawerCollapsed && (
          <div className="lg:col-span-4 space-y-4">
            {selectedAlert ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 font-sans">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-xs tracking-wider uppercase">
                    ALERT DETAILS
                  </h3>
                  <button
                    onClick={() => setIsDetailDrawerCollapsed(true)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Collapse Details Panel"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                {/* 1. Alert Summary Box */}
                <div className="p-3.5 bg-rose-50/40 rounded-2xl border border-rose-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs leading-snug">
                          {selectedAlert.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                          {selectedAlert.description || selectedAlert.triggerCondition}
                        </p>
                      </div>
                    </div>
                    {getSeverityBadge(selectedAlert.severity)}
                  </div>
                </div>

                {/* 2. Patient Profile Box */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm border-2 border-indigo-200 shrink-0">
                      {getPatientInitials(selectedAlert.patientName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        {selectedAlert.patientName || 'Patient'}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">
                        {selectedAlert.roomLocation || selectedAlert.careUnit || 'Cardiology Unit'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-200/50">
                    <span className="font-semibold text-slate-600">
                      {selectedAlert.ageGender || '47 / Male'}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-md">
                      {selectedAlert.patientType || 'Inpatient'}
                    </span>
                  </div>
                </div>

                {/* 3. Detection, Source & Notes */}
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Detected By</span>
                      <strong className="text-slate-900">{selectedAlert.detectedBy || selectedAlert.source || 'Medication Administration'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Source</span>
                      <strong className="text-slate-900">{selectedAlert.source || 'eMAR Telemetry'}</strong>
                    </div>
                  </div>

                  {/* Notes Block */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Clinical Notes
                    </span>
                    <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-700 text-xs font-medium max-h-32 overflow-y-auto whitespace-pre-line">
                      {selectedAlert.notes || selectedAlert.resolutionNotes || 'No notes added yet. Use quick actions below to append clinical notes.'}
                    </div>
                  </div>
                </div>

                {/* 4. Primary Actions (View Patient Profile & Update Status) */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      if (selectedAlert.patientId) {
                        navigate(`/patients/${selectedAlert.patientId}`);
                      } else {
                        navigate('/patients');
                      }
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>View Patient Profile</span>
                  </button>

                  {/* Update Status Dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenStatusDropdownAlertId(
                          openStatusDropdownAlertId === selectedAlert.id ? null : selectedAlert.id
                        );
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80"
                    >
                      <span>Update Status: <strong className="text-indigo-600">{selectedAlert.status}</strong></span>
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    </button>

                    {openStatusDropdownAlertId === selectedAlert.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in"
                      >
                        {['New', 'In Progress', 'Acknowledged', 'Pending', 'Resolved', 'Dismissed'].map((st) => (
                          <button
                            key={st}
                            onClick={(e) => handleUpdateStatus(selectedAlert.id, st, e)}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span>{st}</span>
                            {selectedAlert.status === st && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Quick Actions Section (Screenshot 2 Match) */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <h4 className="font-extrabold text-slate-900 text-xs">Quick Actions</h4>
                  <div className="space-y-2">
                    
                    {/* Acknowledge Alert */}
                    <button
                      onClick={() => handleAcknowledge(selectedAlert.id)}
                      disabled={selectedAlert.isAcknowledged || selectedAlert.status === 'Resolved'}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                      <span>{selectedAlert.isAcknowledged ? 'Alert Acknowledged' : 'Acknowledge Alert'}</span>
                    </button>

                    {/* Add Note */}
                    <button
                      onClick={() => handleOpenAddNote(selectedAlert)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <FileEdit className="h-4 w-4 text-slate-600" />
                      <span>Add Note</span>
                    </button>

                    {/* Notify Care Team */}
                    <button
                      onClick={() => handleOpenNotifyModal(selectedAlert)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Send className="h-4 w-4 text-slate-600" />
                      <span>Notify Care Team</span>
                    </button>

                    {/* Escalate Alert */}
                    <button
                      onClick={() => handleOpenEscalateModal(selectedAlert)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="h-4 w-4 text-rose-600" />
                      <span>Escalate Alert</span>
                    </button>
                  </div>
                </div>

                {/* 6. Alert Trends (Today) Donut Chart Card */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-xs">Alert Trends (Today)</h4>
                    <button
                      onClick={() => setActiveTab('All Alerts')}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Semi-Donut SVG */}
                    <div className="relative h-24 w-28 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100"
                          strokeWidth="4.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {criticalCount > 0 && (
                          <path
                            className="text-rose-500"
                            strokeDasharray={`${Math.round((criticalCount / (alerts.length || 1)) * 100)}, 100`}
                            strokeWidth="5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        )}
                        {highCount > 0 && (
                          <path
                            className="text-amber-500"
                            strokeDasharray={`${Math.round((highCount / (alerts.length || 1)) * 100)}, 100`}
                            strokeDashoffset={`-${Math.round((criticalCount / (alerts.length || 1)) * 100)}`}
                            strokeWidth="5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-lg font-black text-slate-900 leading-none">
                          {alerts.length}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">TOTAL</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-1.5 text-xs font-semibold text-slate-600 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-rose-500"></span> Critical
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {criticalCount}{' '}
                          <span className="text-[10px] text-slate-400 font-medium">
                            ({alerts.length ? Math.round((criticalCount / alerts.length) * 100) : 0}%)
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-500"></span> High
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {highCount}{' '}
                          <span className="text-[10px] text-slate-400 font-medium">
                            ({alerts.length ? Math.round((highCount / alerts.length) * 100) : 0}%)
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-yellow-400"></span> Medium
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {mediumCount}{' '}
                          <span className="text-[10px] text-slate-400 font-medium">
                            ({alerts.length ? Math.round((mediumCount / alerts.length) * 100) : 0}%)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-xs font-bold text-slate-400">
                Select an alert from the table to view complete clinical context and quick actions.
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- Interactive Modals --- */}

      {/* 1. Add Note Modal */}
      {addNoteModalAlert && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileEdit className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Add Clinical Progress Note</h3>
              </div>
              <button onClick={() => setAddNoteModalAlert(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="font-bold text-slate-900 text-xs">{addNoteModalAlert.title}</p>
              <p className="text-[11px] text-slate-500">Patient: {addNoteModalAlert.patientName} ({addNoteModalAlert.roomLocation})</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block text-xs mb-1">
                Progress Note Content <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="e.g. Attending nurse administered medication, patient vitals reassessed..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50/60 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddNoteModalAlert(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingNote || !newNoteText.trim()}
                onClick={handleSaveNote}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSavingNote ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Check className="h-4 w-4" /> Save Note</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Escalate Alert Modal */}
      {escalateModalAlert && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">Escalate Clinical Alert</h3>
              </div>
              <button onClick={() => setEscalateModalAlert(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <p className="font-bold text-rose-900 text-xs">{escalateModalAlert.title}</p>
              <p className="text-[11px] text-rose-700 mt-0.5">Escalating will upgrade priority to CRITICAL and dispatch on-call physician.</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block text-xs mb-1">
                Escalation Reason / Clinical Justification
              </label>
              <select
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50/60"
              >
                <option value="">Select Escalation Reason</option>
                <option value="Condition Deteriorating">Condition Deteriorating</option>
                <option value="Unresponsive to Initial Medication">Unresponsive to Initial Medication</option>
                <option value="Threshold Persisting > 30 Mins">Threshold Persisting &gt; 30 Mins</option>
                <option value="Immediate Physician Intervention Required">Immediate Physician Intervention Required</option>
                <option value="Staff Clinical Discretion">Staff Clinical Discretion</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEscalateModalAlert(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isEscalating}
                onClick={handleConfirmEscalation}
                className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isEscalating ? <><Loader2 className="h-4 w-4 animate-spin" /> Escalating...</> : <><ArrowUpRight className="h-4 w-4" /> Confirm Escalation</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Notify Care Team Modal */}
      {notifyModalAlert && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Broadcast to Care Team</h3>
              </div>
              <button onClick={() => setNotifyModalAlert(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="font-bold text-slate-900 text-xs">Patient: {notifyModalAlert.patientName}</p>
              <p className="text-[11px] text-slate-500">Unit: {notifyModalAlert.careUnit} • {notifyModalAlert.roomLocation}</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block text-xs mb-1">
                Notification Message
              </label>
              <textarea
                rows={3}
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50/60 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNotifyModalAlert(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isNotifying || !notifyMessage.trim()}
                onClick={handleSendCareTeamNotification}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isNotifying ? <><Loader2 className="h-4 w-4 animate-spin" /> Broadcasting...</> : <><Send className="h-4 w-4" /> Dispatch Notification</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Resolve Modal */}
      {resolveModalAlert && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Resolve Clinical Alert</h3>
              </div>
              <button onClick={() => setResolveModalAlert(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="font-bold text-slate-900 text-xs">{resolveModalAlert.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Patient: {resolveModalAlert.patientName} ({resolveModalAlert.roomLocation})
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block text-xs mb-1">
                Resolution Notes / Action Taken <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={resolutionNoteInput}
                onChange={(e) => setResolutionNoteInput(e.target.value)}
                placeholder="e.g. Attending physician evaluated patient, vitals normalized, medication administered..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50/60 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolveModalAlert(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResolving || !resolutionNoteInput.trim()}
                onClick={handleConfirmResolve}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isResolving ? <><Loader2 className="h-4 w-4 animate-spin" /> Resolving...</> : <><CheckCircle2 className="h-4 w-4" /> Confirm Resolution</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Create Alert Modal */}
      <AlertCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchAlerts}
      />

    </div>
  );
};

export default AlertsPage;
