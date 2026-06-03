/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PublicHome } from './pages/PublicHome';
import { AuthPage } from './pages/AuthPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AlertTriangle, Clock } from 'lucide-react';

// Sub App orchestrator inside Context
const AppContent: React.FC = () => {
  const { currentView, settings, currentUser, t } = useApp();

  // Route views
  const renderCurrentView = () => {
    // Check global maintenance bypass
    if (settings.maintenanceMode && currentUser?.role !== 'admin') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#020817] min-h-[60vh] space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 animate-bounce" />
          <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
            System Under Temporary Maintenance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            TNeGA digital gateways are undergoing scheduled security audits. Access keys will re-initialize shortly. Thank you for your patience.
          </p>
          <div className="inline-flex items-center text-[11px] text-blue-600 font-mono">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>Expected resumption: 6:00 AM UTC</span>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'home':
        return <PublicHome />;
      case 'auth':
        return <AuthPage />;
      case 'user-dashboard':
        return currentUser ? <UserDashboard /> : <AuthPage />;
      case 'admin-dashboard':
        return currentUser && currentUser.role !== 'user' ? <AdminDashboard /> : <AuthPage />;
      default:
        return <PublicHome />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-700 dark:text-slate-350 select-none transition-colors duration-300 w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {renderCurrentView()}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
