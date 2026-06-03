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
    <footer className="bg-white dark:bg-[#0A1128] border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Segment */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
          
          {/* Column 1: Info and Slogan */}
          <div className="md:col-span-1.5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 shrink-0 animate-fade-in bg-white p-1 rounded-xl shadow-md border border-slate-100 dark:border-slate-800">
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

          {/* Column 2: Quick Links */}
          <div>
            <h5 className="font-display font-medium text-slate-900 dark:text-white text-sm mb-4 tracking-wider uppercase">
              DEPARTMENTS
            </h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-blue-600 dark:hover:text-amber-400 cursor-pointer transition-colors">TNeGA Portal</span></li>
              <li><span className="hover:text-blue-600 dark:hover:text-amber-400 cursor-pointer transition-colors">Revenue Department</span></li>
              <li><span className="hover:text-blue-600 dark:hover:text-amber-400 cursor-pointer transition-colors">Social Welfare Dept</span></li>
              <li><span className="hover:text-blue-600 dark:hover:text-amber-400 cursor-pointer transition-colors">Central IT Services</span></li>
            </ul>
          </div>

          {/* Column 3: Secure Seals */}
          <div>
            <h5 className="font-display font-medium text-slate-900 dark:text-white text-sm mb-4 tracking-wider uppercase">
              SECURITY AUDITS
            </h5>
            <div className="space-y-3.5">
              <div className="flex items-center text-xs space-x-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-400">SSL Secured Vaulting (ISO/IEC 27001)</span>
              </div>
              <div className="flex items-center text-xs space-x-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-400">TNeGA Compliant e-Sevai Code</span>
              </div>
            </div>
          </div>

          {/* Column 4: Contact helpline coordinates */}
          <div>
            <h5 className="font-display font-medium text-slate-900 dark:text-white text-sm mb-4 tracking-wider uppercase">
              SUPPORT HELPDESK
            </h5>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>+91 94440 88888 (Toll Free)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>operations@segan.in</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Mon - Sat (9:00 AM - 6:00 PM)</span>
              </li>
            </ul>
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
