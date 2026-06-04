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
      default:
        return <PublicHome />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0c0a09] text-slate-700 dark:text-slate-350 select-none transition-colors duration-300 w-full overflow-x-hidden">
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
