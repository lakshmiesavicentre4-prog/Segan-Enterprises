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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0c0a09] transition-colors duration-300 pb-20">
      
      {/* Dynamic Header Block */}
      <section className="relative overflow-hidden pt-28 pb-10">
        <Hero3D />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-sm bg-white dark:bg-[#1c1917] border-2 border-slate-200 dark:border-slate-800 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">{language === 'en' ? 'TN e-Sevai Gateway' : 'தமிழ்நாடு இ-சேவை'}</span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl text-slate-900 dark:text-white tracking-tighter leading-tight mb-6 max-w-4xl mx-auto">
            {language === 'en' ? 'Civic Services,' : 'அனைத்து அரசு சேவைகளும்,'} <br />
            <span className="text-blue-600 dark:text-blue-400">{language === 'en' ? 'Reimagined.' : 'எளிய முறையில்.'}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            {language === 'en' 
              ? 'Revenue Certificates, Aadhaar revisions, PAN registrations, and social schemes processed with unprecedented velocity.'
              : 'வருமானச் சான்றிதழ், சாதிச் சான்றிதழ், முதியோர் ஓய்வூதியத் திட்டம் போன்ற அரசு சேவைகளைப் பெற ஆன்லைனில் விண்ணப்பிக்கவும்.'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {/* BENTO ITEM: Search & Filter (Spans 2 cols on Desktop) */}
          <div className="md:col-span-2 lg:col-span-2 bg-white dark:bg-[#1c1917]  border-2 border-slate-200 dark:border-slate-800 rounded-sm p-6 lg:p-8 shadow-md dark:shadow-md flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-sm flex items-center justify-center mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white mb-2">{t('searchPlaceholder')}</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">Search from our comprehensive catalog of state-authorized civic certificates.</p>
            </div>
            
            <div className="relative">
              <input
                type="text"
                className="w-full pl-5 pr-12 py-4 bg-slate-50 dark:bg-[#0c0a09] border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 dark:ring-slate-800 rounded-sm text-sm placeholder-slate-400 font-medium transition-shadow dark:text-white"
                placeholder="E.g., Income Certificate, PAN Card..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-sm shadow-md">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* BENTO ITEM: Status Tracker */}
          <div className="md:col-span-1 lg:col-span-2 bg-blue-600 text-white rounded-sm p-6 lg:p-8 shadow-sm  relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div>
              <div className="w-12 h-12 bg-white/20 text-white rounded-sm flex items-center justify-center mb-6 backdrop-blur-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-2xl mb-2">{language === 'en' ? 'Track Application' : 'விண்ணப்ப நிலை'}</h3>
              <p className="text-blue-100 text-sm font-medium mb-6">Enter your reference token to instantly verify audit progress and download approved files.</p>
            </div>

            <form onSubmit={handleTrackStatus} className="space-y-4 relative z-10">
              <input
                type="text"
                className="w-full px-5 py-4 bg-white/10 border-0 ring-1 ring-white/20 focus:ring-2 focus:ring-white rounded-sm text-sm placeholder-blue-200 font-mono text-white transition-shadow uppercase"
                placeholder="SEAGAN-2026-..."
                value={trackToken}
                onChange={(e) => setTrackToken(e.target.value)}
              />
              {trackError && <p className="text-red-200 text-xs font-bold bg-red-900/40 p-2 rounded-lg">{trackError}</p>}
              
              {/* Inline Progress Bar if tracked */}
              {trackedApplication && trackedApplication.status !== 'Rejected' && (
                <div className="mt-4 bg-white/10 p-4 rounded-sm">
                  <div className="flex justify-between text-xs font-bold mb-2 text-white">
                    <span>{trackedApplication.serviceName}</span>
                    <span className="bg-white text-blue-900 px-2 py-0.5 rounded-md uppercase tracking-wider text-[10px]">{trackedApplication.status}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${Math.max(10, ((getStageIndex(trackedApplication.status) + 1) / STAGES.length) * 100)}%` }}></div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* BENTO ITEM: Categories List (Spans full width) */}
          <div className="md:col-span-3 lg:col-span-4 bg-white dark:bg-[#1c1917]  border-2 border-slate-200 dark:border-slate-800 rounded-sm p-6 lg:p-8 shadow-md dark:shadow-md">
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <FileText className="w-5 h-5 text-amber-500" />
              {language === 'en' ? 'Available Services' : 'அனைத்து டிஜிட்டல் சேவைகள்'}
            </h3>

            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-sm text-xs font-bold tracking-wider transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat === 'All' ? (language === 'en' ? 'All Departments' : 'அனைத்து துறைகள்') : cat}
                </button>
              ))}
            </div>

            {filteredServices.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No services found for your search.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map(svc => (
                  <div key={svc.id} className="p-5 rounded-sm bg-slate-50 dark:bg-[#0c0a09] border-2 border-slate-200 dark:border-slate-800 group hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                          {svc.category}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">₹{svc.price}</span>
                      </div>
                      <h4 className="font-display font-bold text-base text-slate-900 dark:text-white mb-2 leading-tight">
                        {svc.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {svc.description}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleApplyClick(svc.id)}
                      className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-900 dark:text-white font-bold text-xs rounded-sm transition-all flex items-center justify-center space-x-2"
                    >
                      <span>{t('applyBtn')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BENTO ITEM: Metrics */}
          <div className="md:col-span-3 lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: language === 'en' ? 'Families Served' : 'பயன்பெற்ற குடிமக்கள்', value: '48,290+', icon: Users, color: 'text-blue-600' },
              { label: language === 'en' ? 'Audit Success' : 'வெற்றி வீதம்', value: '99.8%', icon: BadgeCheck, color: 'text-amber-500' },
              { label: language === 'en' ? 'Processing Speed' : 'சராசரி நேரம்', value: '2-7 Days', icon: Clock, color: 'text-purple-500' },
              { label: language === 'en' ? 'Secure Validation' : 'பாதுகாப்பான அப்லோடு', value: '256-bit', icon: ShieldCheck, color: 'text-emerald-500' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-[#1c1917]  border-2 border-slate-200 dark:border-slate-800 rounded-sm p-6 text-center shadow-sm">
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color} opacity-80`} />
                <span className={`font-display font-black text-2xl md:text-3xl block mb-1 text-slate-900 dark:text-white`}>
                  {stat.value}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
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
