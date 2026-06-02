/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { User, ShieldAlert, Key, Globe, Eye, EyeOff, Sparkles, Mail, Phone } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { t, loginUser, registerUser, language } = useApp();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Developer quick-login role bypass state
  const [selectedFastRole, setSelectedFastRole] = useState<'user' | 'admin' | 'super_admin'>('user');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      if (isLogin) {
        if (!email) {
          setAuthError('Email is required.');
          return;
        }
        await loginUser(email);
      } else {
        if (!fullName || !email || !phone) {
          setAuthError('All registration fields are required.');
          return;
        }
        await registerUser(fullName, email, phone);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error occurred.');
    }
  };

  // Developer Fast Role Login Bypass Action
  const handleFastRoleLogin = async (role: 'user' | 'admin' | 'super_admin') => {
    setAuthError('');
    try {
      if (role === 'user') {
        await loginUser('lakshmiesavicentre4@gmail.com', 'user');
      } else if (role === 'admin') {
        await loginUser('admin@segan.in', 'admin');
      } else {
        await loginUser('superadmin@segan.in', 'super_admin');
      }
    } catch (err: any) {
      setAuthError('Quick session registration failed.');
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-emerald-600 shadow-md">
            <span className="text-white font-serif font-bold text-xl tracking-wider">ஸ</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            {isForgotPassword ? 'Reset Password' : (isLogin ? t('welcomeBack') : t('register'))}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t('authSubtext')}
          </p>
        </div>

        {/* Developer Sandbox Fast-Role Chooser */}
        <div className="p-5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm text-left">
          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest flex items-center space-x-1.5 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Developer Fast-Role Chooser (RBAC)</span>
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 font-semibold">
            Bypass standard registration by selecting an authorized security credential role and logging in instantly with pre-seeded files.
          </p>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleFastRoleLogin('user')}
              className="py-2.5 px-2 text-center rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-955/40 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              Citizen (User)
            </button>
            <button
              onClick={() => handleFastRoleLogin('admin')}
              className="py-2.5 px-2 text-center rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-955/40 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              Center Agent (Admin)
            </button>
            <button
              onClick={() => handleFastRoleLogin('super_admin')}
              className="py-2.5 px-2 text-center rounded-xl border border-purple-200 dark:border-purple-900 bg-white dark:bg-slate-900 text-[10px] font-bold text-purple-700 dark:text-purple-305 hover:bg-purple-50 dark:hover:bg-purple-955/40 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              Director (Super)
            </button>
          </div>
        </div>

        {/* Standard User Forms Block */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-md text-left">
          
          {isForgotPassword ? (
            // Forgot password simulated panel
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                An automated secure link will be dispatched to register the recovery token on your device standard inbox.
              </p>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
                  placeholder="ramesh@example.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer text-center uppercase hover:bg-blue-700 transition"
                >
                  Send OTP Reset Code
                </button>
                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full py-2 border border-slate-200 dark:border-slate-800 text-center text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-amber-500 transition cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            // Standard login and register
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      {t('nameLabel')}
                    </label>
                    <input
                      id="auth-name-input"
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-medium"
                      placeholder="Anbarasan S"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      {t('phoneLabel')}
                    </label>
                    <input
                      id="auth-phone-input"
                      type="tel"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-medium"
                      placeholder="+91 94440 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                  {t('emailLabel')}
                </label>
                <input
                  id="auth-email-input"
                  type="email"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-medium focus:ring-1 focus:ring-blue-500"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                    {t('passwordLabel')}
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {t('forgotPassword')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-medium focus:ring-1 focus:ring-blue-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-100 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/50 flex items-start space-x-2 text-xs text-red-500 font-semibold leading-relaxed">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider hover:from-blue-600 hover:to-blue-500 active:scale-98 transition cursor-pointer"
              >
                {isLogin ? 'Verify Security Portal Session' : 'Create Live Citizen Vault Account'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setAuthError('');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {isLogin ? t('noAccount') : t('alreadyHaveAccount')}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
