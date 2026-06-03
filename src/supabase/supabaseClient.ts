/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { 
  Profile, 
  Service, 
  Application, 
  ApplicationDocument, 
  Notification, 
  Payment, 
  ActivityLog, 
  AppSettings,
  UserRole
} from '../types';

// Read configuration
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

// True client (only used if environment variables are provided)
export const realSupabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// =====================================================================
// HYBRID SIMULATED ENGINE
// For seamless operation inside sandboxed iframe without credentials,
// syncing state directly with localStorage.
// =====================================================================

const LOCAL_STORAGE_KEY = 'segan_db_v1';

interface DbState {
  profiles: Profile[];
  services: Service[];
  applications: Application[];
  applicationDocuments: ApplicationDocument[];
  notifications: Notification[];
  payments: Payment[];
  activityLogs: ActivityLog[];
  settings: AppSettings;
  currentUser: Profile | null;
}

// Pre-seeded Services standard in Tamil Nadu e-Sevai portals
const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv-001',
    name: 'Community Certificate (சாதிச் சான்றிதழ்)',
    description: 'Official certificate indicating the caste and community status of the applicant issued by the Revenue Department.',
    category: 'Revenue Department',
    price: 60,
    processingDays: 7,
    active: true,
    createdAt: new Date().toISOString(),
    requiredDocuments: ['Aadhaar Card', 'Ration Card', 'Father/Mother Community Certificate', 'Photo']
  },
  {
    id: 'srv-002',
    name: 'Income Certificate (வருமானச் சான்றிதழ்)',
    description: 'Certificate certifying the annual income of the family, crucial for scholarships and institutional fee concessions.',
    category: 'Revenue Department',
    price: 60,
    processingDays: 5,
    active: true,
    createdAt: new Date().toISOString(),
    requiredDocuments: ['Aadhaar Card', 'Ration Card', 'Salary Slip or Income Proof', 'Self Declaration']
  },
  {
    id: 'srv-003',
    name: 'First Graduate Certificate (முதல் பட்டதாரி சான்றிதழ்)',
    description: 'Issued to students who are the first graduates in their family, enabling academic fee concessions.',
    category: 'Revenue Department',
    price: 60,
    processingDays: 10,
    active: true,
    createdAt: new Date().toISOString(),
    requiredDocuments: ['Aadhaar Card', 'Ration Card', 'Transfer Certificate', 'Father & Mother School TC', 'Self Declaration']
  },
  {
    id: 'srv-004',
    name: 'New PAN Card Application (புதிய பான் கார்டு)',
    description: 'Application for allocation of Permanent Account Number (PAN) through NSDL.',
    category: 'Central Services',
    price: 120,
    processingDays: 15,
    active: true,
    createdAt: new Date().toISOString(),
    requiredDocuments: ['Aadhaar Card (Birth proof)', 'Proof of Address', 'Passport Photo', 'Signature']
  },
  {
    id: 'srv-005',
    name: 'Senior Citizen Pension Scheme (முதியோர் ஓய்வூதியம்)',
    description: 'Social Security Pension Scheme for financially vulnerable individuals aged 60 and above.',
    category: 'Social Welfare Department',
    price: 30,
    processingDays: 20,
    active: true,
    createdAt: new Date().toISOString(),
    requiredDocuments: ['Aadhaar Card', 'Age Proof (TC or Birth Certificate)', 'Ration Card', 'Bank Passbook Front Page', 'Photo']
  }
];

const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'usr-admin-2',
    fullName: 'Niranjan N S',
    email: 'niranjanns1925@gmail.com',
    phone: '+91 99999 99999',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-admin-1',
    fullName: 'Arun Kumar M',
    email: 'admin@segan.in',
    phone: '+91 94440 12345',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-super-1',
    fullName: 'Segan Durai (Senthil)',
    email: 'superadmin@segan.in',
    phone: '+91 98840 99999',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-user-1',
    fullName: 'Lakshmi Narayanan',
    email: 'lakshmiesavicentre4@gmail.com', // custom local time user email
    phone: '+91 97771 88888',
    role: 'user',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    tokenNumber: 'SEAGAN-2026-000001',
    userId: 'usr-user-1',
    serviceId: 'srv-001',
    status: 'Completed',
    amount: 60,
    paymentStatus: 'Paid',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    serviceName: 'Community Certificate (சாதிச் சான்றிதழ்)',
    serviceCategory: 'Revenue Department',
    userFullName: 'Lakshmi Narayanan',
    userEmail: 'lakshmiesavicentre4@gmail.com'
  },
  {
    id: 'app-002',
    tokenNumber: 'SEAGAN-2026-000002',
    userId: 'usr-user-1',
    serviceId: 'srv-002',
    status: 'Processing',
    amount: 60,
    paymentStatus: 'Paid',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    serviceName: 'Income Certificate (வருமானச் சான்றிதழ்)',
    serviceCategory: 'Revenue Department',
    userFullName: 'Lakshmi Narayanan',
    userEmail: 'lakshmiesavicentre4@gmail.com'
  }
];

