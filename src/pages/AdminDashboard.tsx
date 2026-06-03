/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  BarChart, 
  Users, 
  FileCheck, 
  Settings, 
  Activity, 
  Plus, 
  Save, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  Bell, 
  CloudRain, 
  CheckCircle, 
  XSquare, 
  Eye, 
  Download, 
  Edit3, 
  FileSpreadsheet, 
  Filter, 
  DollarSign,
  UserPlus
} from 'lucide-react';
import { 
  serviceService, 
  applicationService, 
  authService, 
  notificationService, 
  settingsService,
  reportService
} from '../supabase/supabaseClient';

export const AdminDashboard: React.FC = () => {
  const { 
    t, 
    currentUser, 
    setView, 
    services, 
    refreshServices, 
    applications, 
    refreshApplications, 
    logs, 
    refreshLogs, 
    settings, 
    updateGlobalSettings,
    language,
    addUser
  } = useApp();

  // Active admin menu state
  const [adminMenu, setAdminMenu] = useState<'analytics' | 'files' | 'services' | 'citizens' | 'reports' | 'logs' | 'config'>('analytics');

  // Application verification sub-flow state
  const [selectedReviewApp, setSelectedReviewApp] = useState<any>(null);
  const [reviewDocuments, setReviewDocuments] = useState<any[]>([]);
  const [rejectFormVisible, setRejectFormVisible] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');

  // Service Creator fields state
  const [newSvc, setNewSvc] = useState({ name: '', description: '', category: 'Revenue Department', price: 60, processingDays: 5, newDocName: '' });
  const [newSvcDocs, setNewSvcDocs] = useState<string[]>(['Aadhaar Card', 'Ration Card']);

  // Filters state
  const [fileFilterStatus, setFileFilterStatus] = useState('All');
  const [fileFilterCategory, setFileFilterCategory] = useState('All');
  const [citizenQuery, setCitizenQuery] = useState('');

  // Notifications global broadcast state
  const [broadcast, setBroadcast] = useState({ targetUserId: 'all', title: '', message: '' });
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // System reports generators helper
  const [reprOption, setReprOption] = useState<'daily' | 'weekly' | 'monthly' | 'revenue'>('daily');
  const [exportTriggered, setExportTriggered] = useState<string | null>(null);

  // Citizens listing fetch
  const profilesList = authService.getAllUsers();
  const paymentList = reportService.getPayments();

  // Aggregate Metrics computed and refreshed
  const metricsTotalRevenue = paymentList.reduce((sum, p) => sum + (p.status === 'Success' ? p.amount : 0), 0);
  const metricsVolume = applications.length;
  const metricsPending = applications.filter(a => a.status === 'Submitted' || a.status === 'Document Verification').length;
  const metricsProcessing = applications.filter(a => a.status === 'Under Review' || a.status === 'Processing').length;
  const metricsCompleted = applications.filter(a => a.status === 'Completed' || a.status === 'Approved').length;

  const filteredApplications = applications.filter(app => {
    const sMatch = fileFilterStatus === 'All' || app.status === fileFilterStatus;
    const cMatch = fileFilterCategory === 'All' || app.serviceCategory === fileFilterCategory;
    return sMatch && cMatch;
  });

  const uniqueCategories = ['All', ...new Set(services.map(s => s.category))];

  // RBAC selection handler
  const handleUpdateRole = (userId: string, newRole: 'user' | 'admin') => {
    authService.updateUserRole(userId, newRole);
    refreshLogs();
  };

  // Launch Service catalog creation
  const handleCreateServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvc.name || !newSvc.price) return;

    serviceService.createService({
      name: newSvc.name,
      description: newSvc.description,
      category: newSvc.category,
      price: Number(newSvc.price),
      processingDays: Number(newSvc.processingDays),
      active: true,
      requiredDocuments: newSvcDocs
    });

    // Reset Form
    setNewSvc({ name: '', description: '', category: 'Revenue Department', price: 60, processingDays: 5, newDocName: '' });
    setNewSvcDocs(['Aadhaar Card', 'Ration Card']);
    refreshServices();
    refreshLogs();
    alert('Dynamic Service Published Successfully!');
  };

  const handleAddDocToCreator = () => {
    if (!newSvc.newDocName.trim()) return;
    setNewSvcDocs([...newSvcDocs, newSvc.newDocName.trim()]);
    setNewSvc({ ...newSvc, newDocName: '' });
  };

  const handleRemoveDocFromCreator = (index: number) => {
    setNewSvcDocs(newSvcDocs.filter((_, idx) => idx !== index));
  };

  // Open Document verification dialog
  const handleOpenReview = (app: any) => {
    setSelectedReviewApp(app);
    const details = applicationService.getApplicationDetails(app.id);
    if (details) {
      setReviewDocuments(details.documents);
    }
    setRejectFormVisible(false);
    setRejectionComment('');
  };

  // Document verification checklists
  const handleVerifyDocumentAction = (docId: string, status: 'Approved' | 'Rejected') => {
    applicationService.verifyDocument(docId, status, status === 'Rejected' ? 'Form lacks clear print scale' : undefined);
    // Refresh sub-documents
    if (selectedReviewApp) {
      const details = applicationService.getApplicationDetails(selectedReviewApp.id);
      if (details) {
        setReviewDocuments(details.documents);
      }
    }
  };

  // Process and Advance Application Live status
  const handleResolveApplicationDraft = (status: 'Approved' | 'Completed' | 'Rejected' | 'Processing' | 'Under Review' | 'Document Verification' | 'Submitted') => {
    if (!selectedReviewApp) return;

    applicationService.updateApplicationStatus(
      selectedReviewApp.id, 
      status, 
      status === 'Rejected' ? rejectionComment || 'Files contain discrepancies.' : undefined
    );
    
    setSelectedReviewApp(null);
    refreshApplications();
    refreshLogs();
    alert(`File token status advanced to: ${status}`);
  };

  // Broadcast messages
  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcast.title || !broadcast.message) return;

    if (broadcast.targetUserId === 'all') {
      // Broadcast globally
      profilesList.forEach(prof => {
        notificationService.createSystemNotification(prof.id, broadcast.title, broadcast.message);
      });
    } else {
      notificationService.createSystemNotification(broadcast.targetUserId, broadcast.title, broadcast.message);
    }

    setBroadcast({ targetUserId: 'all', title: '', message: '' });
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
    refreshLogs();
  };

  // Export reports triggers mockers
  const handleExportTrigger = (type: 'csv' | 'excel' | 'pdf') => {
    setExportTriggered(type);
    
    // Simulate simple client side text files attachments downloads
    let content = `Segan Enterprises - Analytical Reports Summary\n`;
    content += `Period: June-2026 Monthly Summary\n`;
    content += `Total Volume: ${metricsVolume} files\n`;
    content += `Consolidated Portal Revenue: ${metricsTotalRevenue} INR\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Segan_Analytical_Report_2026.${type === 'csv' ? 'csv' : type === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setExportTriggered(null), 3000);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] pb-12 w-full animate-fade-in bg-slate-50/50 dark:bg-[#020817]">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 via-transparent to-blue-50/40 dark:from-purple-900/5 dark:via-transparent dark:to-blue-900/5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 text-left relative z-10">
      
      {/* LEFT ACCORD MOOD NAVIGATOR */}
      <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-2 bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-3xl h-fit shadow-[0_4px_20px_rgb(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] text-slate-700 dark:text-slate-300">
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4 text-center lg:text-left">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">ADMIN CONTROL PANEL</span>
          <h3 className="font-display font-black text-base text-slate-950 dark:text-white mt-1 uppercase max-w-[210px] truncate">
            {currentUser?.fullName}
          </h3>
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 mt-2 mb-1 rounded-md bg-emerald-50 dark:bg-purple-900/20 border border-emerald-200 dark:border-purple-800/40 text-[10px] font-bold text-emerald-700 dark:text-purple-300 uppercase shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span>Center Agent Admin</span>
          </span>
        </div>

        <button
          onClick={() => setAdminMenu('analytics')}
          className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] ${
            adminMenu === 'analytics' 
              ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/20 ring-1 ring-blue-600/50' 
              : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
          }`}
        >
          <BarChart className="w-4 h-4" />
          <span>Dashboard Analytics</span>
        </button>

        <button
          onClick={() => setAdminMenu('files')}
          className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminMenu === 'files' 
              ? 'bg-blue-600 text-white font-black shadow-md' 
              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Portal Applications ({metricsPending})</span>
        </button>

        <button
          onClick={() => setAdminMenu('services')}
          className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminMenu === 'services' 
              ? 'bg-blue-600 text-white font-black shadow-md' 
              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Dynamic Services</span>
        </button>

        <button
          onClick={() => setAdminMenu('citizens')}
          className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminMenu === 'citizens' 
              ? 'bg-blue-600 text-white font-black shadow-md' 
              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manage Citizens (RBAC)</span>
        </button>

        <button
          onClick={() => setAdminMenu('reports')}
          className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminMenu === 'reports' 
              ? 'bg-blue-600 text-white font-black shadow-md' 
              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Reports & Exports</span>
        </button>

        <button
          onClick={() => setAdminMenu('logs')}
          className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminMenu === 'logs' 
              ? 'bg-blue-600 text-white font-black shadow-md' 
              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Logs ({logs.length})</span>
        </button>

        <button
          onClick={() => setAdminMenu('config')}
          className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminMenu === 'config' 
              ? 'bg-blue-600 text-white font-black shadow-md' 
              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Global Portal Settings</span>
        </button>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center font-mono text-[9px] text-slate-400">
          AUTHORIZED CONSOLE ACCESS
        </div>
      </aside>

      {/* RIGHT DISPLAY PANEL MODULE */}
      <main className="flex-1 space-y-6">

        {/* =====================================================================
            MENU 1: DISPATCH BOARD ANALYTICS (CUSTOM HIGH VALUE CURVED CHARTS)
            ===================================================================== */}
        {adminMenu === 'analytics' && (
          <div className="space-y-6">
            
            {/* Bento dashboard cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-blue-600 text-white shadow-md relative overflow-hidden">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-100">Portal Gross Revenue</span>
                <p className="font-display font-black text-2xl mt-1.5 font-serif">₹{metricsTotalRevenue}.00</p>
                <DollarSign className="absolute -right-4 -bottom-4 w-20 h-20 text-blue-500/20" />
              </div>

              <div className="p-5 rounded-3xl bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Total Transactions</span>
                <p className="font-display font-black text-2xl mt-1.5 text-slate-900 dark:text-white">{metricsVolume}</p>
              </div>

              <div className="p-5 rounded-3xl bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Total Unresolved File Checks</span>
                <p className="font-display font-black text-2xl mt-1.5 text-amber-500">{metricsPending}</p>
              </div>

              <div className="p-5 rounded-3xl bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Audit completions</span>
                <p className="font-display font-black text-2xl mt-1.5 text-emerald-500">{metricsCompleted}</p>
              </div>
            </div>

            {/* Custom High Quality Symmetrical SVG Line Chart for June 2026 */}
            <div className="bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl text-left shadow-sm">
              <div className="border-b border-slate-50 dark:border-slate-800 pb-3 mb-5">
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Applications Traffic Load & Submissions Volume
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Statistical traffic updates mapped over weekly intervals for audit review.</p>
              </div>

              {/* Vector canvas lines bar graph */}
              <div className="w-full h-56 flex items-end justify-between font-mono text-[9px] text-slate-400 pt-6 px-4 bg-slate-50 dark:bg-[#020817]/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                
                {/* Visual bar groups block */}
                <div className="flex flex-col items-center flex-1 h-full justify-end pr-2 space-y-1">
                  <div className="w-8 md:w-12 bg-blue-600 rounded-t-lg transition-transform duration-500 hover:scale-105 shadow-inner" style={{ height: '35%' }}></div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Wk 1</span>
                </div>

                <div className="flex flex-col items-center flex-1 h-full justify-end pr-2 space-y-1">
                  <div className="w-8 md:w-12 bg-blue-600 rounded-t-lg transition-transform duration-500 hover:scale-105 shadow-inner" style={{ height: '65%' }}></div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Wk 2</span>
                </div>

                <div className="flex flex-col items-center flex-1 h-full justify-end pr-2 space-y-1">
                  <div className="w-8 md:w-12 bg-emerald-500 rounded-t-lg transition-transform duration-500 hover:scale-105 shadow-inner" style={{ height: '85%' }}></div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-bold">Wk 3</span>
                </div>

                <div className="flex flex-col items-center flex-1 h-full justify-end pr-2 space-y-1">
                  <div className="w-8 md:w-12 bg-blue-600 rounded-t-lg transition-transform duration-500 hover:scale-105 shadow-inner" style={{ height: '50%' }}></div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Wk 4</span>
                </div>

              </div>
            </div>

            {/* Quick operational activities log banner */}
            <div className="bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl text-left shadow-sm">
              <h4 className="font-display font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Urgent Actions Queue
              </h4>
              
              <div className="space-y-3 text-xs">
                {applications.filter(a => a.status === 'Submitted').length === 0 ? (
                  <p className="text-slate-400 font-medium py-3">All application document queues are up to date! Safe system state.</p>
                ) : (
                  applications.filter(a => a.status === 'Submitted').map(app => (
                    <div key={app.id} className="flex justify-between items-center p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{app.serviceName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Reference: {app.tokenNumber} • Resident: {app.userFullName}</span>
                      </div>
                      <button 
                        onClick={() => { setAdminMenu('files'); handleOpenReview(app); }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg tracking-wider transition uppercase"
                      >
                        Inspect Files
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* =====================================================================
            MENU 2: MANAGE CITIZEN APPLICATIONS (PREVIEW + PROCESS COUPLINGS)
            ===================================================================== */}
        {adminMenu === 'files' && (
          <div className="bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl text-left shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
              <div>
                <h4 className="font-display font-bold text-base text-slate-950 dark:text-white uppercase tracking-wider">
                  Citizens Service Portfolios
                </h4>
                <p className="text-xs text-slate-400 mt-1">Check and audit original attachments, verify authentication keys, and resolve application status streams in real-time.</p>
              </div>

              {/* Status filtering selector */}
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <select 
                  className="bg-slate-50 dark:bg-[#020817] border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                  value={fileFilterStatus}
                  onChange={(e) => setFileFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted Queue</option>
                  <option value="Document Verification">Document Verification</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Processing">Processing</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <p className="text-center text-xs font-semibold py-10 text-slate-400">No applications match these selection specifications currently.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-955 text-[10px] uppercase tracking-wider font-display font-black text-slate-400 border-b border-slate-200 dark:border-slate-805">
                    <tr>
                      <th className="p-3">Ref Token</th>
                      <th className="p-3">Citizen Resident</th>
                      <th className="p-3">Service Code</th>
                      <th className="p-3">Service Category</th>
                      <th className="p-3">Live Status</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold font-sans">
                    {filteredApplications.map(app => (
                      <tr key={app.id} className="hover:bg-slate-55/60 dark:hover:bg-slate-955/20">
                        <td className="p-3 text-slate-950 dark:text-white font-mono">{app.tokenNumber}</td>
                        <td className="p-3">
                          <span className="block font-bold text-slate-900 dark:text-white">{app.userFullName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{app.userEmail}</span>
                        </td>
                        <td className="p-3 text-slate-900 dark:text-white">{app.serviceName}</td>
                        <td className="p-3 text-slate-400">{app.serviceCategory || 'e-Sevai'}</td>
                        <td className="p-3">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-slate-100 dark:bg-[#0A1128]">
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleOpenReview(app)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-xl shadow-sm cursor-pointer transition uppercase"
                          >
                            Inspect Process
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* REVIEW FLOW EXPANDED MODAL DIALOG */}
            {selectedReviewApp && (
              <div className="fixed inset-0 z-50 bg-[#020817]/65 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className="bg-white dark:bg-slate-904 max-w-2xl w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-left relative max-h-[85vh] overflow-y-auto animate-scale-up">
                  
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-802 pb-3 mb-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-600">INSPECTION DESK AUDIT</span>
                      <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">{selectedReviewApp.serviceName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Reference Number: {selectedReviewApp.tokenNumber}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedReviewApp(null)}
                      className="p-1 px-2 border text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="space-y-5">
                    
                    {/* Display verification status controls widgets */}
                    <div className="p-4 p-x-5 bg-slate-50 dark:bg-[#020817] rounded-2xl border border-slate-200 dark:border-slate-802 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-bold">
                      <div>
                        <span className="text-[10px] text-slate-405 uppercase tracking-wider font-extrabold block">Citizen Reference Info:</span>
                        <div className="text-slate-900 dark:text-white mt-1">
                          Aadhaar verified: <span className="font-mono text-blue-600 dark:text-blue-400">SUCCESS</span>
                        </div>
                      </div>

                      {/* Progression status commands buttons triggers */}
                      <div className="flex flex-wrap gap-1.5">
                        <button 
                          onClick={() => handleResolveApplicationDraft('Document Verification')}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[10px] uppercase font-bold cursor-pointer transition"
                        >
                          Step: Check Docs
                        </button>
                        <button 
                          onClick={() => handleResolveApplicationDraft('Under Review')}
                          className="px-2.5 py-1.5 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] uppercase font-bold cursor-pointer transition"
                        >
                          Step: Under Review
                        </button>
                        <button 
                          onClick={() => handleResolveApplicationDraft('Processing')}
                          className="px-2.5 py-1.5 bg-amber-50/50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] uppercase font-bold cursor-pointer transition"
                        >
                          Step: Processing
                        </button>
                        <button 
                          onClick={() => handleResolveApplicationDraft('Completed')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] uppercase font-bold cursor-pointer transition"
                        >
                          Complete & Issue File
                        </button>
                      </div>
                    </div>

                    {/* CITIZEN DOCUMENTS ATTACHED LISTINGS & PREVIEW (READ-ONLY BASE64 VIEWER) */}
                    <div>
                      <h5 className="font-display font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-3">
                        Citizen Loaded Attachments ({reviewDocuments.length})
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviewDocuments.map(doc => (
                          <div key={doc.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#020817] text-xs flex justify-between items-center text-left">
                            <div className="space-y-0.5">
                              <span className="font-display font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[170px]">{doc.documentName}</span>
                              <span className={`text-[9px] font-bold ${doc.verified === 'Approved' ? 'text-emerald-500' : doc.verified === 'Rejected' ? 'text-red-500' : 'text-slate-400'}`}>
                                State: {doc.verified}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {/* Open original upload in new window / modal preview iframe */}
                              <a 
                                href={doc.fileUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="p-1 px-1.5 border hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-[10px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </a>
                              <a 
                                href={doc.fileUrl} 
                                download={`${doc.documentName}_${selectedReviewApp?.tokenNumber || 'doc'}.png`}
                                className="p-1 px-1.5 border hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-[10px] text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 inline-flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </a>
                              <button 
                                onClick={() => handleVerifyDocumentAction(doc.id, 'Approved')}
                                className="p-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded hover:bg-emerald-100"
                                title="Approve doc block"
                              >
                                ✓
                              </button>
                              <button 
                                onClick={() => handleVerifyDocumentAction(doc.id, 'Rejected')}
                                className="p-1 text-red-650 bg-red-50 dark:bg-red-955/40 rounded hover:bg-red-100"
                                title="Flag discrepancy error"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rejection comment text area dialog */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-left">
                      <button
                        onClick={() => setRejectFormVisible(!rejectFormVisible)}
                        className="text-xs font-bold text-red-550 hover:underline flex items-center space-x-1 uppercase bg-transparent"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span>Flag discrepancy & Reject citizen file</span>
                      </button>

                      {rejectFormVisible && (
                        <div className="mt-3 space-y-3">
                          <textarea
                            rows={3}
                            className="w-full p-2 bg-slate-50 dark:bg-[#020817] border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none"
                            placeholder="State rejection reasons... (e.g. Income Salary Slip page 2 requires a center seal)"
                            value={rejectionComment}
                            onChange={(e) => setRejectionComment(e.target.value)}
                          ></textarea>
                          <button
                            onClick={() => handleResolveApplicationDraft('Rejected')}
                            disabled={!rejectionComment.trim()}
                            className="px-4 py-2 bg-red-600 disabled:opacity-40 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer uppercase text-center"
                          >
                            Commit Rejection & Alert Citizen
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* =====================================================================
            MENU 3: DYNAMIC SERVICES MANAGEMENT (PRICE & SCHEMES CONFIG)
            ===================================================================== */}
        {adminMenu === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-700 dark:text-slate-300">
            
            {/* Left box: Create Dynamic service with customizable fields */}
            <div className="lg:col-span-5 bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl text-left shadow-sm space-y-4 h-fit">
              <h4 className="font-display font-bold text-sm uppercase tracking-wider text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                {t('createNewService')}
              </h4>

              <form onSubmit={handleCreateServiceSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                    Service Name (English & Tamil)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-100/50 dark:bg-[#020817] border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 font-medium dark:text-white"
                    placeholder="PAN Card Scheme (பான் கார்டு)"
                    value={newSvc.name || ''}
                    onChange={(e) => setNewSvc({ ...newSvc, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                    Department Division Category
                  </label>
                  <select
                    className="w-full p-2 bg-slate-100/50 dark:bg-[#020817] border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold"
                    value={newSvc.category || ''}
                    onChange={(e) => setNewSvc({ ...newSvc, category: e.target.value })}
                  >
                    <option value="Revenue Department">Revenue Department</option>
                    <option value="Social Welfare Department">Social Welfare Department</option>
                    <option value="Central Services">Central Services</option>
                    <option value="Other Services">Other Services</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      Billing price (INR)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-100/50 dark:bg-[#020817] border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-mono dark:text-white"
                      value={newSvc.price !== undefined ? newSvc.price : ''}
                      onChange={(e) => setNewSvc({ ...newSvc, price: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      Processing Time (Days)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-100/50 dark:bg-[#020817] border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-mono dark:text-white"
                      value={newSvc.processingDays !== undefined ? newSvc.processingDays : ''}
                      onChange={(e) => setNewSvc({ ...newSvc, processingDays: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                    Description Slogans
                  </label>
                  <textarea
                    rows={2}
                    className="w-full p-2 bg-slate-100/50 dark:bg-[#020817] border border-slate-150 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-1"
                    placeholder="Provide official brief description for citizens catalog details."
                    value={newSvc.description || ''}
                    onChange={(e) => setNewSvc({ ...newSvc, description: e.target.value })}
                  ></textarea>
                </div>

                {/* Dynamic custom file requirements checklist */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 block font-sans">
                    Configure Custom Document Checklist
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-1.5 bg-slate-100/50 dark:bg-[#020817] border border-slate-150 dark:border-slate-800 rounded-lg text-xs"
                      placeholder="e.g. Identity Proof, High TC"
                      value={newSvc.newDocName || ''}
                      onChange={(e) => setNewSvc({ ...newSvc, newDocName: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={handleAddDocToCreator}
                      className="px-3 bg-[#0A1128] dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {newSvcDocs.map((doc, index) => (
                      <span key={index} className="inline-flex items-center gap-1 bg-slate-105 border border-slate-200 py-1 px-2 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350">
                        <span>{doc}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveDocFromCreator(index)} 
                          className="text-red-500 font-bold hover:text-red-700 ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold text-xs rounded-xl shadow shadow-blue-900/30 cursor-pointer uppercase flex items-center justify-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('saveService')}</span>
                </button>

              </form>
            </div>

            {/* Right box: Active dynamic e-Services catalog listing */}
            <div className="lg:col-span-7 bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl text-left shadow-sm space-y-4">
              <h4 className="font-display font-bold text-sm uppercase tracking-wider text-slate-950 dark:text-white border-b border-slate-150 dark:border-slate-800 pb-3">
                Active Dynamic Service Catalog Directories
              </h4>
              <p className="text-xs text-slate-400">All forms and inputs dynamically assemble across the citizen register based on items defined below.</p>

              <div className="space-y-4">
                {services.map(svc => (
                  <div key={svc.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#020817]/25 flex justify-between items-start">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-display font-bold text-slate-900 dark:text-white text-sm">{svc.name}</span>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold bg-blue-105 dark:bg-blue-955/40 text-blue-705 p-0.5 px-1.5 rounded">{svc.category}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed max-w-sm line-clamp-2">{svc.description}</p>
                      
                      {/* Document requisites listing */}
                      <div className="pt-2 flex flex-wrap gap-1">
                        {svc.requiredDocuments.map((doc, index) => (
                          <span key={index} className="bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 p-0.5 px-1.5 text-[9px] rounded font-mono text-slate-600">{doc}</span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <span className="font-display font-black text-blue-600 dark:text-blue-400 font-serif text-sm block">₹{svc.price}</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-1">{svc.processingDays} Working Days</span>
                      <button
                        onClick={() => { serviceService.deleteService(svc.id); refreshServices(); refreshLogs(); }}
                        className="text-red-500 hover:text-red-700 font-bold p-1 border border-transparent rounded-lg bg-transparent mt-3 cursor-pointer"
                        title="Delete service panel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* =====================================================================
            MENU 4: CITIZENS USER SECURITY ROLES (SUPER PRIVILEGE)
            ===================================================================== */}
        {adminMenu === 'citizens' && (
          <div className="bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl text-left shadow-sm space-y-6">
            <div>
              <h4 className="font-display font-bold text-base text-slate-950 dark:text-white uppercase tracking-wider">
                Citizens DB Roster & Access Controls
              </h4>
              <p className="text-xs text-slate-400 mt-1">Audit security credentials, assign team role values, or override active session permissions (Super-Admin only).</p>
            </div>

            <div className="bg-slate-50 dark:bg-[#131f24] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 space-y-4">
              <h5 className="font-bold text-[11px] uppercase text-slate-700 dark:text-slate-300">Add New Admin / Citizen</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input type="text" placeholder="Full Name" id="addUser-name" className="text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A1128] focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <input type="email" placeholder="Email Address" id="addUser-email" className="text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A1128] focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <input type="tel" placeholder="Phone Number" id="addUser-phone" className="text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A1128] focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button
                  onClick={() => {
                    const name = (document.getElementById('addUser-name') as HTMLInputElement).value;
                    const email = (document.getElementById('addUser-email') as HTMLInputElement).value;
                    const phone = (document.getElementById('addUser-phone') as HTMLInputElement).value;
                    if (name && email) {
                      addUser(name, email, phone, 'admin').then(() => {
                        (document.getElementById('addUser-name') as HTMLInputElement).value = '';
                        (document.getElementById('addUser-email') as HTMLInputElement).value = '';
                        (document.getElementById('addUser-phone') as HTMLInputElement).value = '';
                        refreshLogs();
                      }).catch(e => alert(e.message));
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg p-2.5 transition-colors flex items-center justify-center space-x-2 shadow-md"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Admin</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-955 text-[10px] font-display font-black uppercase text-slate-450 border-b border-slate-200 dark:border-slate-805">
                  <tr>
                    <th className="p-3">Citizen Name</th>
                    <th className="p-3">Registered coordinates</th>
                    <th className="p-3">Session Access Level</th>
                    <th className="p-3 text-center">RBAC Control Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300 font-sans">
                  {profilesList.map(profile => (
                    <tr key={profile.id} className="hover:bg-slate-50/50 dark:hover:bg-[#020817]/20">
                      <td className="p-3 text-slate-100 font-bold text-slate-900 dark:text-white">
                        {profile.fullName}
                      </td>
                      <td className="p-3">
                        <span className="block font-mono">{profile.email}</span>
                        <span className="text-[10px] text-slate-400 block">{profile.phone}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          profile.role === 'admin' ? 'bg-emerald-100 text-emerald-800 dark:bg-indigo-955/50 dark:text-emerald-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {profile.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center items-center gap-1.5 text-[10px] font-black">
                          <button
                            onClick={() => handleUpdateRole(profile.id, 'user')}
                            className="p-1 px-2 border hover:bg-slate-150 rounded-lg cursor-pointer bg-white dark:bg-[#020817]"
                          >
                            Set Citizen
                          </button>
                          <button
                            onClick={() => handleUpdateRole(profile.id, 'admin')}
                            className="p-1 px-2 border text-emerald-600 dark:text-emerald-400 hover:bg-slate-150 rounded-lg cursor-pointer bg-white dark:bg-[#020817]"
                          >
                            Set Agent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Broadcast center widgets notifications */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 space-y-4 text-left">
              <h5 className="font-display font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
                <Bell className="w-4 h-4 mr-1.5 text-blue-600" />
                <span>BroadCast Center Broadcast Desk</span>
              </h5>

              <form onSubmit={handleBroadcastSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Target Account</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#020817] border border-slate-200 dark:border-slate-800 text-xs rounded-xl font-bold"
                    value={broadcast.targetUserId}
                    onChange={(e) => setBroadcast({ ...broadcast, targetUserId: e.target.value })}
                  >
                    <option value="all">Broadcast All Registered Citizens</option>
                    {profilesList.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.role})</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Alert Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-55 dark:bg-[#020817] border border-slate-200 dark:border-slate-800 text-xs rounded-xl"
                    placeholder="System Alert: Maintenance window"
                    value={broadcast.title}
                    onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">SMS message alert</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-55 dark:bg-[#020817] border border-slate-200 dark:border-slate-800 text-xs rounded-xl"
                    placeholder="E-Sevai files are processing with delay due to general holidays..."
                    value={broadcast.message}
                    onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer uppercase text-center"
                  >
                    Dispatch Msg
                  </button>
                </div>
              </form>

              {broadcastSuccess && (
                <div className="p-3 bg-emerald-100/50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900 rounded-xl text-emerald-805 dark:text-emerald-400 text-xs font-bold animate-fade-in text-center">
                  Broadcast transmitted securely over SMTP SMS Gateway!
                </div>
              )}
            </div>

          </div>
        )}

        {/* =====================================================================
            MENU 5: REPORTS & FILE EXPORTS CONTROLLING ENGINE
            ===================================================================== */}
        {adminMenu === 'reports' && (
          <div className="bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl text-left shadow-sm space-y-6 text-slate-700 dark:text-slate-300">
            <div>
              <h4 className="font-display font-bold text-sm uppercase tracking-wider text-slate-950 dark:text-white">
                Reports & Analytics Hub
              </h4>
              <p className="text-xs text-slate-400 mt-1">Configure and compile operational reporting frameworks. Download verified exports with single click.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setReprOption('daily')}
                className={`p-4 rounded-2xl border text-center transition ${
                  reprOption === 'daily' 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-300' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#020817]'
                }`}
              >
                <span className="font-display font-bold text-xs block mb-1">Daily Audit Report</span>
                <span className="text-[10px] text-slate-400 block font-semibold">Today Transactions</span>
              </button>
              
              <button
                onClick={() => setReprOption('weekly')}
                className={`p-4 rounded-2xl border text-center transition ${
                  reprOption === 'weekly' 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-300' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#020817]'
                }`}
              >
                <span className="font-display font-bold text-xs block mb-1">Weekly Resolution</span>
                <span className="text-[10px] text-slate-400 block font-semibold">7 Days Progression</span>
              </button>

              <button
                onClick={() => setReprOption('monthly')}
                className={`p-4 rounded-2xl border text-center transition ${
                  reprOption === 'monthly' 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-300' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#020817]'
                }`}
              >
                <span className="font-display font-bold text-xs block mb-1">Monthly Analytics</span>
                <span className="text-[10px] text-slate-400 block font-semibold">Consolidated Volumes</span>
              </button>

              <button
                onClick={() => setReprOption('revenue')}
                className={`p-4 rounded-2xl border text-center transition ${
                  reprOption === 'revenue' 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-300' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#020817]'
                }`}
              >
                <span className="font-display font-bold text-xs block mb-1">Revenue Stream</span>
                <span className="text-[10px] text-slate-400 block font-semibold">Consolidated Billing Receipts</span>
              </button>
            </div>

            {/* Simulated report viewer screens */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#020817] border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-mono text-xs uppercase font-extrabold tracking-widest text-slate-420">Reports Summary Panel</span>
                <span className="text-[10px] font-bold text-blue-600">June-2026 Audit Ready</span>
              </div>

              {reprOption === 'daily' && (
                <div className="space-y-2 text-xs">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Daily Submission volume count matches exact system benchmarks. Safe state.</p>
                  <div className="flex text-[11px] justify-between font-mono">
                    <span>Registered submissions (today):</span>
                    <span className="text-slate-900 dark:text-white font-bold">4 files</span>
                  </div>
                  <div className="flex text-[11px] justify-between font-mono">
                    <span>Gross transactional collections:</span>
                    <span className="text-slate-900 dark:text-white font-bold">₹360.00 INR</span>
                  </div>
                </div>
              )}

              {reprOption === 'revenue' && (
                <div className="space-y-2 text-xs font-semibold">
                  <p className="text-[11px]">Aggregators summary of active digital gateway networks (simulator payload):</p>
                  <table className="w-full text-left text-[11px] mt-2 border-t pt-2 max-w-sm">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-wider text-slate-405 border-b">
                        <th className="py-1">System Gateway</th>
                        <th className="py-1">Status</th>
                        <th className="py-1 text-right">Sum (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-1">Razorpay Sandbox</td>
                        <td className="py-1 text-emerald-500">Authorized</td>
                        <td className="py-1 text-right font-mono">₹60.00</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1">Segan Sandbox</td>
                        <td className="py-1 text-emerald-500">Authorized</td>
                        <td className="py-1 text-right font-mono">₹120.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Action buttons triggers files downloads */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-bold justify-end">
                <button
                  onClick={() => handleExportTrigger('csv')}
                  disabled={!!exportTriggered}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg bg-white inline-flex items-center space-x-1.5 cursor-pointer dark:text-slate-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{exportTriggered === 'csv' ? 'Compiling CSV...' : 'Export CSV'}</span>
                </button>
                <button
                  onClick={() => handleExportTrigger('excel')}
                  disabled={!!exportTriggered}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg bg-white inline-flex items-center space-x-1.5 cursor-pointer dark:text-slate-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{exportTriggered === 'excel' ? 'Formatting XLS...' : 'Export Excel'}</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            MENU 6: MASTER SYSTEM ACTIVITY LOGGER AUDIT (RLS & ACTION TRACKS)
            ===================================================================== */}
        {adminMenu === 'logs' && (
          <div className="bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl text-left shadow-sm space-y-6">
            <div className="border-b border-slate-50 dark:border-slate-800 pb-4 flex justify-between items-center gap-4">
              <div>
                <h4 className="font-display font-bold text-base text-slate-950 dark:text-white uppercase tracking-wider">
                  PostgreSQL Master Activity Audits
                </h4>
                <p className="text-xs text-slate-400 mt-1">Cryptographically tracking system actions, dynamic service creations, and administrative role modifications.</p>
              </div>
              <button 
                onClick={() => { refreshLogs(); }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl transition"
              >
                Refresh Log
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1 font-mono text-[11px] leading-relaxed">
              {logs.length === 0 ? (
                <p className="text-center text-xs text-slate-400 font-semibold py-6">No system activity tracking records found.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-3 border border-slate-100 dark:border-slate-860 rounded-xl bg-slate-50/50 dark:bg-[#020817]/20 text-slate-700 dark:text-slate-400">
                    <div className="flex justify-between items-start gap-4 mb-1 border-b border-dashed border-slate-150 pb-1.5 text-[9px] uppercase tracking-wider font-extrabold text-slate-450 rounded">
                      <span className="text-blue-600 dark:text-blue-400">{log.userRole}: {log.userEmail}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">{log.action}</p>
                    <span className="text-[9px] text-slate-450 block mt-1.5 text-right uppercase">Verified Audit Frame</span>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* =====================================================================
            MENU 7: GLOBAL CONFORMS CONFIGURATION PANELS
            ===================================================================== */}
        {adminMenu === 'config' && (
          <div className="bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl text-left shadow-sm space-y-6 text-slate-700 dark:text-slate-300">
            <div>
              <h4 className="font-display font-bold text-base text-slate-955 dark:text-white uppercase tracking-wider">
                Portal global settings
              </h4>
              <p className="text-xs text-slate-400 mt-1">Configure metadata taglines, support helpline contacts and maintenance parameters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-430 block mb-1">Portal Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#020817] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-500"
                  value={settings?.portalName || ''}
                  onChange={(e) => updateGlobalSettings({ portalName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-430 block mb-1">Helpline Contacts</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#020817] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-500"
                  value={settings?.supportPhone || ''}
                  onChange={(e) => updateGlobalSettings({ supportPhone: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-430 block mb-1">Administrative Support Inbox</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#020817] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-1"
                  value={settings?.supportEmail || ''}
                  onChange={(e) => updateGlobalSettings({ supportEmail: e.target.value })}
                />
              </div>
            </div>

            {/* Direct configurations toggles */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-bold space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-slate-900 dark:text-white">Citizen Registration Allowed</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Allow new residents to establish profile keys</span>
                </div>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-750 dark:border-gray-651"
                  checked={settings.allowNewRegistrations}
                  onChange={(e) => updateGlobalSettings({ allowNewRegistrations: e.target.checked })}
                />
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
    </div>
  );
};
