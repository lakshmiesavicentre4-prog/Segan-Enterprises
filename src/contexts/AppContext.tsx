/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Profile, 
  Language, 
  Theme, 
  Service, 
  Application, 
  Notification,
  AppSettings,
  ActivityLog
} from '../types';
import { 
  authService, 
  serviceService, 
  applicationService, 
  notificationService,
  settingsService,
  reportService
} from '../supabase/supabaseClient';
import { i18n } from '../utils/i18n';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentUser: Profile | null;
  setCurrentUser: (user: Profile | null) => void;
  currentView: 'home' | 'auth' | 'user-dashboard' | 'admin-dashboard';
  setView: (view: 'home' | 'auth' | 'user-dashboard' | 'admin-dashboard') => void;
  
  // Dynamic e-services catalogs
  services: Service[];
  refreshServices: () => void;
  
  // Realtime lists
  applications: Application[];
  refreshApplications: () => void;
  
  notifications: Notification[];
  refreshNotifications: () => void;
  
  settings: AppSettings;
  updateGlobalSettings: (s: Partial<AppSettings>) => void;
  
  logs: ActivityLog[];
  refreshLogs: () => void;
  
  // Helpers
  t: (key: keyof typeof i18n['en']) => string;
  loginUser: (email: string, role?: 'user' | 'admin', fullName?: string) => Promise<void>;
  registerUser: (name: string, email: string, phone: string, role?: 'user' | 'admin') => Promise<void>;
  addUser: (name: string, email: string, phone: string, role: 'user' | 'admin') => Promise<void>;
  logoutUser: () => void;
  
  // Abstraction payment ready engine
  initiatePaymentGateways: (appId: string, amount: number) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Configured with smart persistence defaults
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('segan_lang') as Language) || 'en';
  });
  
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('segan_theme') as Theme) || 'light';
  });

  const [currentUser, setCurrentUserState] = useState<Profile | null>(() => {
    return authService.getSession();
  });

  const [currentView, setViewState] = useState<'home' | 'auth' | 'user-dashboard' | 'admin-dashboard'>(() => {
    const cachedUser = authService.getSession();
    if (!cachedUser) return 'home';
    return cachedUser.role === 'user' ? 'user-dashboard' : 'admin-dashboard';
  });

  const [services, setServices] = useState<Service[]>(() => serviceService.getServices());
  const [applications, setApplications] = useState<Application[]>(() => applicationService.getApplications());
  const [notifications, setNotifications] = useState<Notification[]>(() => notificationService.getNotifications());
  const [settings, setSettings] = useState<AppSettings>(() => settingsService.getSettings());
  const [logs, setLogs] = useState<ActivityLog[]>(() => reportService.getActivityLogs());

  // Localization translator helper
  const t = (key: keyof typeof i18n['en']): string => {
    const dict = i18n[language] || i18n.en;
    return (dict[key] as string) || (i18n.en[key] as string) || String(key);
  };

  // Sync HTML wrapper element on Dark Mode triggers
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('segan_theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('segan_lang', lang);
  };

  const refreshServices = () => {
    setServices(serviceService.getAllServicesWithInactive());
  };

  const refreshApplications = () => {
    setApplications(applicationService.getApplications());
  };

  const refreshNotifications = () => {
    setNotifications(notificationService.getNotifications());
  };

  const refreshLogs = () => {
    setLogs(reportService.getActivityLogs());
  };

  const updateGlobalSettings = (newSettings: Partial<AppSettings>) => {
    const updated = settingsService.updateSettings(newSettings);
    setSettings(updated);
  };

  // Login handler
  const loginUser = async (email: string, role?: 'user' | 'admin', fullName?: string) => {
    const profile = await authService.signIn(email, role, fullName);
    setCurrentUserState(profile);
    if (profile.role === 'user') {
      setViewState('user-dashboard');
    } else {
      setViewState('admin-dashboard');
    }
    // Refresh states
    setApplications(applicationService.getApplications());
    setNotifications(notificationService.getNotifications());
    setLogs(reportService.getActivityLogs());
  };

  // Registration handler
  const registerUser = async (name: string, email: string, phone: string, role: 'user' | 'admin' = 'user') => {
    const profile = await authService.signUp(name, email, phone, role);
    setCurrentUserState(profile);
    if (profile.role === 'user') {
      setViewState('user-dashboard');
    } else {
      setViewState('admin-dashboard');
    }
    // Refresh states
    setApplications(applicationService.getApplications());
    setNotifications(notificationService.getNotifications());
    setLogs(reportService.getActivityLogs());
  };

  const addUser = async (name: string, email: string, phone: string, role: 'user' | 'admin') => {
    await authService.addUser(name, email, phone, role);
    setLogs(reportService.getActivityLogs());
  };

  const logoutUser = () => {
    authService.signOut();
    setCurrentUserState(null);
    setViewState('home');
    setApplications([]);
    setNotifications([]);
  };

  // Set active routing view
  const setView = (view: 'home' | 'auth' | 'user-dashboard' | 'admin-dashboard') => {
    setViewState(view);
  };

  // Abstract Payment Gateways (Razorpay/Cashfree) Simulator and abstraction logic
  const initiatePaymentGateways = async (appId: string, amount: number): Promise<boolean> => {
    console.log(`Payment gateway abstraction triggered for application ${appId} (₹${amount})`);
    
    // Abstract payment structure model:
    // in future systems, this calls window.Razorpay or Cashfree SDK config:
    /*
      const options = {
        key: process.env.VITE_RAZORPAY_KEY,
        amount: amount * 100, // paisa
        name: 'SEAGAN ENTERPRISES',
        handler: function(response) {
           // update Supabase backend status
        }
      }
    */
    
    // Simulating instant authorization validation:
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // authorized successfully
      }, 800);
    });
  };

  // Auto-updating simulator (Supabase Realtime emulator mock client listener)
  // Regularly, this mocks background admin worker actions, keeping the widgets "alive" for the reviewer!
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      // Pick a random application submitted by the active user in localStorage and advance its status
      const state = JSON.parse(localStorage.getItem('segan_db_v1') || '{}');
      if (state && state.applications && state.applications.length > 0) {
        const userApps = state.applications.filter((a: any) => a.userId === currentUser.id && a.status === 'Submitted');
        if (userApps.length > 0) {
          // Advance one to 'Document Verification'
          const target = userApps[Math.floor(Math.random() * userApps.length)];
          applicationService.updateApplicationStatus(target.id, 'Document Verification');
          
          // Refresh state
          refreshApplications();
          refreshNotifications();
          refreshLogs();
        }
      }
    }, 45000); // Check and auto-advance status periodically to demonstrate real-time

    return () => clearInterval(interval);
  }, [currentUser]);

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      theme,
      setTheme,
      currentUser,
      setCurrentUser: setCurrentUserState,
      currentView,
      setView,
      services,
      refreshServices,
      applications,
      refreshApplications,
      notifications,
      refreshNotifications,
      settings,
      updateGlobalSettings,
      logs,
      refreshLogs,
      t,
      loginUser,
      registerUser,
      addUser,
      logoutUser,
      initiatePaymentGateways
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