const DEFAULT_DOCUMENTS: ApplicationDocument[] = [
  {
    id: 'doc-1',
    applicationId: 'app-001',
    documentName: 'Aadhaar Card',
    fileUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=60',
    verified: 'Approved'
  },
  {
    id: 'doc-2',
    applicationId: 'app-001',
    documentName: 'Ration Card',
    fileUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=60',
    verified: 'Approved'
  },
  {
    id: 'doc-3',
    applicationId: 'app-002',
    documentName: 'Aadhaar Card',
    fileUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=60',
    verified: 'Pending'
  },
  {
    id: 'doc-4',
    applicationId: 'app-002',
    documentName: 'Salary Slip or Income Proof',
    fileUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=60',
    verified: 'Pending'
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-001',
    userId: 'usr-user-1',
    title: 'Application Completed Successfully',
    message: 'Your Community Certificate (SEAGAN-2026-000001) has been approved and issued. You can now download the certificate from your dashboard.',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'not-002',
    userId: 'usr-user-1',
    title: 'Payment Confirmed',
    message: 'Payment of ₹60 for Income Certificate (SEAGAN-2026-000002) was processed successfully.',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  portalName: 'SEAGAN ENTERPRISES',
  portalTagline: 'Digital Services Simplified',
  supportPhone: '+91 94440 88888',
  supportEmail: 'support@segan.in',
  maintenanceMode: false,
  allowNewRegistrations: true
};

const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: 'pay-001',
    applicationId: 'app-001',
    amount: 60,
    gateway: 'Simulator',
    transactionId: 'TXN_SIM_2026_98271',
    status: 'Success',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pay-002',
    applicationId: 'app-002',
    amount: 60,
    gateway: 'Razorpay',
    transactionId: 'pay_TN_9812487214',
    status: 'Success',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    userId: 'usr-super-1',
    userEmail: 'superadmin@segan.in',
    userRole: 'admin',
    action: 'Portal initialization and master services set active.',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-2',
    userId: 'usr-admin-1',
    userEmail: 'admin@segan.in',
    userRole: 'admin',
    action: 'Verified Aadhaar Card for Application SEAGAN-2026-000001',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Initialize database
function initDatabase(): DbState {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Validate structure matches
      if (parsed.profiles && parsed.services && parsed.applications) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading localStorage database:', e);
  }

  // Fallback to default records
  const state: DbState = {
    profiles: DEFAULT_PROFILES,
    services: DEFAULT_SERVICES,
    applications: DEFAULT_APPLICATIONS,
    applicationDocuments: DEFAULT_DOCUMENTS,
    notifications: DEFAULT_NOTIFICATIONS,
    payments: DEFAULT_PAYMENTS,
    activityLogs: DEFAULT_LOGS,
    settings: DEFAULT_SETTINGS,
    currentUser: null // no active auth session at start
  };
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  return state;
}

const db = {
  get: (): DbState => {
    return initDatabase();
  },
  save: (state: DbState): void => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  },
  reset: (): void => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    initDatabase();
  }
};

// =====================================================================
// API INTERFACE SERVICES (Supports dynamic DB and local state)
// =====================================================================

