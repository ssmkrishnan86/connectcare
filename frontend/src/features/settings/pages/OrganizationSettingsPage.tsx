import React, { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle2, Building2, MapPin, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/context/ToastContext';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';
import { MapLocationModal } from '../components/MapLocationModal';
import { ModuleAccessModal } from '../components/ModuleAccessModal';

export const OrganizationSettingsPage: React.FC = () => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
    organizationName: 'Connected Care Senior Living',
    organizationType: 'Senior Living / Assisted Living',
    registrationNumber: 'TX-HSP-2018-55671',
    website: 'https://www.connectedcare.com',
    tagline: 'Compassionate Care, Connected Life',
    logoUrl: '',
    establishedYear: '2018',
    primaryContactPerson: 'Hospital Administrator',
    primaryContactDesignation: 'Administrator',
    primaryContactEmail: 'admin@connectedcare.com',
    primaryContactPhone: '(512) 555-0100',
    primaryContactAlternatePhone: '(512) 555-0199',
    addressLine1: '100 Hospital Drive',
    addressLine2: 'Suite 400',
    city: 'Austin',
    state: 'Texas',
    pinCode: '78705',
    country: 'United States',
    latitude: 30.2672,
    longitude: -97.7431,
    defaultTimeZone: '(UTC-06:00) Central Time (US & Canada)',
    defaultLanguage: 'English (United States)',
    defaultDateFormat: 'MM/DD/YYYY (05/19/2025)',
    defaultTimeFormat: '12 Hour (05:30 PM)',
    itemsPerPage: 20,
    currency: 'USD ($) - US Dollar',
    weekStartsOn: 'Sunday',
    enableMultiLocation: true,
  });

  const [modules, setModules] = useState<Record<string, boolean>>({
    'Residents': true,
    'Care & Clinical': true,
    'Medication': true,
    'Billing & Finance': true,
    'Reports & Analytics': true,
    'Alerts & Incidents': true,
    'Tasks & Activities': true,
    'Document Management': true,
    'Visitor Management': false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modals
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isModuleAccessModalOpen, setIsModuleAccessModalOpen] = useState(false);

  useEffect(() => {
    api.getSettingsOrganization()
      .then((data) => {
        if (data) {
          setFormData(data);
          if (data.enabledModulesJson) {
            try {
              const list: string[] = JSON.parse(data.enabledModulesJson);
              const map: Record<string, boolean> = { ...modules };
              Object.keys(map).forEach((k) => (map[k] = list.includes(k)));
              setModules(map);
            } catch (e) { console.error(e); }
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.warning('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoUrl = event.target?.result as string;
        setFormData((prev: any) => ({ ...prev, logoUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const enabledList = Object.keys(modules).filter((k) => modules[k]);
    const payload = {
      ...formData,
      enabledModulesJson: JSON.stringify(enabledList),
    };

    api.saveSettingsOrganization(payload)
      .then(() => {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      })
      .catch(console.error);
  };

  const toggleModule = (modName: string) => {
    setModules((prev) => ({ ...prev, [modName]: !prev[modName] }));
  };

  const handleMapLocationSave = (locationData: any) => {
    setFormData((prev: any) => ({
      ...prev,
      addressLine1: locationData.addressLine1,
      addressLine2: locationData.addressLine2,
      city: locationData.city,
      state: locationData.state,
      pinCode: locationData.pinCode,
      country: locationData.country,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    }));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Organization Settings</h3>
          <p className="text-xs text-slate-500 font-medium">Update your organization details and preferences.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <DataImportExportToolbar
            moduleKey="settings-general"
            data={formData ? [formData] : []}
            idField="id"
            onImportSuccess={() => api.getSettingsOrganization().then(setFormData)}
            customCreateApi={api.saveSettingsOrganization}
          />
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Organization settings saved successfully!
        </div>
      )}

      {/* Card 1: Organization Information */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-900">Organization Information</h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Organization Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.organizationName || ''}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Organization Type <span className="text-rose-500">*</span></label>
                <select
                  value={formData.organizationType || ''}
                  onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  <option>Senior Living / Assisted Living</option>
                  <option>Hospital & Specialty Care</option>
                  <option>Clinic Network</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Registration Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber || ''}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Established Year</label>
                <input
                  type="text"
                  value={formData.establishedYear || '2018'}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Website <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Logo</label>
              <input
                type="file"
                ref={logoInputRef}
                accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                onChange={handleLogoFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-purple-100 border border-slate-200 text-purple-600 flex items-center justify-center font-bold overflow-hidden shrink-0">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Organization Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-7 w-7 text-purple-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3 py-1.5 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Change Logo
                    </button>
                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: '' })}
                        className="px-2.5 py-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or SVG. Max size 2MB.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tagline <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2: Primary Contact & Organization Address */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Primary Contact */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900">Primary Contact</h4>
            <p className="text-xs text-slate-400 font-medium">Main contact information for the organization.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Person <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.primaryContactPerson || ''}
                  onChange={(e) => setFormData({ ...formData, primaryContactPerson: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Designation <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={formData.primaryContactDesignation || ''}
                  onChange={(e) => setFormData({ ...formData, primaryContactDesignation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email <span className="text-rose-500">*</span></label>
              <input
                type="email"
                value={formData.primaryContactEmail || ''}
                onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.primaryContactPhone || ''}
                  onChange={(e) => setFormData({ ...formData, primaryContactPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alternate Phone <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={formData.primaryContactAlternatePhone || ''}
                  onChange={(e) => setFormData({ ...formData, primaryContactAlternatePhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Organization Address */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Organization Address</h4>
              <p className="text-xs text-slate-400 font-medium">Registered address of the organization.</p>
            </div>
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" /> Edit on Map
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Address Line 1 <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={formData.addressLine1 || ''}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                value={formData.addressLine2 || ''}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">City <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">State <span className="text-rose-500">*</span></label>
                <select
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  <option>Texas</option>
                  <option>California</option>
                  <option>New York</option>
                  <option>Florida</option>
                  <option>Illinois</option>
                  <option>Washington</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ZIP Code <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.pinCode || ''}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Country <span className="text-rose-500">*</span></label>
              <select
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              >
                <option>United States</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 3: Organization Preferences & Enabled Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Organization Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900">Organization Preferences</h4>
            <p className="text-xs text-slate-400 font-medium">Configure organization level preferences.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Time Zone</label>
              <select
                value={formData.defaultTimeZone || ''}
                onChange={(e) => setFormData({ ...formData, defaultTimeZone: e.target.value })}
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
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Date Format</label>
              <select
                value={formData.defaultDateFormat || ''}
                onChange={(e) => setFormData({ ...formData, defaultDateFormat: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              >
                <option>MM/DD/YYYY (05/19/2025)</option>
                <option>MMM DD, YYYY (May 19, 2025)</option>
                <option>YYYY-MM-DD (2025-05-19)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Items Per Page</label>
              <select
                value={formData.itemsPerPage || 20}
                onChange={(e) => setFormData({ ...formData, itemsPerPage: parseInt(e.target.value) || 20 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Time Format</label>
              <select
                value={formData.defaultTimeFormat || ''}
                onChange={(e) => setFormData({ ...formData, defaultTimeFormat: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              >
                <option>12 Hour (05:30 PM)</option>
                <option>24 Hour (17:30)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Currency</label>
              <select
                value={formData.currency || ''}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              >
                <option>USD ($) - US Dollar</option>
                <option>EUR (€) - Euro</option>
                <option>GBP (£) - British Pound</option>
                <option>CAD ($) - Canadian Dollar</option>
              </select>
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

          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formData.enableMultiLocation}
                onChange={(e) => setFormData({ ...formData, enableMultiLocation: e.target.checked })}
                className="mt-0.5 accent-purple-600 rounded"
              />
              <div>
                <span className="font-bold text-slate-900">Enable Multi-Location</span>
                <p className="text-[10px] text-slate-400">Allow managing multiple locations under this organization.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Right: Enabled Modules Grid */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900">Enabled Modules</h4>
            <p className="text-xs text-slate-400 font-medium">Enable or disable modules for your organization.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {Object.keys(modules).map((modKey) => (
              <div key={modKey} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-800">{modKey}</span>
                <button
                  onClick={() => toggleModule(modKey)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    modules[modKey] ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow"></span>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsModuleAccessModalOpen(true)}
              className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1"
            >
              Manage Module Access <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Location Modal */}
      <MapLocationModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialAddress={{
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode,
          country: formData.country,
          latitude: formData.latitude,
          longitude: formData.longitude,
        }}
        onSave={handleMapLocationSave}
      />

      {/* Manage Module Access Modal */}
      <ModuleAccessModal
        isOpen={isModuleAccessModalOpen}
        onClose={() => setIsModuleAccessModalOpen(false)}
        enabledModules={modules}
        onSaveModules={(updated) => setModules(updated)}
      />
    </div>
  );
};

export default OrganizationSettingsPage;
