/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XSquare, 
  HelpCircle, 
  Upload, 
  Trash2, 
  Sparkles, 
  Tag, 
  Download, 
  ArrowLeft,
  DollarSign, 
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle,
  Printer,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { applicationService, serviceService, queryService } from '../supabase/supabaseClient';
import { QRCodeGenerator } from '../components/QRCodeGenerator';

export const UserDashboard: React.FC = () => {
  const { 
    t, 
    currentUser, 
    services, 
    refreshServices,
    applications, 
    refreshApplications,
    language,
    updateUserProfile
  } = useApp();

  // Active dashboard view state inside user panel
  const [activeTab, setActiveTab] = useState<'overview' | 'apply' | 'history' | 'queries' | 'profile'>('overview');
  
  // Selected application details state for visual receipt view modal
  const [selectedReceiptApp, setSelectedReceiptApp] = useState<any>(null);

  // Dynamic application form wizard flow states
  const [selectedService, setSelectedService] = useState<any>(null);
  const [applyStep, setApplyStep] = useState<1 | 2 | 3>(1); // 1:Form details, 2:Uploads, 3:Success Screen
  const [formData, setFormData] = useState({ citizenAadhaar: '', categoryDetails: '', extraRemarks: '' });
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({}); // docTitle: base64Data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyCreatedApp, setNewlyCreatedApp] = useState<any>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    aadhaarNumber: currentUser?.aadhaarNumber || '',
    panNumber: currentUser?.panNumber || '',
    address: currentUser?.address || '',
    district: currentUser?.district || '',
    pincode: currentUser?.pincode || '',
  });

  const [queryForm, setQueryForm] = useState({ subject: '', message: '' });
  const [queries, setQueries] = useState<any[]>(() => (queryService.getQueries() || []).filter((q: any) => q.userId === currentUser?.id));
  const refreshQueries = () => {
    setQueries((queryService.getQueries() || []).filter((q: any) => q.userId === currentUser?.id));
  };

  // Sync profile form state if user changes
  useEffect(() => {
    if (currentUser) {
      setProfileFormData({
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        aadhaarNumber: currentUser.aadhaarNumber || '',
        panNumber: currentUser.panNumber || '',
        address: currentUser.address || '',
        district: currentUser.district || '',
        pincode: currentUser.pincode || '',
      });
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile(profileFormData);
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Check if landing page directed to apply a service
  useEffect(() => {
    const cachedSvcId = localStorage.getItem('segan_auto_apply_service_id');
    if (cachedSvcId) {
      const match = services.find(s => s.id === cachedSvcId);
      if (match) {
        setSelectedService(match);
        setActiveTab('apply');
        setApplyStep(1);
      }
      localStorage.removeItem('segan_auto_apply_service_id');
    }
  }, [services]);

  // Aggregate application totals
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'Submitted' || a.status === 'Document Verification').length;
  const processingApps = applications.filter(a => a.status === 'Under Review' || a.status === 'Processing').length;
  const approvedApps = applications.filter(a => a.status === 'Approved').length;
  const completedApps = applications.filter(a => a.status === 'Completed').length;
  const rejectedApps = applications.filter(a => a.status === 'Rejected').length;

  // Forms inputs validation check
  const isFormValidStep1 = () => {
    return formData.citizenAadhaar.length === 12 && /^\d+$/.test(formData.citizenAadhaar);
  };

  // Upload file handler (converts uploaded files to base64 for viewer persistence)
  const handleFileUploadLocal = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedFiles(prev => ({
        ...prev,
        [docName]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  // Skip / Delete file
  const handleRemoveFile = (docName: string) => {
    setUploadedFiles(prev => {
      const copy = { ...prev };
      delete copy[docName];
      return copy;
    });
  };

  // Submit application
  const handleSubmitApplication = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);

    try {
      // Document packing
      const docPayload = selectedService.requiredDocuments.map((docName: string) => ({
        documentName: docName,
        fileUrl: uploadedFiles[docName] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=60'
      }));

      // Insert to local virtual database
      const result = await applicationService.createApplication(selectedService.id, docPayload, {
        aadhaar: formData.citizenAadhaar,
        remarks: formData.extraRemarks
      });

      setNewlyCreatedApp(result);
      refreshApplications();
      setApplyStep(3); // Receipt step
    } catch (e: any) {
      console.error('Error submitting application:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyReset = () => {
    setSelectedService(null);
    setApplyStep(1);
    setFormData({ citizenAadhaar: '', categoryDetails: '', extraRemarks: '' });
    setUploadedFiles({});
    setNewlyCreatedApp(null);
  };

  // Status Badge formatting helper
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-900/40';
      case 'Approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-900/40';
      case 'Rejected': return 'bg-red-100 text-red-850 dark:bg-red-955/50 dark:text-red-400 border-2 border-red-200 dark:border-red-900/40';
      case 'Submitted': return 'bg-metro-teal text-metro-slate dark:bg-[#1A0B2E] dark:text-slate-400 border-2 border-metro-mauve dark:border-slate-800';
      default: return 'bg-amber-100 text-amber-805 dark:bg-amber-955/50 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-900/40';
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      
      {/* 1. Portal Segment Headings */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b-4 border-[#1A0B2E] pb-8 mb-10 text-left relative z-10 bg-metro-periwinkle dark:bg-[#1A0B2E] p-6 shadow-sm rounded-sm">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white bg-[#1A0B2E] dark:bg-[#FF007A] px-3 py-1 rounded-sm shadow-sm">
            {language === 'en' ? 'Citizen Dashboard' : 'குடிமகன் பகுதி'}
          </span>
          <h2 className="font-display font-black text-3xl md:text-4xl text-[#1A0B2E] dark:text-blue-100 mt-3 tracking-tight">
            {language === 'en' ? 'Welcome,' : 'வணக்கம்,'} <span className="text-[#FF007A] dark:text-[#FF007A]">{currentUser?.fullName}</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-bold flex items-center mt-2">
            <span className="w-2 h-2 rounded-full bg-[#FF007A] mr-2"></span>
            <span>{language === 'en' ? 'Secure session active' : 'பாதுகாப்பான குடிமகன் பகுதி'}</span>
          </p>
        </div>

        {/* Dashboard inner segment tab buttons */}
        <div className="flex p-1 bg-metro-periwinkle border border-metro-mauve dark:bg-[#7A00FF] dark:border-slate-700 mt-6 md:mt-0 font-medium overflow-x-auto scroller-hide w-full md:w-auto shadow-inner rounded-sm">
          <button
            onClick={() => { setActiveTab('overview'); handleApplyReset(); }}
            className={`px-5 py-2.5 rounded-sm text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'overview' 
                ? 'bg-[#1A0B2E] text-white shadow-md' 
                : 'text-metro-slate dark:text-slate-300 hover:text-slate-900 hover:bg-metro-mauve dark:hover:bg-slate-800'
            }`}
          >
            {language === 'en' ? 'Overview' : 'கட்டுப்பாட்டகம்'}
          </button>
          <button
            onClick={() => { setActiveTab('apply'); handleApplyReset(); }}
            className={`px-5 py-2.5 rounded-sm text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 border-l border-r border-[#1A0B2E]/10 dark:border-slate-700 ${
              activeTab === 'apply' 
                ? 'bg-[#1A0B2E] text-white shadow-md' 
                : 'text-metro-slate dark:text-slate-300 hover:text-slate-900 hover:bg-metro-mauve dark:hover:bg-slate-800'
            }`}
          >
            {language === 'en' ? 'Apply New' : 'புதிய விண்ணப்பம்'}
          </button>
          <button
            onClick={() => { setActiveTab('history'); handleApplyReset(); }}
            className={`px-5 py-2.5 rounded-sm text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'history' 
                ? 'bg-[#1A0B2E] text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-600/50' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-metro-teal/50 dark:hover:bg-slate-800/50'
            }`}
          >
            {language === 'en' ? 'History' : 'விண்ணப்ப வரலாறு'}
          </button>
          <button
            onClick={() => { setActiveTab('queries'); handleApplyReset(); }}
            className={`px-5 py-2.5 rounded-sm text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'queries' 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20 ring-1 ring-amber-600/50' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-metro-teal/50 dark:hover:bg-slate-800/50'
            }`}
          >
            {language === 'en' ? 'Support Queries' : 'உதவி கேள்விகள்'}
          </button>
          <button
            onClick={() => { setActiveTab('profile'); handleApplyReset(); }}
            className={`px-5 py-2.5 rounded-sm text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'profile' 
                ? 'bg-metro-cobalt text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-600/50' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-metro-teal/50 dark:hover:bg-slate-800/50'
            }`}
          >
            {language === 'en' ? 'Profile' : 'என் சுயவிவரம்'}
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: DESK OVERVIEW
          ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-10 relative z-10 animate-fade-in">
          
          {/* Quick status counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
            {[
              { label: 'Total Apps', val: totalApps, color: 'blue' },
              { label: 'Pending', val: pendingApps, color: 'amber' },
              { label: 'Processing', val: processingApps, color: 'indigo' },
              { label: 'Completed', val: completedApps + approvedApps, color: 'emerald' },
            ].map((stat, idx) => (
              <div key={idx} className="p-6 bg-metro-periwinkle dark:bg-[#1A0B2E] border-2 border-[#1A0B2E]/20 dark:border-slate-800 rounded-none shadow-sm hover:shadow-md hover:border-[#1A0B2E] transition-all duration-300 relative overflow-hidden group">
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-${stat.color}-500/10 rounded-full group-hover:bg-${stat.color}-500/20 transition-all`}></div>
                <div className="relative z-10">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{stat.label}</span>
                  <p className={`font-display font-black text-4xl text-${stat.color}-700 dark:text-${stat.color}-400 mt-2 tracking-tight`}>{stat.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Box: Quick application tracking list */}
            <div className="lg:col-span-2 bg-metro-periwinkle dark:bg-[#1A0B2E] border-2 border-metro-mauve dark:border-[#334155] p-6 rounded-none text-left shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b-2 border-metro-mauve dark:border-[#334155] pb-3">
                <h3 className="font-display font-extrabold text-sm text-[#1A0B2E] dark:text-white uppercase tracking-wider flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-[#FF007A]" />
                  <span>Ongoing Status Trackers</span>
                </h3>
                <button 
                  onClick={() => setActiveTab('history')} 
                  className="text-xs font-bold text-blue-700 dark:text-blue-300 hover:text-[#1A0B2E] dark:hover:text-white hover:underline transition-colors uppercase tracking-wider"
                >
                  View All Files
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <p className="text-xs font-semibold text-slate-500">No active applications currently active.</p>
                  <button 
                    onClick={() => setActiveTab('apply')}
                    className="px-6 py-2 bg-[#FF007A] border border-[#14532d] hover:bg-[#166534] text-white rounded-none text-xs font-bold uppercase tracking-widest shadow-sm"
                  >
                    Apply Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 3).map((app) => (
                    <div 
                      key={app.id} 
                      onClick={() => { setSelectedReceiptApp(app); }}
                      className="p-4 rounded-none border border-metro-mauve dark:border-[#334155] bg-metro-periwinkle dark:bg-[#7A00FF] hover:border-[#1A0B2E] dark:hover:border-blue-400 transition cursor-pointer flex flex-col gap-4 shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-display font-bold text-xs text-slate-900 dark:text-white">{app.serviceName}</span>
                            <span className="text-[10px] font-mono text-slate-500 block">{app.tokenNumber}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Applied: {new Date(app.createdAt).toLocaleDateString()} • Fee Paid: ₹{app.amount}
                          </span>
                        </div>

                        {/* Status badge and view receipt button */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getStatusBadgeClass(app.status)}`}>
                            {app.status}
                          </span>
                          
                          {/* Quick printable Receipt download */}
                          <button className="text-[10px] font-bold text-[#050505] dark:text-blue-400 hover:underline flex items-center space-x-1 p-1">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Visual Progress Tracker Components */}
                      <div className="w-full">
                        {app.status !== 'Rejected' ? (
                          <div className="relative pt-3 pb-1 w-full px-1">
                              {/* Connecting Line */}
                              <div className="absolute top-[14px] left-0 w-full h-[2px] bg-metro-mauve dark:bg-slate-700/50 rounded-full"></div>
                              <div className="absolute top-[14px] left-0 h-[2px] bg-[#FF007A] transition-all duration-700 rounded-full" 
                                   style={{ width: `${(getStageIndex(app.status) / (STAGES.length - 1)) * 100}%` }}>
                              </div>
                              
                              {/* Milestone Points Mini */}
                              <div className="relative flex justify-between items-start w-full">
                                 {STAGES.map((stage, index) => {
                                     const isCompleted = getStageIndex(app.status) >= index;
                                     const isCurrent = getStageIndex(app.status) === index;
                                     return (
                                         <div key={stage} className="flex flex-col items-center">
                                             <div className={`w-2 h-2 rounded-full z-10 transition-all duration-300 ${isCompleted ? 'bg-[#FF007A]' : 'bg-slate-300 dark:bg-slate-700'} ${isCurrent ? 'ring-2 ring-[#FF007A]/30 scale-125' : ''}`}></div>
                                         </div>
                                     )
                                 })}
                              </div>
                          </div>
                        ) : (
                          <div className="w-full h-1.5 bg-metro-mauve dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                             <div className="h-full bg-red-500 w-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Box: Department details & information */}
            <div className="bg-metro-periwinkle dark:bg-[#1A0B2E] border-2 border-metro-mauve dark:border-slate-800 p-6 rounded-sm text-left shadow-sm space-y-6">
              <h4 className="font-display font-extrabold text-xs text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-3">
                Important Directives
              </h4>
              <div className="space-y-4 text-xs font-semibold text-metro-slate dark:text-slate-300">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">Verify document formatting. PDF/PNG files must be original and fully legible before verifying.</p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">Keep your auto generated ticket secure. You can track approvals instantly from the homepage without logging in.</p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">For fast testing: Select center roles under Auth Page role switcher to mock approve files instantly.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: APPLY FOR NEW SERVICE (DYNAMIC GENERATOR)
          ===================================================================== */}
      {activeTab === 'apply' && (
        <div className="bg-metro-periwinkle dark:bg-[#1A0B2E] border-2 border-metro-mauve dark:border-slate-800 p-6 md:p-8 rounded-sm text-left shadow-sm">
          
          {!selectedService ? (
            // Select Service screen catalog
            <div>
              <div className="mb-6 flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-metro-slate dark:text-white">
                    {language === 'en' ? 'Select Service Catalog to Apply' : 'விண்ணப்பிக்க தேவையான சேவையைத் தேர்ந்தெடு'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Forms inputs, documents upload criteria, and billing fees are automatically compiled and generated natively based on your selection.
                  </p>
                </div>
                <button 
                  onClick={() => refreshServices()}
                  className="px-3 py-1.5 flex flex-row items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-sm hover:bg-blue-100 transition shadow-sm text-xs font-bold shrink-0"
                  title="Force synchronize latest services from Database"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Services</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.filter(s => s.active).map(svc => (
                  <div 
                    key={svc.id}
                    onClick={() => { setSelectedService(svc); setApplyStep(1); }}
                    className="p-5 rounded-sm border-2 border-metro-mauve dark:border-slate-800 bg-metro-periwinkle/50 dark:bg-[#050505]/20 hover:border-blue-500 hover:shadow-sm cursor-pointer transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-500 font-mono">
                          {svc.category}
                        </span>
                        <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white font-serif">
                          ₹{svc.price}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-metro-eggplant dark:text-white leading-snug">
                        {svc.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {svc.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Docs required: {svc.requiredDocuments.length}</span>
                      <span>Avg: {svc.processingDays} Days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Form wizard container
            <div>
              
              {/* Wizard Nav/Progress header bar */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center space-x-2">
                  <button 
                    type="button"
                    onClick={handleApplyReset}
                    className="p-1 px-2 border-2 border-metro-mauve dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-405 hover:bg-metro-teal flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back</span>
                  </button>
                  <span className="text-xs font-bold text-slate-900 dark:text-white max-w-[200px] md:max-w-md truncate">
                    {selectedService.name}
                  </span>
                </div>

                {/* Progress Indicators steps */}
                <div className="flex items-center space-x-1.5 md:space-x-3 text-xs font-bold text-slate-400 font-mono">
                  <span className={applyStep >= 1 ? 'text-metro-cobalt dark:text-blue-400' : ''}>1. Info</span>
                  <span>➔</span>
                  <span className={applyStep >= 2 ? 'text-metro-cobalt dark:text-blue-400' : ''}>2. Documents</span>
                  <span>➔</span>
                  <span className={applyStep >= 3 ? 'text-emerald-500' : ''}>3. Receipt</span>
                </div>
              </div>

              {/* STEP 1: INFO FORM ACCORDING TO DATABASE SPEC */}
              {applyStep === 1 && (
                <div className="space-y-4 max-w-xl">
                  <div className="p-4 rounded-sm bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-105/50 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-semibold">
                    🔑 This forms specification compiles requirements for standard Tamil Nadu Aadhaar authentication. Fill validation keys to proceed.
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      CITIZEN RESIDENT AADHAAR CARD ID (12 DIGITS)
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      className="w-full px-3 py-2.5 bg-metro-periwinkle dark:bg-[#050505] border-2 border-metro-mauve dark:border-slate-800 rounded-sm text-xs font-mono text-slate-900 dark:text-white"
                      placeholder="123412341234"
                      value={formData.citizenAadhaar || ''}
                      onChange={(e) => setFormData({ ...formData, citizenAadhaar: e.target.value.replace(/\D/g, '') })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      CITIZEN FAMILY INCOME / SPECIFIC CATEGORY DETAILS
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 bg-metro-periwinkle dark:bg-[#050505] border-2 border-metro-mauve dark:border-slate-800 rounded-sm text-xs text-slate-900 dark:text-white font-medium"
                      placeholder="Annual income approx ₹2,40,000 / Priority card citizen"
                      value={formData.categoryDetails || ''}
                      onChange={(e) => setFormData({ ...formData, categoryDetails: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      SPECIAL DETAILS OR REQUEST REMARKS
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 bg-metro-periwinkle dark:bg-[#050505] border-2 border-metro-mauve dark:border-slate-800 rounded-sm text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
                      placeholder="Need priority certificate because of immediate engineering admission"
                      value={formData.extraRemarks || ''}
                      onChange={(e) => setFormData({ ...formData, extraRemarks: e.target.value })}
                    ></textarea>
                  </div>

                  <button
                    onClick={() => { if (isFormValidStep1()) setApplyStep(2); }}
                    disabled={!isFormValidStep1()}
                    className="px-5 py-2.5 bg-metro-cobalt disabled:opacity-40 hover:bg-slate-800 text-white rounded-sm text-xs font-bold shadow-md cursor-pointer inline-flex items-center space-x-1.5 transition-all text-center"
                  >
                    <span>Proceed to Document Vault</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              )}

              {/* STEP 2: LIVE DYNAMIC DOCUMENT INPUT GENERATOR */}
              {applyStep === 2 && (
                <div className="space-y-5">
                  <div className="mb-4">
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                      {t('uploadDocs')}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Government portals require legible PDF or high resolution image assets. Ensure details match original Aadhaar files exactly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedService.requiredDocuments.map((docName: string) => {
                      const hasUploaded = !!uploadedFiles[docName];
                      return (
                        <div 
                          key={docName}
                          className={`p-4 rounded-sm border text-left flex justify-between items-center transition ${
                            hasUploaded 
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40' 
                              : 'bg-metro-periwinkle dark:bg-[#050505] border-metro-mauve dark:border-slate-800'
                          }`}
                        >
                          <div className="space-y-1 pr-4">
                            <span className="font-display font-medium text-xs text-metro-slate dark:text-slate-200 block">
                              {docName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold block">
                              {hasUploaded ? '✓ Loaded into memory' : 'Original file required (10KB - 5MB)'}
                            </span>
                          </div>

                          <div className="shrink-0">
                            {hasUploaded ? (
                              <div className="flex items-center space-x-2">
                                {/* Small visual preview thumbnail */}
                                <div className="w-9 h-9 rounded-lg border-2 border-metro-mauve bg-metro-periwinkle dark:bg-[#1A0B2E] overflow-hidden shrink-0">
                                  <img referrerPolicy="no-referrer" src={uploadedFiles[docName]} className="w-full h-full object-cover" alt="Preview" />
                                </div>
                                <button 
                                  onClick={() => handleRemoveFile(docName)}
                                  className="p-2 border-2 border-red-205/40 text-red-500 rounded-lg bg-red-105/10 hover:bg-red-200/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="p-2 px-3 border-2 border-metro-mauve dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-metro-periwinkle dark:bg-[#1A0B2E] hover:border-blue-400 rounded-sm cursor-pointer inline-flex items-center gap-1 shadow-sm uppercase">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Attach</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUploadLocal(docName, e)}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      type="button"
                      onClick={() => setApplyStep(1)}
                      className="px-4 py-2 border-2 border-metro-mauve dark:border-slate-800 text-xs font-semibold text-slate-500 rounded-sm hover:bg-metro-periwinkle cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitApplication}
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-[#1A0B2E] hover:bg-[#7A00FF] text-white rounded-sm text-xs font-bold shadow-md cursor-pointer flex items-center space-x-2"
                    >
                      <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SEAGAN TICKET SUCCESS ENGINES */}
              {applyStep === 3 && newlyCreatedApp && (
                <div className="space-y-6 text-center max-w-xl mx-auto py-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                    <CheckCircle className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white uppercase tracking-wider">
                      Application Submitted Successfully
                    </h3>
                    <p className="text-xs text-slate-540 text-slate-500 max-w-md mx-auto">
                      Your files have successfully entered the government "Document Verification" processing workflow stream. Download your smart receipt below.
                    </p>
                  </div>

                  {/* Interactive digital receipt render */}
                  <div className="p-6 rounded-sm border-2 border-slate-100 dark:border-slate-800 bg-metro-periwinkle dark:bg-[#050505] max-w-sm mx-auto shadow-xl text-left space-y-4">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-display font-black text-slate-900 dark:text-white block uppercase text-[10px]">SEAGAN A2Z Receipt</span>
                        <span className="text-[9px] font-mono text-slate-400">{newlyCreatedApp.tokenNumber}</span>
                      </div>
                      {/* Visual Government-Inspired Authenticity Seal */}
                      <span className="text-[8px] font-bold text-emerald-600 border-2 border-emerald-400/50 bg-emerald-100/50 rounded px-1 p-0.5 tracking-wider font-mono">
                        VERIFIED SEAL
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400 font-semibold font-mono">
                      <div className="flex justify-between">
                        <span>Resident Category:</span>
                        <span className="text-slate-900 dark:text-white text-right">{formData.categoryDetails || 'Standard Citizen'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aadhaar Auth:</span>
                        <span className="text-slate-900 dark:text-white text-right font-mono">•••• •••• {formData.citizenAadhaar.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Code:</span>
                        <span className="text-slate-900 dark:text-white text-right">₹{newlyCreatedApp.amount} (Paid)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Response:</span>
                        <span className="text-metro-eggplant dark:text-slate-350 text-right">{selectedService.processingDays} Working Days</span>
                      </div>
                    </div>

                    {/* Vector local QR render */}
                    <div className="flex justify-center p-2.5 bg-metro-periwinkle dark:bg-[#1A0B2E] rounded-sm border-2 border-slate-100 dark:border-slate-800">
                      <QRCodeGenerator 
                        value={`SEAGAN-TICKET-2026-VAL: TOKENREF:${newlyCreatedApp.tokenNumber} STATUS:${newlyCreatedApp.status}`} 
                        size={110} 
                      />
                    </div>

                    <p className="text-[9px] text-center text-slate-400 uppercase tracking-widest leading-relaxed">
                      {t('verifiedSeal')}
                    </p>
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      onClick={handleApplyReset}
                      className="px-4 py-2 border-2 border-metro-mauve dark:border-slate-800 text-xs font-semibold rounded-sm text-slate-500 hover:text-metro-slate bg-metro-periwinkle"
                    >
                      Apply for other schemes
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="px-5 py-2 bg-metro-cobalt hover:bg-metro-plum text-white rounded-sm text-xs font-bold"
                    >
                      Track Active Files
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* =====================================================================
          TAB 3: APPLICATIONS HISTORY (TRACK STATUS & PRINT COMPLETED FILE)
          ===================================================================== */}
      {activeTab === 'history' && (
        <div className="bg-metro-periwinkle dark:bg-[#1A0B2E] border-2 border-metro-mauve dark:border-slate-800 p-6 rounded-sm text-left shadow-sm">
          <div className="mb-6 flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                Application History Audit Desk
              </h3>
              <p className="text-xs text-slate-550 text-slate-400 mt-1">
                Real-time tracking of files. Click on any application to preview, inspect documents verify state, or print digitally signed smart receipts.
              </p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xs font-semibold text-slate-400">No applications registered currently. Select schemes tab to apply.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold whitespace-nowrap">
                <thead className="bg-metro-periwinkle dark:bg-[#050505] font-display font-bold uppercase tracking-wider text-slate-400 text-[10px] border-b border-metro-mauve dark:border-slate-805">
                  <tr>
                    <th className="p-4">Digital Scheme</th>
                    <th className="p-4">Ref token</th>
                    <th className="p-4">Fee Paid</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4">Processing Status</th>
                    <th className="p-4 text-center">Smart Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.map((app) => (
                    <tr 
                      key={app.id}
                      onClick={() => { setSelectedReceiptApp(app); }}
                      className="hover:bg-metro-periwinkle/50 dark:hover:bg-[#050505]/20 cursor-pointer transition"
                    >
                      <td className="p-4">
                        <span className="text-metro-eggplant dark:text-white font-bold">{app.serviceName}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs p-1 px-1.5 rounded bg-metro-teal dark:bg-[#131f24] text-slate-600 dark:text-slate-350">{app.tokenNumber}</span>
                      </td>
                      <td className="p-4 text-slate-900 dark:text-white">
                        ₹{app.amount}
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${getStatusBadgeClass(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button className="inline-flex items-center space-x-1 p-1 text-[11px] text-metro-cobalt dark:text-blue-400 font-bold hover:underline">
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* =====================================================================
          TAB 4: SUPPORT QUERIES
          ===================================================================== */}
      {activeTab === 'queries' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="bg-metro-periwinkle dark:bg-[#1A0B2E] p-6 border-2 border-slate-100 dark:border-slate-800 rounded-sm shadow-sm">
            <h4 className="font-display font-extrabold text-lg flex items-center mb-6 border-b pb-4 border-slate-100 dark:border-slate-800 text-metro-slate dark:text-blue-100">
              <MessageSquare className="w-5 h-5 mr-2 text-[#FF007A]" />
              Support Queries
            </h4>

            <form className="mb-8 space-y-4 max-w-xl" onSubmit={e => {
              e.preventDefault();
              if (queryForm.subject.trim() && queryForm.message.trim()) {
                queryService.submitQuery(queryForm.subject.trim(), queryForm.message.trim());
                setQueryForm({ subject: '', message: '' });
                refreshQueries();
                alert('Support query submitted successfully! The admin will review it and you will receive a notification.');
              }
            }}>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Subject</label>
                <input required type="text" value={queryForm.subject} onChange={(e) => setQueryForm({...queryForm, subject: e.target.value})} className="w-full px-4 py-3 bg-metro-periwinkle dark:bg-[#050505] border border-metro-mauve dark:border-slate-800 rounded-sm text-sm" placeholder="e.g., Problem with document upload" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Message</label>
                <textarea required rows={4} value={queryForm.message} onChange={(e) => setQueryForm({...queryForm, message: e.target.value})} className="w-full px-4 py-3 bg-metro-periwinkle dark:bg-[#050505] border border-metro-mauve dark:border-slate-800 rounded-sm text-sm" placeholder="Describe your issue..." />
              </div>
              <button type="submit" className="px-6 py-2.5 rounded-sm bg-metro-cobalt hover:bg-metro-plum text-white text-xs font-bold shadow-md">Submit Query</button>
            </form>

            <h5 className="font-bold text-sm text-metro-slate dark:text-slate-300 mb-4">Your Past Queries</h5>
            {queries.length === 0 ? (
              <div className="text-slate-500 text-sm">No support queries found.</div>
            ) : (
              <div className="space-y-4">
                {queries.map(q => (
                  <div key={q.id} className="p-4 border-2 border-slate-100 dark:border-slate-800 rounded-sm bg-metro-periwinkle dark:bg-[#050505]/20">
                    <div className="flex justify-between items-start mb-2">
                       <h6 className="font-bold text-sm text-slate-900 dark:text-amber-400">{q.subject}</h6>
                       <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${q.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-metro-mauve text-metro-slate dark:bg-slate-800 dark:text-slate-300'}`}>{q.status}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{q.message}</p>
                    {q.adminResponse && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 text-xs">
                        <span className="font-bold block text-blue-800 dark:text-blue-300 mb-1">Admin Response:</span>
                        <p className="text-blue-900 dark:text-blue-100 leading-relaxed">{q.adminResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: MY PROFILE
          ===================================================================== */}
      {activeTab === 'profile' && (
        <div className="bg-metro-periwinkle dark:bg-[#1A0B2E] border-2 border-metro-mauve dark:border-slate-800 p-6 rounded-sm text-left shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                My Profile Details
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Your digital identity on SEAGAN ENTERPRISES.
              </p>
            </div>
            {!isEditingProfile && currentUser && (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 border border-metro-mauve dark:border-slate-800 rounded-sm text-xs font-bold hover:bg-metro-periwinkle dark:hover:bg-slate-800/50 flex flex-row items-center gap-2"
              >
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {currentUser ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-metro-cobalt dark:text-blue-300 font-display font-black text-2xl border-4 border-slate-50 dark:border-slate-800">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-display font-black text-xl text-metro-eggplant dark:text-white">
                    {currentUser.fullName}
                  </h4>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-metro-teal text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-2 border-metro-mauve dark:border-slate-700">
                    {currentUser.role} Account
                  </span>
                </div>
              </div>

              {isEditingProfile ? (
                 <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-metro-mauve dark:border-slate-800">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Full Name</label>
                        <input required type="text" value={profileFormData.fullName} onChange={(e) => setProfileFormData({...profileFormData, fullName: e.target.value})} className="w-full px-4 py-3 bg-metro-periwinkle dark:bg-[#050505] border border-metro-mauve dark:border-slate-800 rounded-sm text-sm" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Phone Number</label>
                        <input required type="text" value={profileFormData.phone} onChange={(e) => setProfileFormData({...profileFormData, phone: e.target.value})} className="w-full px-4 py-3 bg-metro-periwinkle dark:bg-[#050505] border border-metro-mauve dark:border-slate-800 rounded-sm text-sm" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Aadhaar Number</label>
                        <input type="text" value={profileFormData.aadhaarNumber} onChange={(e) => setProfileFormData({...profileFormData, aadhaarNumber: e.target.value})} className="w-full px-4 py-3 bg-metro-periwinkle dark:bg-[#050505] border border-metro-mauve dark:border-slate-800 rounded-sm text-sm" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">PAN Number</label>
                        <input type="text" value={profileFormData.panNumber} onChange={(e) => setProfileFormData({...profileFormData, panNumber: e.target.value})} className="w-full px-4 py-3 bg-metro-periwinkle dark:bg-[#050505] border border-metro-mauve dark:border-slate-800 rounded-sm text-sm" />
                     </div>
                     <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Address</label>
                        <input type="text" value={profileFormData.address} onChange={(e) => setProfileFormData({...profileFormData, address: e.target.value})} className="w-full px-4 py-3 bg-metro-periwinkle dark:bg-[#050505] border border-metro-mauve dark:border-slate-800 rounded-sm text-sm" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">District</label>
                        <input type="text" value={profileFormData.district} onChange={(e) => setProfileFormData({...profileFormData, district: e.target.value})} className="w-full px-4 py-3 bg-metro-periwinkle dark:bg-[#050505] border border-metro-mauve dark:border-slate-800 rounded-sm text-sm" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Pincode</label>
                        <input type="text" value={profileFormData.pincode} onChange={(e) => setProfileFormData({...profileFormData, pincode: e.target.value})} className="w-full px-4 py-3 bg-metro-periwinkle dark:bg-[#050505] border border-metro-mauve dark:border-slate-800 rounded-sm text-sm" />
                     </div>
                   </div>
                   
                   <div className="flex gap-4 pt-4 justify-end">
                     <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-2.5 rounded-sm border-2 border-metro-mauve text-xs font-bold dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-metro-periwinkle dark:hover:bg-slate-800/50">Cancel</button>
                     <button type="submit" className="px-6 py-2.5 rounded-sm bg-metro-cobalt hover:bg-metro-plum text-white text-xs font-bold shadow-md">Save Changes</button>
                   </div>
                 </form>
              ) : (

              <div className="bg-metro-periwinkle dark:bg-[#050505] rounded-sm border-2 border-metro-mauve dark:border-slate-800 p-5 space-y-4 text-sm font-medium">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
                      <p className="text-slate-900 dark:text-slate-200 mt-0.5">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone Number</label>
                      <p className="text-slate-900 dark:text-slate-200 mt-0.5">{currentUser.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-sm bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aadhaar Number</label>
                      <p className="text-slate-900 dark:text-slate-200 mt-0.5 font-mono">{currentUser.aadhaarNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-sm bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">PAN Number</label>
                      <p className="text-slate-900 dark:text-slate-200 mt-0.5 font-mono uppercase">{currentUser.panNumber || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 md:col-span-2 mt-2">
                    <div className="w-8 h-8 rounded-sm bg-metro-mauve dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registered Address</label>
                      <p className="text-slate-900 dark:text-slate-200 mt-0.5">
                         {currentUser.address ? (
                            <>{currentUser.address}<br/>{currentUser.district && `${currentUser.district}, `}{currentUser.pincode}</>
                         ) : 'No address saved.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 pt-4 border-t border-metro-mauve dark:border-slate-800 md:col-span-2">
                    <div className="w-8 h-8 rounded-sm bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-metro-cobalt dark:text-blue-400 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Joined On</label>
                      <p className="text-slate-900 dark:text-slate-200 mt-0.5">{new Date(currentUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

               )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Could not pull profile identity. Please log in again.</p>
          )}

        </div>
      )}

      {/* =====================================================================
          APP MODAL: DIGITAL SMART RECEIPT DIALOG PRINT
          ===================================================================== */}
      {selectedReceiptApp && (
        <div className="fixed inset-0 z-50 bg-[#050505]/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-metro-periwinkle dark:bg-[#1A0B2E] max-w-md w-full rounded-sm border-2 border-metro-mauve dark:border-slate-800 shadow-2xl p-6 text-left relative overflow-hidden animate-scale-up">
            
            {/* Stamp-like visual header badge */}
            <div className="absolute -top-3 -right-3 w-20 h-20 bg-metro-cobalt/5 dark:bg-blue-500/5 rounded-full shrink-0"></div>

            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 animate-fade-in bg-metro-periwinkle p-1 rounded-sm shadow-md border-2 border-slate-100">
                  <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain rounded-lg" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-metro-cobalt dark:text-blue-450">SEAGAN ENTERPRISES</span>
                  <h4 className="font-display font-extrabold text-sm text-metro-eggplant dark:text-white mt-0.5">Digital Service Smart Receipt</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{selectedReceiptApp.tokenNumber}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedReceiptApp(null)}
                className="p-1 px-2 text-xs font-bold border-2 border-metro-mauve dark:border-slate-800 text-slate-500 hover:text-metro-slate dark:hover:text-white rounded-lg"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Process parameters lists */}
              <div className="p-4 bg-metro-periwinkle dark:bg-[#050505] rounded-sm border-2 border-metro-mauve dark:border-slate-800 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                <div className="flex justify-between">
                  <span>Resident Name:</span>
                  <span className="text-metro-eggplant dark:text-white font-bold">{selectedReceiptApp.userFullName || currentUser?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resident Email:</span>
                  <span className="text-metro-eggplant dark:text-white truncate max-w-[160px]">{selectedReceiptApp.userEmail || currentUser?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scheme requested:</span>
                  <span className="text-metro-eggplant dark:text-white font-bold max-w-[160px] text-right truncate">{selectedReceiptApp.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="text-metro-eggplant dark:text-white font-mono">TN_SIM_82049_2026</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-metro-mauve dark:border-slate-800 pt-2 text-slate-900 dark:text-white font-bold font-sans">
                  <span>Portal Billing Fee:</span>
                  <span className="font-mono">₹{selectedReceiptApp.amount}.00 (Paid)</span>
                </div>
              </div>

              {/* Live file tracker progress visualization bars */}
              <div className="space-y-4 p-4 border-2 border-slate-100 dark:border-slate-800 rounded-sm text-xs">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-display font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">
                    Live Action Tracker
                  </h5>
                  <span className="font-bold text-[#FF007A] uppercase tracking-wider text-[10px] bg-[#FF007A]/10 px-2 py-0.5 rounded-sm">{selectedReceiptApp.status}</span>
                </div>
                
                <div className="space-y-2">
                  {selectedReceiptApp.status !== 'Rejected' ? (
                    <div className="relative pt-4 pb-2 w-full px-2">
                        {/* Connecting Line */}
                        <div className="absolute top-5 left-0 w-full h-[3px] bg-metro-mauve dark:bg-slate-700/50 rounded-full"></div>
                        <div className="absolute top-5 left-0 h-[3px] bg-[#FF007A] border border-[#14532d] transition-all duration-700 rounded-full" 
                             style={{ width: `${(getStageIndex(selectedReceiptApp.status) / (STAGES.length - 1)) * 100}%` }}>
                        </div>
                        
                        {/* Milestone Points */}
                        <div className="relative flex justify-between items-start w-full">
                           {STAGES.map((stage, index) => {
                               const isCompleted = getStageIndex(selectedReceiptApp.status) >= index;
                               const isCurrent = getStageIndex(selectedReceiptApp.status) === index;
                               return (
                                   <div key={stage} className="flex flex-col items-center group w-16 -ml-8 first:ml-0 last:-mr-8">
                                       <div className={`w-3.5 h-3.5 rounded-full z-10 mb-2.5 outline outline-2 outline-offset-2 transition-all duration-300 ${isCompleted ? 'bg-[#FF007A] outline-[#FF007A] shadow-[0_0_8px_rgba(21,128,61,0.6)]' : 'bg-slate-300 dark:bg-slate-700 outline-transparent'} ${isCurrent ? 'ring-4 ring-[#FF007A]/30 scale-125' : ''}`}></div>
                                       <span className={`text-[8px] uppercase tracking-widest text-center transition-colors leading-tight ${isCurrent ? 'text-slate-900 dark:text-white font-extrabold' : (isCompleted ? 'text-[#FF007A] font-bold' : 'text-slate-400 font-semibold')}`}>{stage}</span>
                                   </div>
                               )
                           })}
                        </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 shadow-inner rounded-sm border-2 border-red-200 dark:border-red-900/40 text-[11px] text-red-700 dark:text-red-400">
                      <h4 className="font-extrabold flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
                         <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                         System Rejection Notice
                      </h4>
                      <p className="mt-1.5 text-metro-slate dark:text-slate-300 font-semibold leading-relaxed border-l-2 border-red-500 pl-2">{selectedReceiptApp.rejectionReason || 'Submitted original document lacks a clear digital stamp. Manual review required by the administrative desk.'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Symmetrical cryptographic QR Validation vectors */}
              <div className="flex flex-col items-center justify-center p-4 bg-metro-periwinkle dark:bg-[#050505] rounded-sm border-2 border-metro-mauve dark:border-slate-800 text-center gap-2">
                <QRCodeGenerator 
                  value={`SEAGAN-SMART-RECEIPT: TOKEN:${selectedReceiptApp.tokenNumber} VALUE:₹${selectedReceiptApp.amount} CITIZEN:${selectedReceiptApp.userFullName} DATE:${selectedReceiptApp.createdAt}`} 
                  size={120} 
                />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                  {t('digitallySigned')}
                </span>
              </div>

              {/* Action operations printable */}
              <button
                onClick={() => window.print()}
                className="w-full py-3 border-2 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-50 dark:hover:bg-blue-955/30 text-xs rounded-sm flex items-center justify-center space-x-1.5 transition uppercase"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certified Document</span>
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