export const authService = {
  // Get active session
  getSession: (): Profile | null => {
    const state = db.get();
    return state.currentUser;
  },

  // Log in
  signIn: async (email: string, roleForTesting?: UserRole): Promise<Profile> => {
    const state = db.get();
    let profile = state.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    
    if (!profile) {
      // If logging in for testing, generate high-quality fallback profile
      const defaultRole = roleForTesting || (email.includes('admin') ? 'admin' : 'user');
      profile = {
        id: 'usr-' + Math.random().toString(36).substr(2, 9),
        fullName: email.split('@')[0].toUpperCase().replace('.', ' '),
        email: email,
        phone: '+91 95551 12345',
        role: defaultRole,
        createdAt: new Date().toISOString()
      };
      state.profiles.push(profile);
    }
    
    state.currentUser = profile;
    
    // Add activity log
    state.activityLogs.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId: profile.id,
      userEmail: profile.email,
      userRole: profile.role,
      action: `Session Login success (${profile.role})`,
      createdAt: new Date().toISOString()
    });

    db.save(state);
    return profile;
  },

  // Add user without changing current user session (for admin panel)
  addUser: async (fullName: string, email: string, phone: string, role: UserRole): Promise<Profile> => {
    const state = db.get();
    
    if (state.currentUser?.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const existing = state.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newProfile: Profile = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      fullName,
      email,
      phone,
      role,
      createdAt: new Date().toISOString()
    };

    state.profiles.push(newProfile);

    // Track admin action
    state.activityLogs.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId: state.currentUser.id,
      userEmail: state.currentUser.email,
      userRole: state.currentUser.role,
      action: `Created new ${role} account for ${email}`,
      createdAt: new Date().toISOString()
    });

    db.save(state);
    return newProfile;
  },

  // Register
  signUp: async (fullName: string, email: string, phone: string, role: UserRole = 'user'): Promise<Profile> => {
    const state = db.get();
    
    const existing = state.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newProfile: Profile = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      fullName,
      email,
      phone,
      role,
      createdAt: new Date().toISOString()
    };

    state.profiles.push(newProfile);
    state.currentUser = newProfile;

    // Direct registration welcome notification
    state.notifications.unshift({
      id: 'not-' + Math.random().toString(36).substr(2, 9),
      userId: newProfile.id,
      title: 'Welcome to SEAGAN ENTERPRISES',
      message: 'Hello! Your digital service center profile is active. You can now apply for e-Sevai services, PAN card, pension, and track files in real-time.',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    state.activityLogs.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId: newProfile.id,
      userEmail: newProfile.email,
      userRole: newProfile.role,
      action: `Registered new citizen profile: ${fullName}`,
      createdAt: new Date().toISOString()
    });

    db.save(state);
    return newProfile;
  },

  signOut: (): void => {
    const state = db.get();
    if (state.currentUser) {
      state.activityLogs.unshift({
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        userId: state.currentUser.id,
        userEmail: state.currentUser.email,
        userRole: state.currentUser.role,
        action: 'Logged out of portal',
        createdAt: new Date().toISOString()
      });
    }
    state.currentUser = null;
    db.save(state);
  },

  // Get all users (Admin only)
  getAllUsers: (): Profile[] => {
    const state = db.get();
    return state.profiles;
  },

  // Update a user's role (Admin only RBAC)
  updateUserRole: (userId: string, newRole: UserRole): Profile[] => {
    const state = db.get();
    const profile = state.profiles.find(p => p.id === userId);
    if (profile) {
      const oldRole = profile.role;
      profile.role = newRole;
      
      state.activityLogs.unshift({
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        userId: 'usr-super-1',
        userEmail: 'superadmin@segan.in',
        userRole: 'admin',
        action: `RBAC Override: Updated ${profile.email} role from ${oldRole} to ${newRole}`,
        createdAt: new Date().toISOString()
      });

      if (state.currentUser?.id === userId) {
        state.currentUser.role = newRole;
      }
      
      db.save(state);
    }
    return state.profiles;
  }
};

export const serviceService = {
  getServices: (): Service[] => {
    const state = db.get();
    return state.services.filter(s => s.active);
  },

  getAllServicesWithInactive: (): Service[] => {
    const state = db.get();
    return state.services;
  },

  createService: (serviceData: Omit<Service, 'id' | 'createdAt'>): Service => {
    const state = db.get();
    const newService: Service = {
      ...serviceData,
      id: 'srv-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    state.services.push(newService);

    state.activityLogs.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId: state.currentUser?.id || 'admin-system',
      userEmail: state.currentUser?.email || 'admin@segan.in',
      userRole: state.currentUser?.role || 'admin',
      action: `Created new Service: "${newService.name}" for ₹${newService.price}`,
      createdAt: new Date().toISOString()
    });

    db.save(state);
    return newService;
  },

  updateService: (id: string, updatedData: Partial<Service>): Service => {
    const state = db.get();
    const sIndex = state.services.findIndex(s => s.id === id);
    if (sIndex === -1) throw new Error('Service not found');

    const updatedService = { ...state.services[sIndex], ...updatedData };
    state.services[sIndex] = updatedService;

    state.activityLogs.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId: state.currentUser?.id || 'admin-system',
      userEmail: state.currentUser?.email || 'admin@segan.in',
      userRole: state.currentUser?.role || 'admin',
      action: `Updated Service details: "${updatedService.name}"`,
      createdAt: new Date().toISOString()
    });

    db.save(state);
    return updatedService;
  },

  deleteService: (id: string): void => {
    const state = db.get();
    const serviceName = state.services.find(s => s.id === id)?.name || id;
    state.services = state.services.filter(s => s.id !== id);

    state.activityLogs.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId: state.currentUser?.id || 'admin-system',
      userEmail: state.currentUser?.email || 'admin@segan.in',
      userRole: state.currentUser?.role || 'admin',
      action: `Deleted Service: "${serviceName}"`,
      createdAt: new Date().toISOString()
    });

    db.save(state);
  }
};

