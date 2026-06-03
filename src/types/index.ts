/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  processingDays: number;
  active: boolean;
  createdAt: string;
  requiredDocuments: string[]; // derived or mapped from service_documents
}

export type ApplicationStatus =
  | 'Submitted'
  | 'Document Verification'
  | 'Under Review'
  | 'Processing'
  | 'Approved'
  | 'Completed'
  | 'Rejected';

export interface Application {
  id: string;
  tokenNumber: string;
  userId: string;
  serviceId: string;
  status: ApplicationStatus;
  amount: number;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  rejectionReason?: string;
  createdAt: string;
  // Included fields for convenience:
  serviceName?: string;
  serviceCategory?: string;
  userFullName?: string;
  userEmail?: string;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentName: string;
  fileUrl: string; // data URL or path URL
  verified: 'Pending' | 'Approved' | 'Rejected';
  feedback?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  applicationId: string;
  amount: number;
  gateway: 'Cashfree' | 'Razorpay' | 'Simulator';
  transactionId: string;
  status: 'Pending' | 'Success' | 'Failed';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  createdAt: string;
}

export interface AppSettings {
  portalName: string;
  portalTagline: string;
  supportPhone: string;
  supportEmail: string;
  allowNewRegistrations: boolean;
}

export type Language = 'en' | 'ta';
export type Theme = 'light' | 'dark';
