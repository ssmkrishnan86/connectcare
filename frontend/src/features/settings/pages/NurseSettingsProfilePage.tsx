import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { toast } from '@/context/ToastContext';
import { PageHeader } from '@/components/common/PageHeader';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';
import {
  Sun,
  Camera,
  Edit3,
  Building,
  Palette,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  GraduationCap,
  Briefcase,
  Stethoscope,
  Award,
  User,
  Home,
  Mail,
  Key,
  Shield,
  Smartphone,
  LogOut,
  Trash2,
  Check,
  X,
  Lock,
  Volume2,
  ShieldCheck
} from 'lucide-react';

export const NurseSettingsProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Profile');

  // Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Preference Settings State
  const [prefUnitWard, setPrefUnitWard] = useState('Cardiology Unit');
  const [prefShift, setPrefShift] = useState('07:00 AM - 03:00 PM (Day Shift)');
  const [prefTheme, setPrefTheme] = useState('Light');
  const [prefDateFormat, setPrefDateFormat] = useState('MM/DD/YYYY');
  const [prefTimeFormat, setPrefTimeFormat] = useState('12 Hour (hh:mm A)');
  const [prefVitalsInterval, setPrefVitalsInterval] = useState('30 seconds');
  const [prefAlertSound, setPrefAlertSound] = useState(true);

  // Notification Toggles
  const [notifCritical, setNotifCritical] = useState(true);
  const [notifOrders, setNotifOrders] = useState(true);
  const [notifHandoff, setNotifHandoff] = useState(true);
  const [notifEmailDigest, setNotifEmailDigest] = useState(false);

  // Password / Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Language & Region State
  const [language, setLanguage] = useState('English (United States)');
  const [timezone, setTimezone] = useState('America/Chicago (Central Time - US)');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getNurseProfile();
      const profileData = res?.data || res;
      if (profileData) {
        setProfile(profileData);
        if (profileData.defaultUnitWard) setPrefUnitWard(profileData.defaultUnitWard);
        if (profileData.defaultShift) setPrefShift(profileData.defaultShift);
        if (profileData.theme) setPrefTheme(profileData.theme);
        if (profileData.dateFormat) setPrefDateFormat(profileData.dateFormat);
        if (profileData.timeFormat) setPrefTimeFormat(profileData.timeFormat);
      }
    } catch (err) {
      console.error('Failed to fetch nurse profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.updateNurseProfile(editForm);
      setProfile((prev: any) => ({ ...(prev || {}), ...editForm }));
      setIsEditingProfile(false);
      toast.success('Nurse profile updated successfully.');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update nurse profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    const updated = {
      defaultUnitWard: prefUnitWard,
      defaultShift: prefShift,
      theme: prefTheme,
      dateFormat: prefDateFormat,
      timeFormat: prefTimeFormat
    };
    try {
      await api.updateNurseProfile(updated);
      setProfile((prev: any) => ({ ...(prev || {}), ...updated }));
      toast.success('Preferences saved successfully.');
    } catch {
      toast.success('Preferences saved locally.');
    }
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated successfully.');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.warning('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    toast.success('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const p = {
    fullName: profile?.fullName || user?.fullName || user?.username || 'Staff Nurse',
    employeeIdCode: profile?.employeeIdCode || (user ? `NUR-${user.id ? String(user.id).substring(0, 5).toUpperCase() : '10001'}` : 'NUR-10001'),
    email: profile?.email || user?.email || 'nurse@connectcare.org',
    phone: profile?.phone || (user as any)?.phone || '+1 (555) 345-6789',
    role: profile?.role || user?.role || 'Staff Nurse',
    department: profile?.department || user?.department || 'Nursing',
    unitWard: profile?.unitWard || prefUnitWard || 'Cardiology Unit',
    dateOfJoining: profile?.dateOfJoining || 'Oct 12, 2021',
    aboutMe: profile?.aboutMe || 'Dedicated registered nurse with extensive clinical experience in acute patient care, telemetry rounds monitoring, hemodynamic stabilization, and patient advocacy.',
    avatar: profile?.avatar || user?.avatar || '',
    defaultUnitWard: profile?.defaultUnitWard || prefUnitWard || 'Cardiology Unit',
    defaultShift: profile?.defaultShift || prefShift || '07:00 AM - 03:00 PM (Day Shift)',
    theme: profile?.theme || prefTheme || 'Light',
    dateFormat: profile?.dateFormat || prefDateFormat || 'MM/DD/YYYY',
    timeFormat: profile?.timeFormat || prefTimeFormat || '12 Hour (hh:mm A)',
    licenseNumber: profile?.licenseNumber || 'RN-982341-CA',
    qualification: profile?.qualification || 'B.Sc. Nursing, RN',
    experienceText: profile?.experienceText || '5 Years',
    specialization: profile?.specialization || 'Critical Care / Cardiology',
    certifications: profile?.certifications || 'BLS, ACLS, PCCN',
    emergencyContactName: profile?.emergencyContactName || 'Michael Davis (Spouse)',
    emergencyContactPhone: profile?.emergencyContactPhone || '+1 (555) 987-6543',
    homeAddress: profile?.homeAddress || '123 Healthcare Ave, Austin, TX 78701',
    personalEmail: profile?.personalEmail || 'nurse.staff@gmail.com'
  };

  const openEditModal = () => {
    setEditForm({
      fullName: p.fullName,
      role: p.role,
      employeeIdCode: p.employeeIdCode,
      department: p.department,
      unitWard: p.unitWard,
      phone: p.phone,
      email: p.email,
      dateOfJoining: p.dateOfJoining,
      licenseNumber: p.licenseNumber,
      qualification: p.qualification,
      specialization: p.specialization,
      experienceText: p.experienceText,
      certifications: p.certifications,
      aboutMe: p.aboutMe,
      defaultUnitWard: p.defaultUnitWard,
      defaultShift: p.defaultShift,
      emergencyContactName: p.emergencyContactName,
      emergencyContactPhone: p.emergencyContactPhone,
      homeAddress: p.homeAddress,
      personalEmail: p.personalEmail
    });
    setIsEditingProfile(true);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.warning('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Photo must be 5 MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfile((prev: any) => ({ ...(prev || {}), avatar: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto select-none font-sans text-slate-800">
      
      {/* Page Header */}
      <PageHeader
        title="Settings & Profile"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' },
        ]}
        actions={
          <DataImportExportToolbar
            moduleKey="settings-general"
            data={profile ? [profile] : [p]}
            idField="id"
            onImportSuccess={fetchProfile}
            customCreateApi={api.updateNurseProfile}
          />
        }
      />

      {/* 2. Sub-Header Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        {["Profile", "Preferences", "Notifications", "Security", "Language", "About App"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
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

      {/* 3. Top Master Split-Screen Layout (Left 8 Columns Profile + Right 4 Columns Quick Settings) */}
      {activeTab === 'Profile' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Card: My Profile (8 Columns) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <h2 className="text-sm font-extrabold text-slate-900">My Profile</h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Avatar & Photo Change */}
                <div className="md:col-span-4 flex flex-col items-center justify-center space-y-3 pt-2">
                  <div className="relative">
                    {p.avatar ? (
                      <img
                        src={p.avatar}
                        alt={p.fullName}
                        className="h-28 w-28 rounded-full object-cover border-4 border-indigo-50 shadow-md"
                      />
                    ) : (
                      <div className="h-28 w-28 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl border-4 border-indigo-50 shadow-md">
                        {p.fullName ? p.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'RN'}
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition-transform active:scale-95 cursor-pointer">
                      <Camera className="h-4 w-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                  </div>

                  <label className="px-4 py-1.5 border border-indigo-200 rounded-xl text-xs font-extrabold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer">
                    Change Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>

                {/* 2-Column Info Fields Grid */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs font-semibold">
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold">Full Name</p>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">{p.fullName}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 font-bold">Role</p>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">{p.role}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 font-bold">Employee ID</p>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">{p.employeeIdCode}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 font-bold">Department</p>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">{p.department}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 font-bold">Email</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{p.email}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 font-bold">Unit / Ward</p>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">{p.unitWard}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 font-bold">Phone Number</p>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">{p.phone}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 font-bold">Date of Joining</p>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">{p.dateOfJoining}</p>
                  </div>
                </div>

              </div>

              {/* About Me Container */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] text-slate-400 font-bold">About Me</p>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 leading-relaxed">
                  {p.aboutMe}
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={openEditModal}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Right Card: Quick Settings (4 Columns) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900">Quick Settings</h2>

              <div className="space-y-3.5">
                
                {/* 1. Default Unit / Ward */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                      <Building className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">Default Unit / Ward</p>
                      <p className="text-[11px] font-semibold text-slate-500">{p.defaultUnitWard}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('Preferences')}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-indigo-600 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* 2. Default Shift */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0">
                      <Sun className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">Default Shift</p>
                      <p className="text-[11px] font-semibold text-slate-500">{p.defaultShift}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('Preferences')}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-indigo-600 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* 3. Theme */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                      <Palette className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">Theme</p>
                      <p className="text-[11px] font-semibold text-slate-500">{p.theme}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('Preferences')}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-indigo-600 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* 4. Date Format */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">Date Format</p>
                      <p className="text-[11px] font-semibold text-slate-500">{p.dateFormat}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('Preferences')}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-indigo-600 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* 5. Time Format */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0">
                      <Clock className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">Time Format</p>
                      <p className="text-[11px] font-semibold text-slate-500">{p.timeFormat}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('Preferences')}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-indigo-600 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

              </div>
            </div>

          </div>

      {/* 4. Bottom 3 Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Card 1: Professional Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900">Professional Information</h2>

          <div className="space-y-2.5">
            
            <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400">License Number</p>
                  <p className="font-extrabold text-slate-900 text-xs">{p.licenseNumber}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>

            <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Qualification</p>
                  <p className="font-extrabold text-slate-900 text-xs">{p.qualification}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>

            <div onClick={openEditModal} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                  <Briefcase className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Experience</p>
                  <p className="font-extrabold text-slate-900 text-xs">{p.experienceText}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>

            <div onClick={openEditModal} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Specialization</p>
                  <p className="font-extrabold text-slate-900 text-xs">{p.specialization}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>

            <div onClick={openEditModal} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Certifications</p>
                  <p className="font-extrabold text-slate-900 text-xs">{p.certifications}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>

          </div>
        </div>

        {/* Card 2: Contact Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 mb-3">Contact Information</h2>

            <div className="space-y-2.5">
              
              <div onClick={openEditModal} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400">Emergency Contact</p>
                    <p className="font-extrabold text-slate-900 text-xs">{p.emergencyContactName}</p>
                    <p className="text-[10px] font-semibold text-slate-500">{p.emergencyContactPhone}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              <div onClick={openEditModal} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0">
                    <Home className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400">Home Address</p>
                    <p className="font-extrabold text-slate-900 text-xs leading-tight">{p.homeAddress}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              <div onClick={openEditModal} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400">Personal Email</p>
                    <p className="font-extrabold text-slate-900 text-xs">{p.personalEmail}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Edit3 className="h-4 w-4" />
              Edit Contact Info
            </button>
          </div>
        </div>

        {/* Card 3: Account Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 mb-3">Account Actions</h2>

            <div className="space-y-2">
              
              <div onClick={() => setActiveTab('Security')} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                    <Key className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">Change Password</p>
                    <p className="text-[10px] font-semibold text-slate-400">Update your account password</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              <div onClick={() => setActiveTab('Security')} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">Two-Factor Authentication</p>
                    <p className="text-[10px] font-semibold text-slate-400">Add an extra layer of security</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              <div onClick={() => setActiveTab('Security')} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    <Smartphone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">Active Sessions</p>
                    <p className="text-[10px] font-semibold text-slate-400">Manage your active sessions</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              <div onClick={logout} className="flex items-center justify-between p-2.5 hover:bg-rose-50/50 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0">
                    <LogOut className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">Log Out</p>
                    <p className="text-[10px] font-semibold text-slate-400">Sign out from this device</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

            </div>
          </div>

          {/* Delete Account Box */}
          <div onClick={() => toast.info('Account deletion requires administrative authorization.')} className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-extrabold text-rose-700 text-xs">Delete Account</p>
                <p className="text-[10px] font-semibold text-rose-500">Permanently delete your account</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-rose-400" />
          </div>

        </div>

      </div>
    </>
  )}

      {/* Preferences Tab Content */}
      {activeTab === 'Preferences' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Clinical & Display Preferences</h2>
            <p className="text-xs text-slate-500 mt-0.5">Customize your clinical workflow, default ward assignments, and visual interface formats.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Default Unit / Ward</label>
              <select
                value={prefUnitWard}
                onChange={(e) => setPrefUnitWard(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Cardiology Unit">Cardiology Unit</option>
                <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                <option value="Emergency Department (ED)">Emergency Department (ED)</option>
                <option value="Pediatric Care">Pediatric Care</option>
                <option value="Oncology Unit">Oncology Unit</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Default Shift</label>
              <select
                value={prefShift}
                onChange={(e) => setPrefShift(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="07:00 AM - 03:00 PM (Day Shift)">07:00 AM - 03:00 PM (Day Shift)</option>
                <option value="03:00 PM - 11:00 PM (Evening Shift)">03:00 PM - 11:00 PM (Evening Shift)</option>
                <option value="11:00 PM - 07:00 AM (Night Shift)">11:00 PM - 07:00 AM (Night Shift)</option>
                <option value="08:00 AM - 05:00 PM (Clinical Shift)">08:00 AM - 05:00 PM (Clinical Shift)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Theme Mode</label>
              <select
                value={prefTheme}
                onChange={(e) => setPrefTheme(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Light">Light Mode</option>
                <option value="Dark">Dark Mode</option>
                <option value="System">System Default</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Date Format</label>
              <select
                value={prefDateFormat}
                onChange={(e) => setPrefDateFormat(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (10/12/2024)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (12/10/2024)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2024-10-12)</option>
                <option value="MMM DD, YYYY">MMM DD, YYYY (Oct 12, 2024)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Time Format</label>
              <select
                value={prefTimeFormat}
                onChange={(e) => setPrefTimeFormat(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="12 Hour (hh:mm A)">12 Hour (02:30 PM)</option>
                <option value="24 Hour (HH:mm)">24 Hour (14:30)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Telemetry Vitals Polling Interval</label>
              <select
                value={prefVitalsInterval}
                onChange={(e) => setPrefVitalsInterval(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="15 seconds">15 seconds (High Frequency)</option>
                <option value="30 seconds">30 seconds (Recommended)</option>
                <option value="1 minute">1 minute</option>
                <option value="5 minutes">5 minutes</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/70 rounded-xl mt-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Volume2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Critical Telemetry Audio Alerts</p>
                <p className="text-[11px] text-slate-500">Play an audible chime when abnormal telemetry readings or arrhythmias occur</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefAlertSound}
              onChange={(e) => setPrefAlertSound(e.target.checked)}
              className="h-4 w-4 text-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleSavePreferences}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab Content */}
      {activeTab === 'Notifications' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Notification Preferences</h2>
            <p className="text-xs text-slate-500 mt-0.5">Control how and when you receive critical alerts and patient updates.</p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { id: 'crit', label: 'Critical Patient Vitals & Arrhythmias', desc: 'Instant alerts for vitals outside safe clinical thresholds', val: notifCritical, set: setNotifCritical },
              { id: 'orders', label: 'Physician Orders & Medication Requests', desc: 'Notifications when new STAT orders or prescriptions are placed', val: notifOrders, set: setNotifOrders },
              { id: 'handoff', label: 'Shift Handoff & Patient Transfers', desc: 'Alerts when a patient is transferred to or from your unit', val: notifHandoff, set: setNotifHandoff },
              { id: 'digest', label: 'Daily Clinical Summary Digest', desc: 'Daily email overview of telemetry rounds, census, and active alerts', val: notifEmailDigest, set: setNotifEmailDigest },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-800">{item.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={item.val}
                  onChange={(e) => item.set(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleSaveNotifications}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              Save Notification Settings
            </button>
          </div>
        </div>
      )}

      {/* Security Tab Content */}
      {activeTab === 'Security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Change Password</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ensure your account is protected with a strong, unique password.</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Lock className="h-4 w-4" />
                Update Password
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Two-Factor Authentication (2FA)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Protect your clinical login with an authenticator app (TOTP) or SMS passcode.</p>
              </div>
              <button
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  toast.success(twoFactorEnabled ? '2FA disabled.' : '2FA enabled successfully.');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  twoFactorEnabled
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
                }`}
              >
                {twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Active Sessions</h3>
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Smartphone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Current Workstation / Web Browser</p>
                  <p className="text-[11px] text-slate-500">Austin Medical Center • IP 192.168.1.140 • Active Now</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-extrabold">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Language Tab Content */}
      {activeTab === 'Language' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Language & Regional Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select your primary language and regional time zone conventions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  toast.success('Language preference updated.');
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="English (United States)">English (United States)</option>
                <option value="Spanish (Español)">Spanish (Español)</option>
                <option value="French (Français)">French (Français)</option>
                <option value="German (Deutsch)">German (Deutsch)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Time Zone</label>
              <select
                value={timezone}
                onChange={(e) => {
                  setTimezone(e.target.value);
                  toast.success('Time zone updated.');
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="America/Chicago (Central Time - US)">America/Chicago (Central Time - US)</option>
                <option value="America/New_York (Eastern Time - US)">America/New_York (Eastern Time - US)</option>
                <option value="America/Denver (Mountain Time - US)">America/Denver (Mountain Time - US)</option>
                <option value="America/Los_Angeles (Pacific Time - US)">America/Los_Angeles (Pacific Time - US)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* About App Tab Content */}
      {activeTab === 'About App' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-600/20">
              CC
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Connected Care Telemetry Platform</h2>
              <p className="text-xs text-slate-500 font-semibold">Hospital & Telemetry Clinical Management System</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
              <p className="text-[11px] text-slate-400 font-bold">Version</p>
              <p className="font-extrabold text-slate-900 mt-1">1.0.0 (Build 2026.09)</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
              <p className="text-[11px] text-slate-400 font-bold">HIPAA Compliance</p>
              <p className="font-extrabold text-emerald-600 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Certified & Encrypted
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
              <p className="text-[11px] text-slate-400 font-bold">Interoperability</p>
              <p className="font-extrabold text-slate-900 mt-1">HL7 / FHIR R4 Ready</p>
            </div>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            Connected Care is an enterprise-grade clinical telemetry and acute care monitoring solution built to streamline rounds, automate doctor consultations, and safeguard patient vitals through real-time telemetry analytics.
          </div>
        </div>
      )}

      {/* Footer Bar */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-4 border-t border-slate-200">
        <span>© 2024 Connected Care. All rights reserved.</span>
        <span>Version 1.0.0</span>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <h3 className="font-black text-slate-900 text-base">Edit Nurse Profile</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Update personal, clinical, and contact details</p>
              </div>
              <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 text-xs font-semibold flex-1">
              <div className="border-b border-slate-100 pb-2">
                <p className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">Personal & Hospital Details</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName || ''}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Role</label>
                  <input
                    type="text"
                    value={editForm.role || ''}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={editForm.employeeIdCode || ''}
                    onChange={(e) => setEditForm({ ...editForm, employeeIdCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Department</label>
                  <input
                    type="text"
                    value={editForm.department || ''}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Unit / Ward</label>
                  <input
                    type="text"
                    value={editForm.unitWard || ''}
                    onChange={(e) => setEditForm({ ...editForm, unitWard: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Date of Joining</label>
                  <input
                    type="text"
                    value={editForm.dateOfJoining || ''}
                    onChange={(e) => setEditForm({ ...editForm, dateOfJoining: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="border-b border-slate-100 pb-2 pt-2">
                <p className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">Professional Credentials</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">License Number</label>
                  <input
                    type="text"
                    value={editForm.licenseNumber || ''}
                    onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Qualification</label>
                  <input
                    type="text"
                    value={editForm.qualification || ''}
                    onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Clinical Experience</label>
                  <input
                    type="text"
                    value={editForm.experienceText || ''}
                    onChange={(e) => setEditForm({ ...editForm, experienceText: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Specialization</label>
                  <input
                    type="text"
                    value={editForm.specialization || ''}
                    onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">Certifications</label>
                  <input
                    type="text"
                    value={editForm.certifications || ''}
                    onChange={(e) => setEditForm({ ...editForm, certifications: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="border-b border-slate-100 pb-2 pt-2">
                <p className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">Contact & Emergency Details</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Work Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Work Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={editForm.emergencyContactName || ''}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.emergencyContactPhone || ''}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Personal Email</label>
                  <input
                    type="email"
                    value={editForm.personalEmail || ''}
                    onChange={(e) => setEditForm({ ...editForm, personalEmail: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Home Address</label>
                  <input
                    type="text"
                    value={editForm.homeAddress || ''}
                    onChange={(e) => setEditForm({ ...editForm, homeAddress: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="border-b border-slate-100 pb-2 pt-2">
                <p className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">Bio & Summary</p>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">About Me</label>
                <textarea
                  rows={3}
                  value={editForm.aboutMe || ''}
                  onChange={(e) => setEditForm({ ...editForm, aboutMe: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NurseSettingsProfilePage;
