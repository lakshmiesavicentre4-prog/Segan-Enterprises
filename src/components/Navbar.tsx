/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
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
    <header className="sticky top-0 z-50 w-full shadow-lg">
      <div className="bg-[#1A0B2E] border-b-4 border-[#FF007A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-10">
          
          {/* Brand Header */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center space-x-4 cursor-pointer group"
          >
            {/* Emblem representing TN Golden Temple / Tower Gilt Portal */}
            <div className="relative flex items-center justify-center w-12 h-12 md:w-16 md:h-16 group-hover:scale-105 transition-all duration-300 shrink-0 animate-fade-in bg-metro-periwinkle p-1 rounded-full shadow-md border-2 border-white ring-2 ring-[#FF007A]">
              <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="font-display font-black text-xl md:text-2xl text-white tracking-widest leading-none text-shadow-sm uppercase">
                  {t('portalName')}
                </span>
              </div>
              <p className="text-[10px] md:text-xs font-bold text-[#FF007A] tracking-widest hidden md:block mt-1 uppercase">
                {language === 'en' ? 'A2Z Online Service | TN Digital' : 'ஏ2இசட் ஆன்லைன் சேவை'}
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-2 md:space-x-4 pr-2">
            
            {/* Navigation links for Desktop */}
            <nav className="hidden lg:flex items-center space-x-1 mr-2 text-sm font-bold p-1 rounded-sm">
              <button 
                onClick={() => handleNavClick('home')}
                className={`px-4 py-2 font-bold text-xs uppercase tracking-wider transition-all duration-300 border-b-2 ${
                  currentView === 'home' 
                    ? 'border-[#FF007A] text-[#FF007A]' 
                    : 'border-transparent text-white hover:text-[#FF007A]'
                }`}
              >
                {t('home')}
              </button>
              <button 
                onClick={() => handleNavClick('home', 'services-grid-section')}
                className={`px-4 py-2 font-bold text-xs uppercase tracking-wider transition-all duration-300 border-b-2 border-transparent hover:text-[#FF007A]`}
              >
                {t('services')}
              </button>
              <button 
                onClick={() => handleNavClick('home', 'contact-section-id')}
                className={`px-4 py-2 font-bold text-xs uppercase tracking-wider transition-all duration-300 border-b-2 border-transparent hover:text-[#FF007A]`}
              >
                {t('contact')}
              </button>
            </nav>

          {/* Language Selector */}
          <button
            id="lang-switch-btn"
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-sm border border-[#2a3f7a] bg-[#1A0B2E] text-xs font-bold text-blue-200 hover:text-white hover:border-[#4a6ab5] transition-all"
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Realtime Notification Bell */}
          {currentUser && (
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="relative p-2.5 rounded-sm border border-[#2a3f7a] bg-[#1A0B2E] text-blue-200 hover:text-white shadow-sm transition-all"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Droplist Slide Panel */}
              {notifMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 md:w-96 rounded-sm border-2 border-metro-mauve dark:border-slate-800 bg-metro-periwinkle dark:bg-[#1A0B2E] shadow-2xl p-4 z-50 text-metro-slate dark:text-slate-300">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-[#050505] dark:text-blue-400" />
                      <h4 className="font-semibold text-xs md:text-sm">Notifications ({unreadCount} new)</h4>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] font-medium text-metro-cobalt dark:text-blue-400 hover:underline flex items-center space-x-1"
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
                          className={`p-2.5 rounded-sm text-left border text-xs transition-colors cursor-pointer ${
                            notif.isRead 
                              ? 'bg-metro-periwinkle dark:bg-[#1A0B2E]/40 border-slate-100 dark:border-slate-900' 
                              : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100/50 dark:border-blue-900/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white mb-0.5 block">{notif.title}</span>
                            {!notif.isRead && (
                              <button 
                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                className="text-slate-400 hover:text-metro-cobalt p-0.5 rounded-md"
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
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold border border-blue-400 bg-blue-100/10 text-white hover:bg-blue-100/20 shadow-sm transition-all duration-300"
              >
                {currentUser.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                <span className="max-w-[100px] truncate">{currentUser.fullName}</span>
              </button>

              <button
                id="navbar-logout-btn"
                onClick={logoutUser}
                className="hidden lg:flex p-2.5 rounded-sm border border-[#2a3f7a] bg-[#1A0B2E] text-blue-200 hover:text-red-400 hover:border-red-900 hover:bg-red-900/30 shadow-sm transition-all"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="navbar-login-btn"
              onClick={() => handleNavClick('auth')}
              className="hidden lg:flex px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm text-xs sm:text-sm font-semibold shadow-md hover:from-green-500 hover:to-green-400 transition-all"
            >
              {t('login')}
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-sm border border-[#2a3f7a] bg-[#1A0B2E] text-blue-200 hover:text-white transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-metro-mauve dark:border-slate-800 bg-metro-periwinkle dark:bg-[#050505] animate-fade-in shadow-xl absolute w-full left-0 origin-top">
          <div className="px-4 py-6 flex flex-col space-y-4">
            <button 
              onClick={() => handleNavClick('home')}
              className="w-full text-left font-semibold text-lg py-2 border-b border-slate-100 dark:border-slate-900 text-metro-slate dark:text-white"
            >
              {t('home')}
            </button>
            <button 
              onClick={() => handleNavClick('home', 'services-grid-section')}
              className="w-full text-left font-semibold text-lg py-2 border-b border-slate-100 dark:border-slate-900 text-metro-slate dark:text-white"
            >
              {t('services')}
            </button>
            <button 
              onClick={() => handleNavClick('home', 'contact-section-id')}
              className="w-full text-left font-semibold text-lg py-2 border-b border-slate-100 dark:border-slate-900 text-metro-slate dark:text-white"
            >
              {t('contact')}
            </button>

            {/* Language Selection in mobile menu */}
            <div className="py-2 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center">
              <span className="font-semibold text-lg text-metro-slate dark:text-white">Language</span>
              <button
                onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-sm border-2 border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-sm"
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
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-sm bg-metro-teal dark:bg-[#1A0B2E] text-metro-slate dark:text-white font-semibold"
                >
                  {currentUser.role === 'user' ? <User className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  <span>{currentUser.role === 'user' ? 'User Dashboard' : 'Admin Dashboard'}</span>
                </button>
                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-sm border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => handleNavClick('auth')}
                  className="w-full py-3.5 bg-gradient-to-r from-[#050505] to-blue-600 text-white rounded-sm text-lg font-bold shadow-md"
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

