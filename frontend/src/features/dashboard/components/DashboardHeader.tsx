import React from 'react';

export const DashboardHeader: React.FC = () => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
      <p className="text-xs text-slate-500 mt-1">Welcome back, John Admin! Here's what's happening today.</p>
    </div>
  );
};
