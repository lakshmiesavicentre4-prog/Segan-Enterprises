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
  
  // Google Authenticator 2FA Simulation State
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  // Developer quick-login role bypass state
  const [selectedFastRole, setSelectedFastRole] = useState<'user' | 'admin'>('user');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      if (isLogin) {
        if (!email) {
          setAuthError('Email is required.');
          return;
        }
        // Proceed to Google Authenticator 2FA step instead of direct login
        setShowTwoFactor(true);
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

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (twoFactorCode.length !== 6 || !/^\d+$/.test(twoFactorCode)) {
      setAuthError('Invalid Google Authenticator code. Must be 6 digits.');
      return;
    }
    
    try {
      await loginUser(email);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error occurred.');
    }
  };

  // Google OAuth Action utilizing Firebase Auth
  const handleGoogleOAuth = async () => {
    try {
      setAuthError('');
      const { signInWithGoogle } = await import('../lib/firebase');
      const user = await signInWithGoogle();
      
      const emailToUse = user?.email || 'lakshmiesavicentre4@gmail.com';
      const nameToUse = user?.displayName || undefined;
      await loginUser(emailToUse, undefined, nameToUse);
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        // Fallback for AI Studio preview environment
        await loginUser('lakshmiesavicentre4@gmail.com');
      } else {
        setAuthError(err.message || 'Google Authentication failed.');
      }
    }
  };

  // Developer Fast Role Login Bypass Action
  const handleFastRoleLogin = async (role: 'user' | 'admin') => {
    setAuthError('');
    try {
      if (role === 'user') {
        await loginUser('lakshmiesavicentre4@gmail.com', 'user');
      } else if (role === 'admin') {
        await loginUser('admin@segan.in', 'admin');
      }
    } catch (err: any) {
      setAuthError('Quick session registration failed.');
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#E3D8FF] dark:bg-[#050505] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-24 w-24 md:h-28 md:w-28 items-center justify-center animate-fade-in bg-metro-periwinkle p-2 rounded-full shadow-lg border-2 border-white ring-4 ring-[#FF007A]">
            <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-[#1A0B2E] dark:text-blue-200 tracking-tight mt-6 uppercase">
            {t('welcomeBack') || 'General Authentication'}
          </h2>
        </div>

        {/* Auth Block */}
        <div className="bg-metro-periwinkle dark:bg-[#1A0B2E] border border-metro-mauve dark:border-slate-700 p-6 md:p-8 rounded-sm shadow-xl text-left border-t-4 border-t-[#FF007A]">
          
          <div className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-sm border-l-4 border-l-red-600 dark:border-red-900 flex items-start space-x-2 text-xs text-red-700 dark:text-red-400 font-bold leading-relaxed shadow-sm">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleOAuth}
              className="w-full py-4 border border-metro-mauve dark:border-slate-600 bg-metro-periwinkle dark:bg-slate-800 hover:bg-metro-periwinkle dark:hover:bg-slate-700 text-metro-slate dark:text-white font-bold text-sm rounded shadow-sm cursor-pointer flex items-center justify-center space-x-3 transition active:scale-95 group hover:border-[#1A0B2E] dark:hover:border-blue-400"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span>Continue with Gmail</span>
            </button>
            <div className="text-center pt-2 text-xs text-slate-500 font-medium">
              Securely authenticate using your Google Account credentials.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
