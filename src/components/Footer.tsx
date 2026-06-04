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
    <footer className="bg-[#1a2b56] border-t-4 border-[#FFAE00] text-blue-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Segment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-8 border-b border-[#2a4382]">
          
          {/* Column 1: Info and Slogan */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 shrink-0 bg-white p-1 rounded-full shadow-md border-2 border-white ring-2 ring-[#FFAE00]">
                <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-wide uppercase">
                {t('portalName')}
              </span>
            </div>
            <p className="text-sm font-medium text-blue-100 max-w-sm mt-3 leading-relaxed">
              Authorized Premium Digital Service Center platform simplifying governmental citizen applications (A2Z Online Service), PAN, pensions, and certificates with real-time tracking, secure document vaulting, and automated state-audit logs.
            </p>
          </div>

        </div>

        {/* Bottom Segment */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-blue-300">
          <p>
            © {new Date().getFullYear()} SEAGAN ENTERPRISES. All Rights Reserved. Crafted for digital inclusion.
          </p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-[#2a4382]">•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="text-[#2a4382]">•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Feedback Form</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
