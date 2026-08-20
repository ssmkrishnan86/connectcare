import React, { useState } from 'react';
import { X, MapPin, Search, Navigation, CheckCircle2 } from 'lucide-react';

interface MapLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddress: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  onSave: (locationData: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export const MapLocationModal: React.FC<MapLocationModalProps> = ({
  isOpen,
  onClose,
  initialAddress,
  onSave,
}) => {
  const [addressLine1, setAddressLine1] = useState(initialAddress.addressLine1 || '123, Care Street, Healthy City');
  const [addressLine2, setAddressLine2] = useState(initialAddress.addressLine2 || 'Near Green Park');
  const [city, setCity] = useState(initialAddress.city || 'Chennai');
  const [state, setState] = useState(initialAddress.state || 'Tamil Nadu');
  const [pinCode, setPinCode] = useState(initialAddress.pinCode || '600001');
  const [country, setCountry] = useState(initialAddress.country || 'India');
  const [latitude, setLatitude] = useState<number>(initialAddress.latitude || 13.0827);
  const [longitude, setLongitude] = useState<number>(initialAddress.longitude || 80.2707);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleSearchAddress = () => {
    if (!searchQuery) return;
    setAddressLine1(searchQuery);
    setCity('Chennai');
    setState('Tamil Nadu');
    setPinCode('600001');
  };

  const handleQuickLocate = (lat: number, lng: number, cty: string, st: string, pin: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setCity(cty);
    setState(st);
    setPinCode(pin);
  };

  const handleConfirm = () => {
    onSave({
      addressLine1,
      addressLine2,
      city,
      state,
      pinCode,
      country,
      latitude,
      longitude,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Interactive Location & Map Settings</h3>
              <p className="text-xs text-slate-500 font-medium">Pin exact GPS coordinates and update facility address</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location, street name, or building name..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={handleSearchAddress}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Locate Address
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Map Canvas Box */}
            <div className="lg:col-span-2 space-y-3">
              <div className="relative h-72 w-full bg-slate-900 rounded-2xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
                {/* Visual Map Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(#8B5CF6 1px, transparent 1px), radial-gradient(#38BDF8 1px, #0F172A 1px)`,
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px',
                  }}
                />

                {/* Simulated Map Roads & Landmark Elements */}
                <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 0 100 Q 200 150 400 80 T 800 200" fill="none" stroke="#60A5FA" strokeWidth="4" />
                  <path d="M 150 0 Q 220 180 350 300" fill="none" stroke="#A78BFA" strokeWidth="3" />
                  <circle cx="400" cy="140" r="60" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />
                </svg>

                {/* Animated Map Pin Marker */}
                <div className="relative z-10 flex flex-col items-center animate-bounce">
                  <div className="px-3 py-1 bg-slate-900/90 text-white text-[10px] font-bold rounded-lg border border-purple-500/50 shadow-xl flex items-center gap-1.5 backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{city}, {state} ({latitude.toFixed(4)}, {longitude.toFixed(4)})</span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xl border-2 border-white mt-1">
                    <MapPin className="h-5 w-5 fill-white text-purple-600" />
                  </div>
                  <div className="h-2 w-6 bg-slate-950/60 rounded-full blur-[2px] mt-0.5"></div>
                </div>

                {/* Map Control Buttons overlay */}
                <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLocate(13.0827, 80.2707, 'Chennai', 'Tamil Nadu', '600001')}
                    className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg border border-slate-700 backdrop-blur-sm shadow"
                  >
                    Chennai Hub
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLocate(12.9716, 77.5946, 'Bengaluru', 'Karnataka', '560001')}
                    className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg border border-slate-700 backdrop-blur-sm shadow"
                  >
                    Bengaluru Hub
                  </button>
                </div>
              </div>

              {/* Latitude & Longitude inputs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Address fields */}
            <div className="space-y-3 text-xs">
              <h5 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1.5">Facility Location Details</h5>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" /> Apply Location Settings
          </button>
        </div>
      </div>
    </div>
  );
};
