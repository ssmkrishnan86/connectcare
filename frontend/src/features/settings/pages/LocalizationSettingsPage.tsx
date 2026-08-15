import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Plus, Info, MoreVertical, Globe } from 'lucide-react';
import { api } from '@/lib/api';

export const LocalizationSettingsPage: React.FC = () => {
  const [formData, setFormData] = useState<any>({
    defaultLanguage: 'English (United States)',
    fallbackLanguage: 'English (India)',
    dateFormat: 'DD MMM YYYY (19 May 2025)',
    shortDateFormat: 'DD/MM/YYYY (19/05/2025)',
    timeFormat: '12 Hour (05:30 PM)',
    weekStartsOn: 'Monday',
    timeZone: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi',
    previewRegion: 'India',
    calendarType: 'Gregorian Calendar',
  });

  const [activeTab, setActiveTab] = useState('Date & Time');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getSettingsLocalization()
      .then((data) => {
        if (data) setFormData(data);
      })
      .catch(console.error);
  }, []);

  const handleSave = () => {
    api.saveSettingsLocalization(formData)
      .then(() => {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      })
      .catch(console.error);
  };

  const supportedLangs = [
    { name: 'English (United States)', code: 'en-US', isDefault: true },
    { name: 'English (India)', code: 'en-IN', isDefault: false },
    { name: 'தமிழ் (Tamil)', code: 'ta-IN', isDefault: false },
    { name: 'हिंदी (Hindi)', code: 'hi-IN', isDefault: false },
    { name: 'తెలుగు (Telugu)', code: 'te-IN', isDefault: false },
    { name: 'ಕನ್ನಡ (Kannada)', code: 'kn-IN', isDefault: false },
    { name: 'বাংলা (Bengali)', code: 'bn-IN', isDefault: false },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Localization</h3>
          <p className="text-xs text-slate-500 font-medium">Manage languages, date & time formats, numbers and other regional preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20"
        >
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Localization settings saved successfully!
        </div>
      )}

      {/* Top Tabs Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 card-shadow flex items-center gap-6 text-xs font-bold border-b border-slate-100">
        {['Language', 'Date & Time', 'Numbers', 'Currency', 'Address Formats', 'Measurement Units'].map((tb) => (
          <button
            key={tb}
            onClick={() => setActiveTab(tb)}
            className={`pb-1 border-b-2 transition-colors ${
              activeTab === tb ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tb}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Column (1/3) + Right Column (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Card 1: Default Locale */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Default Locale</h4>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Language</label>
              <select
                value={formData.defaultLanguage || ''}
                onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              >
                <option>English (United States)</option>
                <option>English (India)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">This is the default language for the system.</p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Fallback Language</label>
              <select
                value={formData.fallbackLanguage || ''}
                onChange={(e) => setFormData({ ...formData, fallbackLanguage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              >
                <option>English (India)</option>
                <option>English (United States)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">This language will be used if translation is unavailable.</p>
            </div>
          </div>

          {/* Card 2: Supported Languages */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Supported Languages</h4>
                <p className="text-[10px] text-slate-400">Add and manage languages available in the system.</p>
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold">
                <Plus className="h-3.5 w-3.5" /> Add Language
              </button>
            </div>

            <div className="space-y-2">
              {supportedLangs.map((lang, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <span className="font-bold text-slate-900">{lang.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">{lang.code}</span>
                    {lang.isDefault && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">Default</span>
                    )}
                    <button className="p-1 text-slate-400 hover:text-slate-600"><MoreVertical className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Date & Time Format */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Date & Time Format</h4>
                <p className="text-[10px] text-slate-400">Configure how date and time are displayed across the application.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium text-[11px]">Preview Region</span>
                <select
                  value={formData.previewRegion || 'India'}
                  onChange={(e) => setFormData({ ...formData, previewRegion: e.target.value })}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option>India</option>
                  <option>United States</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date Format</label>
                <select
                  value={formData.dateFormat || ''}
                  onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  <option>DD MMM YYYY (19 May 2025)</option>
                  <option>MM/DD/YYYY</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Short Date Format</label>
                <select
                  value={formData.shortDateFormat || ''}
                  onChange={(e) => setFormData({ ...formData, shortDateFormat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  <option>DD/MM/YYYY (19/05/2025)</option>
                  <option>MM/DD/YYYY</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Time Format</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="timeFormat"
                      checked={formData.timeFormat?.includes('12 Hour')}
                      onChange={() => setFormData({ ...formData, timeFormat: '12 Hour (05:30 PM)' })}
                      className="accent-purple-600"
                    />
                    12 Hour (05:30 PM)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-600">
                    <input
                      type="radio"
                      name="timeFormat"
                      checked={formData.timeFormat?.includes('24 Hour')}
                      onChange={() => setFormData({ ...formData, timeFormat: '24 Hour (17:30)' })}
                      className="accent-purple-600"
                    />
                    24 Hour (17:30)
                  </label>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Week Starts On</label>
                <select
                  value={formData.weekStartsOn || 'Monday'}
                  onChange={(e) => setFormData({ ...formData, weekStartsOn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  <option>Monday</option>
                  <option>Sunday</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Timezone</label>
              <select
                value={formData.timeZone || ''}
                onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              >
                <option>(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
              </select>
            </div>

            {/* Preview Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h5 className="font-bold text-slate-900 text-xs">Preview</h5>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-500">Date (Default) :</span><span className="font-bold text-slate-900">19 May 2025</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date (Short) :</span><span className="font-bold text-slate-900">19/05/2025</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Time :</span><span className="font-bold text-slate-900">05:30 PM</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Week Starts On :</span><span className="font-bold text-slate-900">Monday</span></div>
                <div className="col-span-2 flex justify-between"><span className="text-slate-500">Timezone :</span><span className="font-bold text-slate-900">(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</span></div>
              </div>
            </div>
          </div>

          {/* Card 2: Calendar Selection */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Calendar</h4>
            <p className="text-[10px] text-slate-400">Choose the calendar type for date selection.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setFormData({ ...formData, calendarType: 'Gregorian Calendar' })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.calendarType === 'Gregorian Calendar' ? 'bg-purple-50/50 border-purple-400' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="calendar"
                    checked={formData.calendarType === 'Gregorian Calendar'}
                    onChange={() => setFormData({ ...formData, calendarType: 'Gregorian Calendar' })}
                    className="accent-purple-600"
                  />
                  <span className="font-bold text-slate-900">Gregorian Calendar</span>
                </div>
                <p className="text-[10px] text-slate-400 ml-5">Most common calendar used globally.</p>
              </label>

              <label
                onClick={() => setFormData({ ...formData, calendarType: 'Hijri Calendar' })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.calendarType === 'Hijri Calendar' ? 'bg-purple-50/50 border-purple-400' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="calendar"
                    checked={formData.calendarType === 'Hijri Calendar'}
                    onChange={() => setFormData({ ...formData, calendarType: 'Hijri Calendar' })}
                    className="accent-purple-600"
                  />
                  <span className="font-bold text-slate-900">Hijri Calendar</span>
                </div>
                <p className="text-[10px] text-slate-400 ml-5">Islamic lunar calendar.</p>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Notice */}
      <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 flex items-center gap-2 text-xs text-purple-900 font-medium">
        <Info className="h-4 w-4 text-purple-600 shrink-0" />
        <span>Note: These settings will apply to all users in your organization unless they configure their own preferences.</span>
      </div>
    </div>
  );
};

export default LocalizationSettingsPage;
