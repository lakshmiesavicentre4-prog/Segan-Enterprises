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
        setTrackError('Token number not found. Verify format: SEGAN-2026-000001');
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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* 1. HERO BANNER - Premium Government Portal Style */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-700 via-blue-800 to-slate-905 dark:from-slate-950 dark:via-blue-950/80 dark:to-slate-950 text-white py-16 md:py-24">
        {/* Vector patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/30 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Intro Headline */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div id="tn-emblem-badge" className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-900/60 dark:bg-blue-950 border border-blue-600/40 text-xs text-blue-200 font-semibold tracking-wide backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{language === 'en' ? 'Tamil Nadu e-Sevai Service Gateway' : 'தமிழ்நாடு இ-சேவை சேவை நுழைவாயில்'}</span>
              </div>
              
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
                {language === 'en' ? 'Digital Services' : 'அனைத்து அரசு சேவைகளும்'}{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-300">
                  {language === 'en' ? 'Simplified' : 'ஒரே இடத்தில் எளிய முறையில்'}
                </span>
                <br />
                {language === 'en' ? 'For Every Citizen.' : 'குடிமக்களுக்கான டிஜிட்டல் மேடை.'}
              </h1>

              <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-xl">
                {language === 'en' 
                  ? 'Apply for Revenue Certificates, Aadhaar address revisions, PAN registrations, social pension schemes, and graduation benefits directly. Realtime status checks and authorized signed prints.'
                  : 'வருமானச் சான்றிதழ், சாதிச் சான்றிதழ், பான் கார்டு, ரேஷன் கார்டு, முதியோர் ஓய்வூதியத் திட்டம் போன்ற அரசு சேவைகளைப் பெற எளிய முறையில் ஆன்லைனில் விண்ணப்பித்து பதிவிறக்கிக் கொள்ளுங்கள்.'}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={() => {
                    document.getElementById('services-grid-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:glow hover:shadow-emerald-900/30 flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                >
                  <span>{language === 'en' ? 'Explore Services' : 'சேவைகளை ஆராய்க'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setView('auth')}
                  className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all cursor-pointer"
                >
                  {language === 'en' ? 'Register Account' : 'கணக்கை உருவாக்கு'}
                </button>
              </div>
            </div>

            {/* Application Token Status Tracker Card on Home! */}
            <div className="lg:col-span-5">
              <div className="p-6 md:p-8 rounded-3xl bg-white/10 dark:bg-slate-900/80 border border-white/10 dark:border-slate-800 shadow-2xl backdrop-blur-xl shrink-0">
                <h3 className="font-display font-bold text-lg text-white mb-2 tracking-wide flex items-center space-x-2">
                  <BadgeCheck className="w-5 h-5 text-amber-400" />
                  <span>{language === 'en' ? 'Instant Status Tracker' : 'விண்ணப்ப நிலை கண்டறிதல்'}</span>
                </h3>
                <p className="text-xs text-slate-300 mb-6 font-medium">
                  {language === 'en' 
                    ? 'Enter file reference code to check document approvals, verification audits, and print certifications.' 
                    : 'விண்ணப்ப நிலையை அறிய, உங்கள் டோக்கன் எண்ணை உள்ளிடவும்.'}
                </p>

                <form onSubmit={handleTrackStatus} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      id="home-tracker-input"
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white/20 dark:bg-slate-950/60 border border-white/20 dark:border-slate-800 rounded-xl text-xs placeholder-slate-300 text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
                      placeholder="SEGAN-2026-000001"
                      value={trackToken}
                      onChange={(e) => setTrackToken(e.target.value)}
                    />
                  </div>

                  <button
                    id="home-tracker-submit-btn"
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all uppercase cursor-pointer"
                  >
                    {language === 'en' ? 'Audit File Progress' : 'நிலையைச் சரிபார்'}
                  </button>
                </form>

                {trackError && (
                  <p className="text-red-400 text-xs font-semibold mt-3 text-left">
                    ⚠️ {trackError}
                  </p>
                )}

                {/* Animated progress results */}
                {trackedApplication && (
                  <div className="mt-6 border-t border-white/10 pt-5 text-left text-xs animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-display font-bold text-white text-sm">
                          {trackedApplication.serviceName}
                        </h4>
                        <span className="text-[10px] text-slate-300 font-mono">
                          {trackedApplication.tokenNumber}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        trackedApplication.status === 'Completed' || trackedApplication.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : trackedApplication.status === 'Rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {trackedApplication.status}
                      </span>
                    </div>

                    {/* Progress Segment bar */}
                    {trackedApplication.status !== 'Rejected' ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                          <span>Submitted</span>
                          <span>In Review</span>
                          <span>Completed</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-700"
                            style={{ 
                              width: `${Math.max(10, ((getStageIndex(trackedApplication.status) + 1) / STAGES.length) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-red-950/40 rounded-xl border border-red-900/30">
                        <span className="font-semibold text-red-400 block mb-1">Rejection Reason:</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {trackedApplication.rejectionReason || 'Submitted documents contain formatting issues.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SERVICES SEARCH & DYNAMIC GRID SECTIONS */}
      <section id="services-grid-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight">
            {language === 'en' ? 'Our Service Catalogue' : 'அனைத்து டிஜிட்டல் சேவைகள்'}
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {language === 'en' 
              ? 'Select from our wide array of digital services, input your secure details, and generate certifications out of the box.'
              : 'கீழே உள்ள சேவைகளில் தேவையானதைத் தேர்ந்தெடுத்து, எளிய முறையில் உங்களது ஆவணங்களை பதிவேற்றி பலன் பெறுங்கள்.'}
          </p>
        </div>

        {/* Global Search Interface and Category filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 mb-10 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="search-services-input"
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all font-medium"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Slogan details box */}
            <div className="md:col-span-4 flex items-center justify-end text-xs text-slate-500 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
              <span>{language === 'en' ? 'Avg Processing: 2-7 Days' : 'சராசரி நேரம்: 2-7 நாட்கள்'}</span>
            </div>

          </div>

          {/* Department Pills filters */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
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
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <p className="text-sm font-medium text-slate-400">No services match your specifications.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(svc => (
              <div 
                key={svc.id}
                className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      {svc.category}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400">
                      ₹{svc.price}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-2 leading-snug">
                    {svc.name}
                  </h3>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                    {svc.description}
                  </p>

                  {/* Required Document counts lists */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5Packed">
                      {language === 'en' ? 'REQUIRED DOCUMENTS:' : 'தேவையான ஆவணங்கள்:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {svc.requiredDocuments.map((doc, idx) => (
                        <span key={idx} className="inline-flex items-center text-[9px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-750">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 flex items-center justify-between gap-2 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                    <span>{svc.processingDays} {language === 'en' ? 'Days' : 'நாட்கள்'}</span>
                  </span>

                  <button
                    onClick={() => handleApplyClick(svc.id)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-transparent py-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                  >
                    <span>{t('applyBtn')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. PORTAL CORE METRICS & DIGITAL IMPACT */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="font-display font-extrabold text-2xl text-white mb-2">
              {t('statsTitle')}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Real-time operational achievements of SEGAN ENTERPRISES E-Sevai Portal
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-800">
              <span className="font-display font-extrabold text-3xl md:text-4xl text-amber-400 block mb-1">
                48,290+
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                {language === 'en' ? 'Citizen Families Served' : 'பயன்பெற்ற குடிமக்கள்'}
              </span>
            </div>
            <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-800">
              <span className="font-display font-extrabold text-3xl md:text-4xl text-amber-400 block mb-1">
                99.8%
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                {language === 'en' ? 'Audit Validation Rate' : 'சரிபார்ப்பு வெற்றி வீதம்'}
              </span>
            </div>
            <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-800">
              <span className="font-display font-extrabold text-3xl md:text-4xl text-emerald-400 block mb-1">
                3 Mins
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                {language === 'en' ? 'Avg Digital Form Setup' : 'பதிவிறக்கம் சராசரி நேரம்'}
              </span>
            </div>
            <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-800">
              <span className="font-display font-extrabold text-3xl md:text-4xl text-emerald-400 block mb-1">
                24/7
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                {language === 'en' ? 'File Check Access' : '24/7 விண்கண் கண்காணிப்பு'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
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
            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-850 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-2">
                {language === 'en' ? 'Biometrics & KYC Security' : 'பாதுகாப்பான ஆவணம் அப்லோடு'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                SSL configurations protect citizens data assets. Multi-factor verification locks unauthorized viewing.
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-850 text-left">
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

            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-850 text-left">
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
            Verifiable reviews from residents across Tamil Nadu benefitting from SEGAN ENTERPRISES.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-850 text-left">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
              "The dynamic form feature is incredible. Applied for my Income proof, downloaded files within 4 days. The SMS notification update kept me completely relaxed."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs uppercase">
                R
              </div>
              <div>
                <span className="font-bold text-xs text-slate-800 dark:text-white block">Ramesh Kumar</span>
                <span className="text-[10px] text-slate-400">Coimbatore, Resident</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-850 text-left">
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

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-850 text-left">
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
      <section className="py-16 bg-slate-100 dark:bg-slate-900/40 border-t border-slate-250/40 dark:border-slate-850 transition-colors">
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
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-display font-bold text-xs md:text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex justify-between items-center transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-sm">
          
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
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>3/21, Anna Salai Road, Chennai, TN - 600002</span>
              </div>
              <div className="flex items-center space-x-3.5">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>+91 94440 88888 (Toll Free)</span>
              </div>
              <div className="flex items-center space-x-3.5">
                <Mail className="w-4 h-4 text-blue-600" />
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
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-medium"
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
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-medium"
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
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-medium"
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
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-medium focus:outline-none"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button
                  id="contact-submit-btn"
                  type="submit"
                  className="inline-flex items-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all"
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
