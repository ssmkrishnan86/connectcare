import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Lock, Eye, EyeOff, Activity, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Doctor' | 'Nurse' | 'Admin'>('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (!role) {
      setErrorMessage('Please select your role.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ username: username.trim(), password, role });
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials and role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickCredentials = (userType: 'Admin' | 'Doctor' | 'Nurse') => {
    setErrorMessage('');
    if (userType === 'Admin') {
      setUsername('admin');
      setPassword('admin123');
      setRole('Admin');
    } else if (userType === 'Doctor') {
      setUsername('doctor');
      setPassword('doctor123');
      setRole('Doctor');
    } else if (userType === 'Nurse') {
      setUsername('nurse');
      setPassword('nurse123');
      setRole('Nurse');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-800">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/25 mb-1 transition-transform hover:scale-105">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ConnectCare
          </h1>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
            Clinical Care & Healthcare Portal
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80">
          
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-1">Select your assigned role and enter your authorized credentials.</p>
          </div>

          {/* Quick Preset Buttons for Easy Testing */}
          <div className="mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick Select Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickCredentials('Admin')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  role === 'Admin' && username === 'admin'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('Doctor')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  role === 'Doctor' && username === 'doctor'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('Nurse')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  role === 'Nurse' && username === 'nurse'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Nurse
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username (e.g. admin)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role Dropdown - Restricted to Doctor, Nurse, Admin ONLY */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assigned Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Doctor' | 'Nurse' | 'Admin')}
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> PostgreSQL Authenticated
            </span>
            <span>ConnectCare v1.0</span>
          </div>

        </div>

      </div>
    </div>
  );
};
