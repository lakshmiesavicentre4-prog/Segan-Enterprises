/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ShieldCheck, Phone, Mail, Award, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="bg-white dark:bg-[#1c1917] border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Segment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
          
          {/* Column 1: Info and Slogan */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 shrink-0 animate-fade-in bg-white p-1 rounded-sm shadow-md border-2 border-slate-100 dark:border-slate-800">
                <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <span className="font-display font-semibold text-lg text-slate-900 dark:text-white tracking-wide">
                {t('portalName')}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-sm mt-3 leading-relaxed">
              Authorized Premium Digital Service Center platform simplifying governmental citizen applications (e-Sevai), PAN, pensions, and certificates with real-time tracking, secure document vaulting, and automated state-audit logs.
            </p>
          </div>

        </div>

        {/* Bottom Segment */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500 dark:text-slate-500">
          <p>
            © {new Date().getFullYear()} SEAGAN ENTERPRISES. All Rights Reserved. Crafted for digital inclusion.
          </p>
          <div className="flex items-center space-x-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Feedback Form</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
