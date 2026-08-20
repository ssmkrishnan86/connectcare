import React from 'react';
import { Outlet } from 'react-router-dom';

export const SettingsLayout: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic Outlet Sub-Page View */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
