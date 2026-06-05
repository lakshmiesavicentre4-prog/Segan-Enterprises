/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ShieldCheck, Phone, Mail, Award, Clock, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="bg-[#020617] border-t-8 border-[#F59E0B] text-blue-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Segment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-[#F59E0B]/20">
          
          {/* Column 1: Info and Slogan */}
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 shrink-0 bg-white p-1 rounded-full shadow-md border-2 border-white ring-2 ring-[#F59E0B]">
                <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-white tracking-widest uppercase block text-shadow-sm">
                  {t('portalName')}
                </span>
                <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest block mt-0.5">
                  Official Digital Gateway
                </span>
              </div>
            </div>
            <p className="text-sm font-semibold text-blue-100 max-w-sm leading-relaxed border-l-2 border-[#F59E0B] pl-3">
              Authorized Premium Digital Service Center platform simplifying governmental citizen applications (A2Z Online Service), PAN, pensions, and certificates with real-time tracking, secure document vaulting, and automated state-audit logs.
            </p>
          </div>

          <div className="md:col-span-1 flex flex-col justify-center items-start md:items-end space-y-2 text-xs font-bold text-blue-100 uppercase tracking-widest text-left md:text-right">
             <p className="flex items-center space-x-2"><ShieldCheck className="w-4 h-4 text-[#F59E0B]" /> <span>256-Bit SSL Encrypted Portal</span></p>
             <p className="flex items-center space-x-2"><Award className="w-4 h-4 text-[#F59E0B]" /> <span>ISO 9001:2015 Certified Service</span></p>
             <p className="flex items-center space-x-2"><Check className="w-4 h-4 text-[#F59E0B]" /> <span>Authorized e-Sevai Center Point</span></p>
          </div>

        </div>

        {/* Bottom Segment */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold text-blue-300 uppercase tracking-widest">
          <p>
            © {new Date().getFullYear()} SEAGAN ENTERPRISES. All Rights Reserved. Crafted for digital inclusion.
          </p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-[#F59E0B] cursor-pointer transition-colors">National Portal of India</span>
            <span className="hover:text-[#F59E0B] cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#F59E0B] cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-[#F59E0B] cursor-pointer transition-colors">Feedback</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
