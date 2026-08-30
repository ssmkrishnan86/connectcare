import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Plus, Info, MoreVertical, Globe } from 'lucide-react';
import { api } from '@/lib/api';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';
import { useLocalization } from '@/features/localization/context/LocalizationContext';

export const LocalizationSettingsPage: React.FC = () => {
  const { updateLocalization } = useLocalization();
  const [formData, setFormData] = useState<any>({
    defaultLanguage: 'English (United States)',
    fallbackLanguage: 'Spanish (United States)',
    dateFormat: 'MM/DD/YYYY (05/19/2025)',
    shortDateFormat: 'MM/DD/YYYY (05/19/2025)',
    timeFormat: '12 Hour (05:30 PM)',
    weekStartsOn: 'Sunday',
    timeZone: '(UTC-05:00) Eastern Time (US & Canada)',
    previewRegion: 'United States',
    calendarType: 'Gregorian Calendar',
  });

  const [activeTab, setActiveTab] = useState('Date & Time');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getSettingsLocalization()
      .then((data) => {
        if (data) {
          setFormData(data);
          updateLocalization(data);
        }
      })
      .catch(console.error);
  }, [updateLocalization]);

  const handleSave = () => {
    api.saveSettingsLocalization(formData)
      .then(() => {
        updateLocalization(formData);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      })
      .catch(console.error);
  };


  const supportedLangs = [
    { name: 'English (United States)', code: 'en-US', isDefault: true },
    { name: 'Spanish (United States)', code: 'es-US', isDefault: false },
    { name: 'French', code: 'fr-FR', isDefault: false },
    { name: 'Chinese (Simplified)', code: 'zh-CN', isDefault: false },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Localization</h3>
          <p className="text-xs text-slate-500 font-medium">Manage languages, date & time formats, numbers and other regional preferences.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <DataImportExportToolbar
            moduleKey="settings-general"
            data={formData ? [formData] : []}
            idField="id"
            onImportSuccess={() => api.getSettingsLocalization().then(setFormData)}
            customCreateApi={api.saveSettingsLocalization}
          />
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 cursor-pointer"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
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
                <option>Spanish (United States)</option>
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
                <option>Spanish (United States)</option>
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
                  value={formData.previewRegion || 'United States'}
                  onChange={(e) => setFormData({ ...formData, previewRegion: e.target.value })}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
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
                  <option>MM/DD/YYYY (05/19/2025)</option>
                  <option>DD/MM/YYYY (19/05/2025)</option>
                  <option>MMM DD, YYYY (May 19, 2025)</option>
                  <option>YYYY-MM-DD (2025-05-19)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Short Date Format</label>
                <select
                  value={formData.shortDateFormat || ''}
                  onChange={(e) => setFormData({ ...formData, shortDateFormat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  <option>MM/DD/YYYY (05/19/2025)</option>
                  <option>DD/MM/YYYY (19/05/2025)</option>
                  <option>M/D/YY (5/19/25)</option>
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
                  value={formData.weekStartsOn || 'Sunday'}
                  onChange={(e) => setFormData({ ...formData, weekStartsOn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  <option>Sunday</option>
                  <option>Monday</option>
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
                <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                <option>(UTC-06:00) Central Time (US & Canada)</option>
                <option>(UTC-07:00) Mountain Time (US & Canada)</option>
                <option>(UTC-08:00) Pacific Time (US & Canada)</option>
                <option>(UTC-09:00) Alaska</option>
                <option>(UTC-10:00) Hawaii</option>
              </select>
            </div>

            {/* Preview Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h5 className="font-bold text-slate-900 text-xs">Preview</h5>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-500">Date (Default) :</span><span className="font-bold text-slate-900">{formData.dateFormat?.includes('DD/MM') ? '19/05/2025' : formData.dateFormat?.includes('YYYY-MM') ? '2025-05-19' : formData.dateFormat?.includes('MMM') ? 'May 19, 2025' : '05/19/2025'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date (Short) :</span><span className="font-bold text-slate-900">{formData.shortDateFormat?.includes('DD/MM') ? '19/05/2025' : formData.shortDateFormat?.includes('M/D/YY') ? '5/19/25' : '05/19/2025'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Time :</span><span className="font-bold text-slate-900">{formData.timeFormat?.includes('24') ? '17:30' : '05:30 PM'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Week Starts On :</span><span className="font-bold text-slate-900">{formData.weekStartsOn || 'Sunday'}</span></div>
                <div className="col-span-2 flex justify-between"><span className="text-slate-500">Timezone :</span><span className="font-bold text-slate-900">{formData.timeZone || '(UTC-05:00) Eastern Time (US & Canada)'}</span></div>
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
