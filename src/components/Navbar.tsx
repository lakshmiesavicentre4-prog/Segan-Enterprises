/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { ThemeToggle } from './ThemeToggle';
import { Bell, LogOut, Shield, User, Globe, MessageSquare, Check, CheckSquare, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  };

  const handleNavClick = (view: 'home' | 'auth' | 'admin-dashboard' | 'user-dashboard', sectionId?: string) => {
    setView(view);
    setMobileMenuOpen(false);
    if (sectionId) {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-[#091114]/70 backdrop-blur-2xl shadow-[0_4px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_4px_30px_rgb(0,0,0,0.1)]">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-50/30 to-emerald-50/30 dark:from-teal-900/10 dark:to-purple-900/10 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-10">
        
        {/* Brand Header */}
        <div 
          onClick={() => handleNavClick('home')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          {/* Emblem representing TN Golden Temple / Tower Gilt Portal */}
          <div className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 group-hover:scale-105 transition-all duration-300 shrink-0 animate-fade-in bg-white dark:bg-white/5 p-1 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 ring-1 ring-slate-900/5 dark:ring-white/10">
            <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-black text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight leading-none">
                {t('portalName')}
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50 whitespace-nowrap shadow-sm">
                e-Sevai
              </span>
            </div>
            <p className="text-[11px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight hidden md:block mt-0.5">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 md:space-x-4">
          
          {/* Navigation links for Desktop */}
          <nav className="hidden lg:flex items-center space-x-1 mr-2 text-sm font-bold bg-slate-100/50 dark:bg-[#0b1418]/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
            <button 
              onClick={() => handleNavClick('home')}
              className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                currentView === 'home' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              {t('home')}
            </button>
            <button 
              onClick={() => handleNavClick('home', 'services-grid-section')}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-300"
            >
              {t('services')}
            </button>
            <button 
              onClick={() => handleNavClick('home', 'contact-section-id')}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-300"
            >
              {t('contact')}
            </button>
          </nav>

          {/* Language Selector */}
          <button
            id="lang-switch-btn"
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-[#0b1418]/50 backdrop-blur-md text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-200 dark:hover:border-teal-900/50 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all shadow-sm"
          >
            <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
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
                className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0b1418]/70 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 shadow-sm transition-all"
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
                <div className="absolute right-0 mt-3 w-72 md:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1418] shadow-2xl p-4 z-50 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <h4 className="font-semibold text-xs md:text-sm">Notifications ({unreadCount} new)</h4>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
                      >
                        <CheckSquare className="w-3 h-3" />
                        <span className="hidden sm:inline">Mark all read</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2 mt-2 pr-1">
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
                              ? 'bg-zinc-50 dark:bg-[#0b1418]/40 border-slate-100 dark:border-slate-900' 
                              : 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-100/50 dark:border-teal-900/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white mb-0.5 block">{notif.title}</span>
                            {!notif.isRead && (
                              <button 
                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                className="text-slate-400 hover:text-teal-600 p-0.5 rounded-md"
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
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-teal-200 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100/50 dark:hover:bg-teal-950/70 shadow-sm transition-all duration-300"
              >
                {currentUser.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                <span className="max-w-[100px] truncate">{currentUser.fullName}</span>
              </button>

              <button
                id="navbar-logout-btn"
                onClick={logoutUser}
                className="hidden lg:flex p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-100 dark:hover:border-red-950 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/40 dark:hover:bg-red-950/20 shadow-sm transition-all"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="navbar-login-btn"
              onClick={() => handleNavClick('auth')}
              className="hidden lg:flex px-4 py-2 bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:glow shadow-md hover:from-teal-600 hover:to-teal-500 transition-all"
            >
              {t('login')}
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-[#0b1418]/50 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091114] animate-fade-in shadow-xl absolute w-full left-0 origin-top">
          <div className="px-4 py-6 flex flex-col space-y-4">
            <button 
              onClick={() => handleNavClick('home')}
              className="w-full text-left font-semibold text-lg py-2 border-b border-slate-100 dark:border-slate-900 text-slate-800 dark:text-white"
            >
              {t('home')}
            </button>
            <button 
              onClick={() => handleNavClick('home', 'services-grid-section')}
              className="w-full text-left font-semibold text-lg py-2 border-b border-slate-100 dark:border-slate-900 text-slate-800 dark:text-white"
            >
              {t('services')}
            </button>
            <button 
              onClick={() => handleNavClick('home', 'contact-section-id')}
              className="w-full text-left font-semibold text-lg py-2 border-b border-slate-100 dark:border-slate-900 text-slate-800 dark:text-white"
            >
              {t('contact')}
            </button>

            {/* Language Selection in mobile menu */}
            <div className="py-2 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center">
              <span className="font-semibold text-lg text-slate-800 dark:text-white">Language</span>
              <button
                onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 shadow-sm"
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span className="font-bold">{language === 'en' ? 'தமிழ்' : 'English'}</span>
              </button>
            </div>

            {/* Mobile Auth/Dashboard state */}
            {currentUser ? (
              <div className="pt-2 space-y-3">
                <button 
                  onClick={navigateToDashboard}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-slate-100 dark:bg-[#0b1418] text-slate-800 dark:text-white font-semibold"
                >
                  {currentUser.role === 'user' ? <User className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  <span>{currentUser.role === 'user' ? 'User Dashboard' : 'Admin Dashboard'}</span>
                </button>
                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => handleNavClick('auth')}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-xl text-lg font-bold shadow-md"
                >
                  {t('login')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