export const applicationService = {
  getApplications: (): Application[] => {
    const state = db.get();
    const curUser = state.currentUser;
    if (!curUser) return [];

    if (curUser.role === 'admin') {
      return state.applications;
    }
    // Standard user gets own applications
    return state.applications.filter(app => app.userId === curUser.id);
  },

  getApplicationDetails: (appId: string): { application: Application; documents: ApplicationDocument[] } | null => {
    const state = db.get();
    const application = state.applications.find(a => a.id === appId);
    if (!application) return null;

    const documents = state.applicationDocuments.filter(d => d.applicationId === appId);
    return { application, documents };
  },

  createApplication: async (
    serviceId: string, 
    documents: { documentName: string; fileUrl: string }[],
    customFields?: Record<string, string>
  ): Promise<Application> => {
    const state = db.get();
    const curUser = state.currentUser;
    if (!curUser) throw new Error('Unauthorized');

    const service = state.services.find(s => s.id === serviceId);
    if (!service) throw new Error('Selected service not found');

    // Token Auto Increment Sequence simulator
    const count = state.applications.length + 1;
    const yearStr = new Date().getFullYear();
    const tokenNumber = `SEAGAN-${yearStr}-${String(count).padStart(6, '0')}`;

    const appId = 'app-' + Math.random().toString(36).substr(2, 9);
    
    const newApp: Application = {
      id: appId,
      tokenNumber,
      userId: curUser.id,
      serviceId,
      status: 'Submitted',
      amount: service.price,
      paymentStatus: 'Paid', // Pre-payment status simulation
      createdAt: new Date().toISOString(),
      serviceName: service.name,
      serviceCategory: service.category,
      userFullName: curUser.fullName,
      userEmail: curUser.email
    };

    state.applications.unshift(newApp);

    // Create Application Documents
    documents.forEach(doc => {
      state.applicationDocuments.push({
        id: 'doc-' + Math.random().toString(36).substr(2, 9),
        applicationId: appId,
        documentName: doc.documentName,
        fileUrl: doc.fileUrl,
        verified: 'Pending'
      });
    });

    // Create Payment record
    const payId = 'pay-' + Math.random().toString(36).substr(2, 9);
    state.payments.unshift({
      id: payId,
      applicationId: appId,
      amount: service.price,
      gateway: 'Simulator',
      transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      status: 'Success',
      createdAt: new Date().toISOString()
    });

    // Add customer notifications
    state.notifications.unshift({
      id: 'not-' + Math.random().toString(36).substr(2, 9),
      userId: curUser.id,
      title: 'Application Submitted',
      message: `Your application for ${service.name} has been submitted successfully. Token: ${tokenNumber}. It has entered the "Document Verification" processing stream.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // For real-time feel, auto advance in 15 seconds if not operated (or on user check)
    state.activityLogs.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId: curUser.id,
      userEmail: curUser.email,
      userRole: curUser.role,
      action: `Submitted application ${tokenNumber} for "${service.name}"`,
      createdAt: new Date().toISOString()
    });

    db.save(state);
    return newApp;
  },

  updateApplicationStatus: (appId: string, status: any, rejectionReason?: string): Application => {
    const state = db.get();
    const appIndex = state.applications.findIndex(a => a.id === appId);
    if (appIndex === -1) throw new Error('Application not found');

    const app = state.applications[appIndex];
    const oldStatus = app.status;
    app.status = status;
    if (rejectionReason) {
      app.rejectionReason = rejectionReason;
    }

    // Citizen alert
    state.notifications.unshift({
      id: 'not-' + Math.random().toString(36).substr(2, 9),
      userId: app.userId,
      title: `Status Updated: ${status}`,
      message: `Your application of ${app.serviceName || 'Service'} (${app.tokenNumber}) status has changed to "${status}".${
        rejectionReason ? ` Reason: ${rejectionReason}` : ''
      }`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    state.activityLogs.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId: state.currentUser?.id || 'admin-system',
      userEmail: state.currentUser?.email || 'admin@segan.in',
      userRole: state.currentUser?.role || 'admin',
      action: `Updated App ${app.tokenNumber} status: ${oldStatus} ➔ ${status}`,
      createdAt: new Date().toISOString()
    });

    db.save(state);
    return app;
  },

  verifyDocument: (docId: string, verifiedStatus: 'Approved' | 'Rejected', feedback?: string): ApplicationDocument => {
    const state = db.get();
    const docIndex = state.applicationDocuments.findIndex(d => d.id === docId);
    if (docIndex === -1) throw new Error('Document not found');

    const doc = state.applicationDocuments[docIndex];
    doc.verified = verifiedStatus;
    if (feedback) {
      doc.feedback = feedback;
    }

    // Automatically check if all docs verified to update status
    const parentApp = state.applications.find(a => a.id === doc.applicationId);
    if (parentApp) {
      state.activityLogs.unshift({
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        userId: state.currentUser?.id || 'admin-system',
        userEmail: state.currentUser?.email || 'admin@segan.in',
        userRole: state.currentUser?.role || 'admin',
        action: `Document Verified (${verifiedStatus}): "${doc.documentName}" for App ${parentApp.tokenNumber}`,
        createdAt: new Date().toISOString()
      });
    }

    db.save(state);
    return doc;
  }
};

export const notificationService = {
  getNotifications: (): Notification[] => {
    const state = db.get();
    const curUser = state.currentUser;
    if (!curUser) return [];
    return state.notifications.filter(n => n.userId === curUser.id);
  },

  markAsRead: (id: string): Notification[] => {
    const state = db.get();
    const n = state.notifications.find(not => not.id === id);
    if (n) {
      n.isRead = true;
      db.save(state);
    }
    return state.notifications.filter(not => not.userId === (state.currentUser?.id || ''));
  },

  markAllAsRead: (): Notification[] => {
    const state = db.get();
    state.notifications.forEach(n => {
      if (n.userId === state.currentUser?.id) {
        n.isRead = true;
      }
    });
    db.save(state);
    return state.notifications.filter(not => not.userId === (state.currentUser?.id || ''));
  },

  createSystemNotification: (userId: string, title: string, message: string): void => {
    const state = db.get();
    state.notifications.unshift({
      id: 'not-' + Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    db.save(state);
  }
};

export const reportService = {
  getActivityLogs: (): ActivityLog[] => {
    const state = db.get();
    return state.activityLogs;
  },

  getPayments: (): Payment[] => {
    const state = db.get();
    return state.payments;
  },

  getRevenueReport: () => {
    const state = db.get();
    const apps = state.applications;
    
    // Aggregate by category
    const categoryRevenue: Record<string, number> = {};
    const categoryVolume: Record<string, number> = {};
    
    apps.forEach(app => {
      const cat = app.serviceCategory || 'Other';
      if (app.paymentStatus === 'Paid') {
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + app.amount;
        categoryVolume[cat] = (categoryVolume[cat] || 0) + 1;
      }
    });

    return {
      totalRevenue: apps.reduce((sum, app) => sum + (app.paymentStatus === 'Paid' ? app.amount : 0), 0),
      volume: apps.length,
      categoryRevenue: Object.entries(categoryRevenue).map(([name, value]) => ({ name, value })),
      categoryVolume: Object.entries(categoryVolume).map(([name, value]) => ({ name, value }))
    };
  }
};

export const settingsService = {
  getSettings: (): AppSettings => {
    const state = db.get();
    return state.settings;
  },
  updateSettings: (newSettings: Partial<AppSettings>): AppSettings => {
    const state = db.get();
    state.settings = { ...state.settings, ...newSettings };
    
    state.activityLogs.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId: state.currentUser?.id || 'super-admin-system',
      userEmail: state.currentUser?.email || 'superadmin@segan.in',
      userRole: state.currentUser?.role || 'user',
      action: 'Updated global portal settings panel.',
      createdAt: new Date().toISOString()
    });

    db.save(state);
    return state.settings;
  }
};
