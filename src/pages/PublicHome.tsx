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
  BadgeCheck
} from 'lucide-react';
import { applicationService } from '../supabase/supabaseClient';

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
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }, 4000);
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
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-[#091114] transition-colors duration-300">
      
      {/* 1. HERO BANNER - Premium Modern Layout */}
      <section className="relative overflow-hidden bg-zinc-50 border-b border-slate-200 dark:bg-[#091114] text-slate-800 dark:text-white pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Layered Gradient Backgrounds for a premium feel */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-teal-100/40 dark:bg-teal-900/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 dark:bg-purple-900/10 blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            
            {/* Visual Intro Headline */}
            <div className="lg:w-1/2 flex flex-col space-y-6 text-left relative z-10 w-full xl:pr-10">
              <div className="flex justify-start mb-2 animate-fade-in">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-white dark:bg-white/5 backdrop-blur-3xl p-1.5 md:p-2.5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/10">
                  <img src="/logo1.png" alt="SEAGAN ENTERPRISES Logo" className="w-full h-full object-contain rounded-2xl drop-shadow-sm" />
                </div>
              </div>
              
              <div id="tn-emblem-badge" className="inline-flex max-w-max items-center space-x-2 px-4 py-2 rounded-full bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 text-xs text-teal-700 dark:text-teal-200 font-semibold tracking-wide backdrop-blur-xl shadow-sm">
                <span className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.3)] animate-pulse"></span>
                <span>{language === 'en' ? 'Tamil Nadu e-Sevai Gateway' : 'தமிழ்நாடு இ-சேவை நுழைவாயில்'}</span>
              </div>
              
              <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-slate-950 dark:text-white tracking-tight leading-[1.1]">
                {language === 'en' ? 'Digital Services' : 'அனைத்து அரசு சேவைகளும்'}{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-600 to-purple-600 dark:from-teal-400 dark:via-emerald-400 dark:to-purple-400">
                  {language === 'en' ? 'Simplified' : 'எளிய முறையில்'}
                </span>
              </h1>

              <p className="text-slate-600/90 dark:text-slate-300 font-medium text-base sm:text-lg leading-relaxed max-w-lg mb-2">
                {language === 'en' 
                  ? 'Access Revenue Certificates, Aadhaar revisions, PAN registrations, and social schemes instantly. Realtime tracking backed by TNeGA.'
                  : 'வருமானச் சான்றிதழ், சாதிச் சான்றிதழ், பான் கார்டு, ரேஷன் கார்டு, முதியோர் ஓய்வூதியத் திட்டம் போன்ற அரசு சேவைகளைப் பெற ஆன்லைனில் விண்ணப்பிக்கவும்.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    document.getElementById('services-grid-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-[#0b1418] dark:bg-white text-white dark:text-slate-950 rounded-2xl text-sm font-bold shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-all cursor-pointer flex items-center justify-center space-x-2 w-full sm:w-auto hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{language === 'en' ? 'Explore Services' : 'சேவைகளை ஆராய்க'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <button 
                  onClick={() => setView('auth')}
                  className="px-8 py-4 bg-white dark:bg-[#0b1418] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer w-full sm:w-auto flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0"
                >
                  {language === 'en' ? 'Register Account' : 'கணக்கை உருவாக்கு'}
                </button>
              </div>
            </div>

            {/* Application Token Status Tracker Card on Home! */}
            <div className="lg:w-1/2 w-full mt-8 lg:mt-0 relative z-20">
              <div className="relative">
                {/* Decorative Elements around card */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
                
                <div className="p-8 md:p-10 rounded-3xl bg-white/70 dark:bg-[#0b1418]/80 border border-slate-200/50 dark:border-slate-800/80 shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] backdrop-blur-3xl w-full">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                      <BadgeCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h3 className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tight">
                      {language === 'en' ? 'Track Application' : 'விண்ணப்ப நிலை'}
                    </h3>
                  </div>
                  
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">
                    {language === 'en' 
                      ? 'Enter your file reference token to verify audits and securely download your approved certificates.' 
                      : 'உங்கள் டோக்கன் எண்ணை உள்ளிட்டு சான்றிதழ்களைப் பதிவிறக்கவும்.'}
                  </p>

                  <form onSubmit={handleTrackStatus} className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                      </div>
                      <input
                        id="home-tracker-input"
                        type="text"
                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-[#091114]/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white font-mono font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all uppercase shadow-inner"
                        placeholder="SEAGAN-2026-000001"
                        value={trackToken}
                        onChange={(e) => setTrackToken(e.target.value)}
                      />
                    </div>

                    <button
                      id="home-tracker-submit-btn"
                      type="submit"
                      className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 transition-all active:scale-[0.98] uppercase tracking-wide cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <span>{language === 'en' ? 'Audit File Progress' : 'நிலையைச் சரிபார்'}</span>
                    </button>
                  </form>

                  {trackError && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl flex items-start space-x-2">
                       <span className="text-red-500 dark:text-red-400 text-sm mt-0.5">⚠️</span>
                       <p className="text-red-600 dark:text-red-400 text-xs font-medium text-left leading-relaxed">
                         {trackError}
                       </p>
                    </div>
                  )}

                  {/* Animated progress results */}
                  {trackedApplication && (
                    <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-6 text-left animate-fade-in">
                      <div className="flex justify-between items-center mb-4 bg-zinc-50 dark:bg-[#0b1418]/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm mb-1">
                            {trackedApplication.serviceName}
                          </h4>
                          <span className="inline-block px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] text-slate-600 dark:text-slate-300 font-mono font-semibold">
                            {trackedApplication.tokenNumber}
                          </span>
                        </div>
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                          trackedApplication.status === 'Completed' || trackedApplication.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20'
                            : trackedApplication.status === 'Rejected'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20'
                        }`}>
                          {trackedApplication.status}
                        </span>
                      </div>

                      {/* Progress Segment bar */}
                      {trackedApplication.status !== 'Rejected' ? (
                        <div className="space-y-3 px-1">
                          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                            <span>Submitted</span>
                            <span>In Review</span>
                            <span>Completed</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${Math.max(10, ((getStageIndex(trackedApplication.status) + 1) / STAGES.length) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-100 dark:border-red-900/50 flex space-x-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                             <span className="text-red-600 dark:text-red-400 font-bold">!</span>
                          </div>
                          <div>
                            <span className="font-bold text-red-700 dark:text-red-400 text-sm block mb-1">Rejection Reason:</span>
                            <p className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-relaxed">
                              {trackedApplication.rejectionReason || 'Submitted documents contain formatting issues.'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SERVICES SEARCH & DYNAMIC GRID SECTIONS */}
      <section id="services-grid-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <h2 className="font-display font-black text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight">
            {language === 'en' ? 'Our Service Catalogue' : 'அனைத்து டிஜிட்டல் சேவைகள்'}
          </h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {language === 'en' 
              ? 'Select from our wide array of digital services, input your secure details, and generate certifications out of the box.'
              : 'கீழே உள்ள சேவைகளில் தேவையானதைத் தேர்ந்தெடுத்து, எளிய முறையில் உங்களது ஆவணங்களை பதிவேற்றி பலன் பெறுங்கள்.'}
          </p>
        </div>

        {/* Global Search Interface and Category filters */}
        <div className="bg-white/80 dark:bg-[#0b1418]/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-6 mb-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] space-y-6 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
            
            {/* Search Input */}
            <div className="md:col-span-8 relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              </div>
              <input
                id="search-services-input"
                type="text"
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-[#0b1418]/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:text-white transition-all font-medium shadow-inner"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Slogan details box */}
            <div className="md:col-span-4 flex items-center justify-end text-sm text-slate-500 font-mono font-medium bg-zinc-50 dark:bg-[#0b1418]/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 mr-2" />
              <span>{language === 'en' ? 'Avg Processing: 2-7 Days' : 'சராசரி நேரம்: 2-7 நாட்கள்'}</span>
            </div>

          </div>

          {/* Department Pills filters */}
          <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20 ring-2 ring-teal-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat === 'All' ? (language === 'en' ? 'All Departments' : 'அனைத்து துறைகள்') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Highlighted Services Cards */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-24 bg-white/50 dark:bg-[#0b1418]/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-sm">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No services match your specifications.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map(svc => (
              <div 
                key={svc.id}
                className="flex flex-col justify-between p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0b1418]/80 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:border-teal-400/50 dark:hover:border-teal-500/50 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <span className="px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-extrabold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/20">
                      {svc.category}
                    </span>
                    <span className="font-mono text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      ₹{svc.price}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {svc.name}
                  </h3>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed line-clamp-3 mb-4">
                    {svc.description}
                  </p>

                  {/* Required Document counts lists */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                       {language === 'en' ? 'Required Documents' : 'தேவையான ஆவணங்கள்'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {svc.requiredDocuments.map((doc, idx) => (
                        <span key={idx} className="inline-flex items-center text-[10px] font-semibold bg-zinc-50 dark:bg-[#0b1418] text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center bg-zinc-50 dark:bg-[#0b1418]/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{svc.processingDays} {language === 'en' ? 'Days' : 'நாட்கள்'}</span>
                  </span>

                  <button
                    onClick={() => handleApplyClick(svc.id)}
                    className="inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-white bg-[#0b1418] dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-500 px-4 py-2 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer w-full sm:w-auto mt-2 sm:mt-0"
                  >
                    <span>{t('applyBtn')}</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. PORTAL CORE METRICS & DIGITAL IMPACT */}
      <section className="bg-zinc-50 dark:bg-[#0b1418] border-y border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-2">
              {t('statsTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Real-time operational achievements of SEAGAN ENTERPRISES E-Sevai Portal
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="font-display font-extrabold text-3xl md:text-4xl text-teal-600 dark:text-amber-400 block mb-1">
                48,290+
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                {language === 'en' ? 'Citizen Families Served' : 'பயன்பெற்ற குடிமக்கள்'}
              </span>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="font-display font-extrabold text-3xl md:text-4xl text-amber-500 dark:text-amber-400 block mb-1">
                99.8%
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
                {language === 'en' ? 'Audit Validation Rate' : 'சரிபார்ப்பு வெற்றி வீதம்'}
              </span>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="font-display font-extrabold text-3xl md:text-4xl text-emerald-600 dark:text-emerald-400 block mb-1">
                3 Mins
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
                {language === 'en' ? 'Avg Digital Form Setup' : 'பதிவிறக்கம் சராசரி நேரம்'}
              </span>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="font-display font-extrabold text-3xl md:text-4xl text-emerald-600 dark:text-emerald-400 block mb-1">
                24/7
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
                {language === 'en' ? 'File Check Access' : '24/7 விண்கண் கண்காணிப்பு'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="py-16 bg-white dark:bg-[#0b1418] border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
              {t('whyUs')}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Enterprise security features engineered for seamless digital administrative workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-zinc-50 dark:bg-[#091114]/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-2">
                {language === 'en' ? 'Biometrics & KYC Security' : 'பாதுகாப்பான ஆவணம் அப்லோடு'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                SSL configurations protect citizens data assets. Multi-factor verification locks unauthorized viewing.
              </p>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-[#091114]/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4 shadow-inner">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-2">
                {language === 'en' ? 'Direct PDF & QR Verification' : 'கிரிப்டோ கையொப்பமிட்ட ஆவணங்கள்'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Download verified governmental PDFs complete with high resolution crypto QR validation codes accepted natively.
              </p>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-[#091114]/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-inner">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-2">
                {language === 'en' ? 'Automated Speed Reminders' : 'விரைவான செயலாக்க வேகம்'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Status tracker sends instant notification alerts on file stages, ensuring smooth and transparent e-governance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            {language === 'en' ? 'What Citizens Say' : 'மக்களின் சான்றுகள்'}
          </h3>
          <p className="text-xs text-slate-500 mt-2">
            Verifiable reviews from residents across Tamil Nadu benefitting from SEAGAN ENTERPRISES.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0b1418] border border-slate-200/60 dark:border-slate-800 text-left">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
              "The dynamic form feature is incredible. Applied for my Income proof, downloaded files within 4 days. The SMS notification update kept me completely relaxed."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs uppercase">
                R
              </div>
              <div>
                <span className="font-bold text-xs text-slate-800 dark:text-white block">Ramesh Kumar</span>
                <span className="text-[10px] text-slate-400">Coimbatore, Resident</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0b1418] border border-slate-200/60 dark:border-slate-800 text-left">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
              "First graduate certificate issued under 7 days! Helped me complete university registration concession quickly. Verified QR seal is genuinely accepted everywhere."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                P
              </div>
              <div>
                <span className="font-bold text-xs text-slate-800 dark:text-white block">Priya Soundar</span>
                <span className="text-[10px] text-slate-400">Trichy, Student</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0b1418] border border-slate-200/60 dark:border-slate-800 text-left">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
              "My grandfather's pension approval was very transparent here. Admin checked original Aadhaar upload, validated verification within weeks. Immensely thankful."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs uppercase">
                V
              </div>
              <div>
                <span className="font-bold text-xs text-slate-800 dark:text-white block">Vijay Anand</span>
                <span className="text-[10px] text-slate-400">Madurai, Citizen</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTIONS (Accordion) */}
      <section className="py-16 bg-slate-100 dark:bg-[#0b1418]/40 border-t border-slate-200/40 dark:border-slate-800 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
              {t('faq')}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Got queries? Read our simple procedural help manual below.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-[#0b1418] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-display font-bold text-xs md:text-sm text-slate-800 dark:text-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800/50 flex justify-between items-center transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <span className="font-mono text-xs text-slate-400">{activeFaq === idx ? '−' : '+'}</span>
                </button>
                
                {activeFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CONTACT FEEDBACK FORM */}
      <section id="contact-section-id" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white dark:bg-[#0b1418] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-sm">
          
          {/* Quick coordinates */}
          <div className="lg:col-span-5 text-left space-y-6">
            <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
              {t('getInTouch')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Have questions regarding document approvals, verification audits, or setting up premium e-Sevai franchises? Drop us a secure message.
            </p>

            <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center space-x-3.5">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>3/21, Anna Salai Road, Chennai, TN - 600002</span>
              </div>
              <div className="flex items-center space-x-3.5">
                <Phone className="w-4 h-4 text-teal-600" />
                <span>+91 94440 88888 (Toll Free)</span>
              </div>
              <div className="flex items-center space-x-3.5">
                <Mail className="w-4 h-4 text-teal-600" />
                <span>office@segan.in / support@segan.in</span>
              </div>
            </div>
          </div>

          {/* Contact interactive Form */}
          <div className="lg:col-span-7">
            {contactSuccess ? (
              <div className="h-full flex flex-col items-center justify-center py-10 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-2xl border border-emerald-100/55 dark:border-emerald-900/30 text-center space-y-2 p-6 animate-scale-up">
                <HelpCircle className="w-8 h-8 text-emerald-500" />
                <span className="font-bold text-sm">Message Transmitted Cleanly!</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Our administrative support center will email/call you within 12 working hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 block mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-[#091114] border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-medium"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-[#091114] border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-medium"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 block mb-1">
                    Message Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-[#091114] border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-medium"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 block mb-1">
                    Your Narrative
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-[#091114] border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-medium focus:outline-none"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button
                  id="contact-submit-btn"
                  type="submit"
                  className="inline-flex items-center space-x-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                >
                  <span>Transmit Query</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};
