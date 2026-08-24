import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Sun,
  Search,
  Bell,
  MessageSquare,
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
  X
} from 'lucide-react';

export const NurseSettingsProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Profile');

  // Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getNurseProfile();
      const profileData = res?.data || res;
      setProfile(profileData);
      setEditForm(profileData);
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
      setProfile(editForm);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const defaultProfile = {
    fullName: 'Emma Johnson',
    employeeIdCode: 'NUR-10245',
    email: 'emma.johnson@connectcare.com',
    phone: '+1 234 567 8900',
    role: 'Staff Nurse',
    department: 'Nursing',
    unitWard: 'Cardiology Unit',
    dateOfJoining: 'Jan 15, 2023',
    aboutMe: 'Compassionate and dedicated nurse with 5+ years of experience in patient care.',
    avatar: '',
    defaultUnitWard: 'Cardiology Unit',
    defaultShift: '07:00 AM - 03:00 PM (Day Shift)',
    theme: 'Light',
    dateFormat: 'May 22, 2024 (MM/DD/YYYY)',
    timeFormat: '12 Hour (hh:mm A)',
    licenseNumber: 'RN-778899',
    qualification: 'B.Sc Nursing',
    experienceText: '5 Years 3 Months',
    specialization: 'Critical Care Nursing',
    certifications: 'BLS, ACLS, PALS',
    emergencyContactName: 'Michael Johnson (Brother)',
    emergencyContactPhone: '+1 987 654 3210',
    homeAddress: '123 Maple Street, Springfield, IL 62704, USA',
    personalEmail: 'emma.johnson@gmail.com'
  };

  const p = profile || defaultProfile;

  const isDoctor = user?.role?.toLowerCase() === 'doctor';

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be 5 MB or smaller.');
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
      
      {/* 1. Top Header Bar (Nurse View Only) */}
      {!isDoctor && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings & Profile</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Manage your profile, preferences and app settings.
            </p>
          </div>

          {/* Right Header Controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Shift Selector */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              <Sun className="h-4 w-4 text-amber-500 fill-amber-400" />
              <div className="flex flex-col text-[11px]">
                <span className="font-extrabold text-slate-900">Day Shift</span>
                <span className="text-[10px] text-slate-500 font-semibold">07:00 AM - 03:00 PM</span>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients, tasks, etc..."
                className="pl-9 pr-4 py-2 w-56 sm:w-64 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Icon Badges */}
            <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">6</span>
            </button>

            <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Messages">
              <MessageSquare className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">8</span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              {p.avatar ? (
                <img
                  src={p.avatar}
                  alt="Nurse Avatar"
                  className="h-9 w-9 rounded-full object-cover border border-indigo-200 shadow-xs"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200 shadow-xs">
                  {p.fullName ? p.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'RN'}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-extrabold text-slate-900 leading-tight">
                  {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : p.fullName}
                </p>
                <p className="text-[10px] font-semibold text-slate-400">{p.role}</p>
              </div>
            </div>

          </div>
        </div>
      )}

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
              onClick={() => setIsEditingProfile(true)}
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
              <button className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-indigo-600 cursor-pointer">
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
              <button className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-indigo-600 cursor-pointer">
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
              <button className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-indigo-600 cursor-pointer">
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
              <button className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-indigo-600 cursor-pointer">
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
              <button className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-indigo-600 cursor-pointer">
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

            <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
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

            <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
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

            <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
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
              
              <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
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

              <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
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

              <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
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
              onClick={() => setIsEditingProfile(true)}
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
              
              <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
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

              <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
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

              <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
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

              <div className="flex items-center justify-between p-2.5 hover:bg-rose-50/50 rounded-xl transition-colors cursor-pointer">
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
          <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl flex items-center justify-between cursor-pointer">
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

      {/* Footer Bar */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-4 border-t border-slate-200">
        <span>© 2024 Connected Care. All rights reserved.</span>
        <span>Version 1.0.0</span>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Edit Nurse Profile</h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto text-xs font-semibold">
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
                <label className="block text-slate-600 font-bold mb-1">Unit / Ward</label>
                <input
                  type="text"
                  value={editForm.unitWard || ''}
                  onChange={(e) => setEditForm({ ...editForm, unitWard: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
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

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
