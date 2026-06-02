/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { ThemeToggle } from './ThemeToggle';
import { Bell, LogOut, Shield, User, Globe, MessageSquare, Check, CheckSquare } from 'lucide-react';
import { notificationService, applicationService } from '../supabase/supabaseClient';

export const Navbar: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    currentUser, 
    currentView, 
    setView, 
    logoutUser,
    notifications,
    refreshNotifications,
    refreshApplications,
    t 
  } = useApp();

  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.markAsRead(id);
    refreshNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    refreshNotifications();
  };

  // Nav item clicks
  const navigateToDashboard = () => {
    if (currentUser) {
      if (currentUser.role === 'user') {
        setView('user-dashboard');
      } else {
        setView('admin-dashboard');
      }
    } else {
      setView('auth');
    }
    setNotifMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Header */}
        <div 
          onClick={() => setView('home')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          {/* Emblem representing TN Golden Temple / Tower Gilt Portal */}
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 to-emerald-600 shadow-md group-hover:scale-105 transition-all duration-300">
            <span className="text-white font-serif font-bold text-lg tracking-wider">ஸ</span>
            {/* Subtle glow rim */}
            <div className="absolute inset-0.5 rounded-lg border border-white/20"></div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold text-lg md:text-xl text-slate-900 dark:text-white tracking-wide">
                {t('portalName')}
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40">
                e-Sevai
              </span>
            </div>
            <p className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 tracking-tight">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 md:space-x-3">
          
          {/* Navigation links for Desktop */}
          <nav className="hidden lg:flex items-center space-x-1 mr-2 text-sm font-medium">
            <button 
              onClick={() => setView('home')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-300 ${
                currentView === 'home' 
                  ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {t('home')}
            </button>
            <button 
              onClick={() => {
                setView('home');
                setTimeout(() => {
                  document.getElementById('services-grid-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            >
              {t('services')}
            </button>
            <button 
              onClick={() => {
                setView('home');
                setTimeout(() => {
                  document.getElementById('contact-section-id')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            >
              {t('contact')}
            </button>
          </nav>

          {/* Language Selector */}
          <button
            id="lang-switch-btn"
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[12px] font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-100 transition-all shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Realtime Notification Bell */}
          {currentUser && (
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-905/70 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-all"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Droplist Slide Panel */}
              {notifMenuOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-semibold text-sm">Notifications ({unreadCount} new)</h4>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                      >
                        <CheckSquare className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2 mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs py-6 text-slate-400">No notifications yet</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => {
                            notificationService.markAsRead(notif.id);
                            refreshNotifications();
                          }}
                          className={`p-2.5 rounded-xl text-left border text-xs transition-colors cursor-pointer ${
                            notif.isRead 
                              ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-900' 
                              : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100/50 dark:border-blue-900/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white mb-0.5 block">{notif.title}</span>
                            {!notif.isRead && (
                              <button 
                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                className="text-slate-400 hover:text-blue-600 p-0.5 rounded-md"
                                title="Mark read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed mb-1">{notif.message}</p>
                          <span className="text-[9px] text-slate-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Session Action Profiles */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <button 
                id="navbar-dashboard-btn"
                onClick={navigateToDashboard}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-950/70 shadow-sm transition-all duration-300"
              >
                {currentUser.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                <span className="hidden md:inline max-w-[100px] truncate">{currentUser.fullName}</span>
                <span className="md:hidden">Dashboard</span>
              </button>

              <button
                id="navbar-logout-btn"
                onClick={logoutUser}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-100 dark:hover:border-red-950 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/40 dark:hover:bg-red-950/20 shadow-sm transition-all"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="navbar-login-btn"
              onClick={() => setView('auth')}
              className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:glow shadow-md hover:from-blue-600 hover:to-blue-500 transition-all"
            >
              {t('login')}
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
