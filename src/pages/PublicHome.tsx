/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Search, 
  ArrowRight, 
  Award, 
  Clock, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  Check, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  BadgeCheck,
  Users
} from 'lucide-react';
import { applicationService } from '../supabase/supabaseClient';
import { Hero3D } from '../components/Hero3D';

export const PublicHome: React.FC = () => {
  const { t, services, setView, currentUser, language } = useApp();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Tracking query states
  const [trackToken, setTrackToken] = useState('');
  const [trackedApplication, setTrackedApplication] = useState<any>(null);
  const [trackError, setTrackError] = useState('');

  // Contact form state
  // Removed

  // FAQ states
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Unique Categories computed from active services catalog
  const categories = ['All', ...new Set(services.map(s => s.category))];

  // Filtering services based on category and Search query
  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesQuery = 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Action on Apply Button Click
  const handleApplyClick = (serviceId: string) => {
    if (!currentUser) {
      setView('auth');
    } else {
      setView('user-dashboard');
      // Store targeted service in temp memory to auto open form
      localStorage.setItem('segan_auto_apply_service_id', serviceId);
    }
  };

  // Immediate status search query tracking trigger
  const handleTrackStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTrackedApplication(null);

    if (!trackToken.trim()) {
      setTrackError('Please enter a valid application reference number.');
      return;
    }

    // Try finding in database (localDB simulation)
    const state = JSON.parse(localStorage.getItem('segan_db_v1') || '{}');
    if (state && state.applications) {
      const found = state.applications.find(
        (app: any) => app.tokenNumber.trim().toUpperCase() === trackToken.trim().toUpperCase()
      );
      if (found) {
        setTrackedApplication(found);
      } else {
        setTrackError('Token number not found. Verify format: SEAGAN-2026-000001');
      }
    } else {
      setTrackError('No submission records found.');
    }
  };

  // Progression steps mapping for visualization bar
  const STAGES = [
    'Submitted',
    'Document Verification',
    'Under Review',
    'Processing',
    'Approved',
    'Completed'
  ];

  const getStageIndex = (status: string) => {
    return STAGES.indexOf(status);
  };

  const FAQS = [
    {
      q: language === 'en' ? 'What documents do I need for Community and Income proofs?' : 'சாதி மற்றும் வருமானச் சான்றிதழ்களுக்கு என்ன ஆவணங்கள் தேவை?',
      a: language === 'en' 
        ? 'Typically, you need your Aadhaar card, Ration Card (or Family Card), income proof (such as a salary slip/IT return), and a self-declaration certificate signed by the applicant.'
        : 'பொதுவாக, உங்கள் ஆதார் அட்டை, ரேஷன் கார்டு (குடும்ப அட்டை), வருமானச் சான்று (சம்பளச் சீட்டு/ஐடி ரிட்டர்ன் போன்றவை) மற்றும் விண்ணப்பதாரர் கையொப்பமிட்ட சுய அறிவிப்புச் சான்றிதழ் தேவைப்படும்.'
    },
    {
      q: language === 'en' ? 'What is the processing time for PAN and pension files?' : 'பான் கார்டு மற்றும் முதியோர் ஓய்வூதிய விண்ணப்பங்கள் முடிவடைய எவ்வளவு நாட்கள் ஆகும்?',
      a: language === 'en'
        ? 'PAN cards are issued by NSDL within 15 working days. Social pension requests undergo rural/urban field officer audits and typically conclude in 20-30 days.'
        : 'பான் கார்டுகள் NSDL மூலம் 15 வேலை நாட்களுக்குள் வழங்கப்படும். முதியோர் ஓய்வூதிய விண்ணப்பங்கள் ஊரக/நகர்ப்புற கள ஆய்வு அதிகாரிகளின் தணிக்கைக்கு உட்படுவதால் பொதுவாக 20-30 நாட்கள் வரை ஆகும்.'
    },
    {
      q: language === 'en' ? 'Are these certificates digitally signed and government authorized?' : 'இங்கு வழங்கப்படும் சான்றிதழ்கள் டிஜிட்டல் கையொப்பமிட்ட அரசு அங்கீகாரம் பெற்றவையா?',
      a: language === 'en'
        ? 'Yes! All e-services are routed through government verification schemes, generated with cryptographically signed QR codes directly acceptable in universities and government banks.'
        : 'ஆம்! அனைத்து இ-சேவைகளும் அரசு சரிபார்ப்பு மற்றும் தணிக்கையாளர் திட்டங்களின் கீழ் உருவாக்கப்பட்டு, பல்கலைக்கழகங்கள் மற்றும் வங்கிகளில் நேரடியாக ஏற்றுக்கொள்ளக்கூடிய குறியாக்கம் செய்யப்பட்ட QR குறியீடுகளுடன் வெளிவரும்.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7f6] dark:bg-[#0c0a09] transition-colors duration-300 pb-20">
      
      {/* Formal Header Block */}
      <section className="relative overflow-hidden pt-20 pb-12 bg-white dark:bg-[#151c2c] border-b-4 border-[#1a2b56]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#1a2b56] to-[#2a4382] mb-6 shadow-md border-l-4 border-[#FFAE00]">
            <span className="w-2 h-2 rounded-full bg-[#FFAE00]"></span>
            <span className="text-xs font-bold text-white uppercase tracking-widest">{language === 'en' ? 'TN Digital Gateway' : 'தமிழ்நாடு டிஜிட்டல் சேவை'}</span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl text-[#1a2b56] dark:text-blue-200 tracking-tight leading-tight mb-4 max-w-4xl mx-auto uppercase">
            {language === 'en' ? 'A2Z Online Service' : 'ஏ2இசட் ஆன்லைன் சேவை'}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-semibold text-base md:text-lg max-w-3xl mx-auto leading-relaxed border-t-2 border-slate-200 dark:border-slate-700 pt-4 mt-2 inline-block">
            {language === 'en' 
              ? 'Providing seamless digital governance, civic services, and certifications for the citizens of Tamil Nadu.'
              : 'தமிழ்நாடு குடிமக்களுக்கு தடையற்ற டிஜிட்டல் ஆளுமை, குடிமைச் சேவைகள் மற்றும் சான்றிதழ்களை வழங்குதல்.'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">

          {/* ITEM: Search & Filter (Spans 2 cols on Desktop) */}
          <div className="md:col-span-2 lg:col-span-2 bg-white dark:bg-[#1a2b56] border border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div className="bg-[#1a2b56] text-white p-4 border-b-4 border-[#FFAE00]">
              <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center mb-4">
                <Search className="w-5 h-5 text-[#FFAE00]" />
              </div>
              <h3 className="font-display font-black text-xl mb-1 uppercase tracking-wider">{t('searchPlaceholder')}</h3>
              <p className="text-blue-100 text-xs font-semibold">Search the official catalog of state-authorized civic certificates.</p>
            </div>
            
            <div className="p-6 relative">
              <input
                type="text"
                className="w-full pl-4 pr-12 py-3 bg-white border ring-1 ring-slate-300 focus:ring-2 focus:ring-[#1a2b56] text-sm text-slate-800 placeholder-slate-400 font-medium transition-shadow rounded-sm"
                placeholder="E.g., Income Certificate, PAN Card..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[#1a2b56]">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* ITEM: Status Tracker */}
          <div className="md:col-span-1 lg:col-span-2 bg-white dark:bg-[#1c1917] border border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            
            <div className="bg-[#21804b] text-white p-4 border-b-4 border-[#FFAE00]">
              <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-xl mb-1 uppercase tracking-wider">{language === 'en' ? 'Track Application' : 'விண்ணப்ப நிலை'}</h3>
              <p className="text-green-100 text-xs font-semibold">Enter your reference token to instantly verify audit progress and status.</p>
            </div>

            <form onSubmit={handleTrackStatus} className="p-6 space-y-4">
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border ring-1 ring-slate-300 focus:ring-2 focus:ring-[#21804b] rounded-sm text-sm placeholder-slate-400 font-mono text-slate-800 transition-shadow uppercase"
                placeholder="SEAGAN-2026-..."
                value={trackToken}
                onChange={(e) => setTrackToken(e.target.value)}
              />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-[#21804b] border border-[#165a34] text-white rounded-sm text-sm font-bold shadow hover:bg-[#1a663c] transition-colors uppercase tracking-widest"
              >
                {language === 'en' ? 'Track Status' : 'நிலையை அறிய'}
              </button>
              {trackError && <p className="text-red-700 text-xs font-bold bg-red-100 border border-red-300 p-2 rounded-sm mt-2">{trackError}</p>}
              
              {/* Inline Progress Bar if tracked */}
              {trackedApplication && trackedApplication.status !== 'Rejected' && (
                <div className="mt-4 bg-[#f8fafc] border border-slate-300 p-4 rounded-sm">
                  <div className="flex justify-between text-xs font-bold mb-2 text-slate-800">
                    <span>{trackedApplication.serviceName}</span>
                    <span className="bg-[#1a2b56] text-white px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">{trackedApplication.status}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFAE00]" style={{ width: `${Math.max(10, ((getStageIndex(trackedApplication.status) + 1) / STAGES.length) * 100)}%` }}></div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* ITEM: Categories List (Spans full width) */}
          <div className="md:col-span-3 lg:col-span-4 bg-white dark:bg-[#1a2b56] border border-slate-300 dark:border-slate-700 shadow-sm p-6 lg:p-8">
            <h3 className="font-display font-black text-xl text-[#1a2b56] dark:text-white mb-6 flex items-center gap-3 uppercase tracking-wider border-b-2 border-slate-100 dark:border-slate-700 pb-4">
              <FileText className="w-6 h-6 text-[#FFAE00]" />
              {language === 'en' ? 'Available Services' : 'அனைத்து டிஜிட்டல் சேவைகள்'}
            </h3>

            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-sm text-xs font-bold tracking-wider transition-all border ${
                    selectedCategory === cat
                      ? 'bg-[#1a2b56] text-white border-[#1a2b56] dark:bg-white dark:text-[#1a2b56] shadow-md'
                      : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat === 'All' ? (language === 'en' ? 'All Departments' : 'அனைத்து துறைகள்') : cat}
                </button>
              ))}
            </div>

            {filteredServices.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-medium">No services found for your search.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map(svc => (
                  <div key={svc.id} className="p-6 rounded-sm bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-[#1a2b56] dark:hover:border-blue-400 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[9px] font-bold text-[#1a2b56] dark:text-blue-300 uppercase tracking-widest">
                          {svc.category}
                        </span>
                        <span className="font-mono text-sm font-bold text-[#21804b] dark:text-emerald-400">₹{svc.price}</span>
                      </div>
                      <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 leading-tight">
                        {svc.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        {svc.description}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleApplyClick(svc.id)}
                      className="w-full py-2.5 bg-white dark:bg-slate-800 border-2 border-[#1a2b56] dark:border-blue-400 text-[#1a2b56] dark:text-blue-400 font-bold text-xs rounded-sm hover:bg-[#1a2b56] hover:text-white dark:hover:bg-blue-400 dark:hover:text-[#151c2c] transition-colors flex items-center justify-center space-x-2 uppercase tracking-wide"
                    >
                      <span>{t('applyBtn')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ITEM: Metrics */}
          <div className="md:col-span-3 lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: language === 'en' ? 'Families Served' : 'பயன்பெற்ற குடிமக்கள்', value: '48,290+', icon: Users, color: 'text-blue-200' },
              { label: language === 'en' ? 'Audit Success' : 'வெற்றி வீதம்', value: '99.8%', icon: BadgeCheck, color: 'text-[#FFAE00]' },
              { label: language === 'en' ? 'Processing Speed' : 'சராசரி நேரம்', value: '2-7 Days', icon: Clock, color: 'text-blue-300' },
              { label: language === 'en' ? 'Secure Validation' : 'பாதுகாப்பான அப்லோடு', value: '256-bit', icon: ShieldCheck, color: 'text-emerald-400' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-[#1a2b56] border-t-4 border-[#FFAE00] rounded-sm p-6 text-center shadow-lg">
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color} opacity-90`} />
                <span className={`font-display font-black text-2xl md:text-3xl block mb-1 text-white`}>
                  {stat.value}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
