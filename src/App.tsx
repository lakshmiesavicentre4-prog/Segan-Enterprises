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
import { PolicyPage } from './pages/PolicyPage';


// Sub App orchestrator inside Context
const AppContent: React.FC = () => {
  const { currentView, settings, currentUser, t } = useApp();

  // Route views
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <PublicHome />;
      case 'auth':
        return <AuthPage />;
      case 'user-dashboard':
        return currentUser ? <UserDashboard /> : <AuthPage />;
      case 'admin-dashboard':
        return currentUser && currentUser.role !== 'user' ? <AdminDashboard /> : <AuthPage />;
      case 'contact':
        return <PolicyPage type="contact" />;
      case 'terms':
        return <PolicyPage type="terms" />;
      case 'refunds':
        return <PolicyPage type="refunds" />;
      case 'privacy':
        return <PolicyPage type="privacy" />;
      default:
        return <PublicHome />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-metro-periwinkle dark:bg-[#050505] text-metro-slate dark:text-slate-350 select-none transition-colors duration-300 w-full overflow-x-hidden">
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
