/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ShieldCheck, Phone, Mail, Award, Clock, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, setView } = useApp();

  return (
    <footer className="bg-[#050505] border-t-8 border-[#FF007A] text-blue-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Segment */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10 pb-10 border-b border-[#FF007A]/20">
          
          {/* Column 1: Info and Slogan */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 shrink-0 bg-metro-periwinkle p-1 rounded-full shadow-md border-2 border-white ring-2 ring-[#FF007A]">
                <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-white tracking-widest uppercase block text-shadow-sm">
                  {t('portalName')}
                </span>
                <span className="text-[10px] font-bold text-[#FF007A] uppercase tracking-widest block mt-0.5">
                  Official Digital Gateway
                </span>
              </div>
            </div>
            <p className="text-sm font-semibold text-blue-100 max-w-2xl leading-relaxed border-l-2 border-[#FF007A] pl-3">
              Authorized Premium Digital Service Center platform simplifying governmental citizen applications (A2Z Online Service), PAN, pensions, and certificates with real-time tracking, secure document vaulting, and automated state-audit logs.
            </p>
          </div>

          {/* Column 2: Contact Support */}
          <div className="flex flex-col justify-center items-start md:items-end space-y-4 text-xs font-bold text-blue-100 uppercase tracking-widest text-left md:text-right">
            <h4 className="border-b-2 border-[#FF007A] pb-1 inline-block text-white">Contact Support</h4>
            <a href="mailto:seganatoz@gmail.com" className="flex items-center space-x-2 hover:text-[#FF007A] transition-colors">
              <Mail className="w-4 h-4 text-[#FF007A]" /> 
              <span>seganatoz@gmail.com</span>
            </a>
          </div>

        </div>

        {/* Bottom Segment */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold text-blue-300 uppercase tracking-widest">
          <p>
            © {new Date().getFullYear()} SEAGAN ENTERPRISES. All Rights Reserved. Crafted for digital inclusion.
          </p>
          <div className="flex items-center space-x-6 flex-wrap justify-center gap-y-2">
            <button onClick={() => setView('contact')} className="hover:text-[#FF007A] transition-colors focus:outline-none">Contact Us</button>
            <button onClick={() => setView('terms')} className="hover:text-[#FF007A] transition-colors focus:outline-none">Terms & Conditions</button>
            <button onClick={() => setView('refunds')} className="hover:text-[#FF007A] transition-colors focus:outline-none">Refunds & Cancellations</button>
            <button onClick={() => setView('privacy')} className="hover:text-[#FF007A] transition-colors focus:outline-none">Privacy Policy</button>
          </div>
        </div>

      </div>
    </footer>
  );
};
