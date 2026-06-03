import { realSupabase } from './supabaseClient';
import { Profile, Service, Application, ApplicationDocument, Notification, ActivityLog, AppSettings, UserRole } from '../types';

/**
 * TRUE SUPABASE SERVICE IMPLEMENTATION
 * To use this, you must:
 * 1. Create a Supabase project at 'https://supabase.com'
 * 2. Run the provided 'supabase_schema.sql' in your Supabase SQL editor
 * 3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables
 * 4. Refactor AppContext.tsx to await these async methods.
 */

export const realAuthService = {
  signIn: async (email: string): Promise<Profile | null> => {
    if (!realSupabase) throw new Error('Supabase client not initialized. Check .env variables.');
    const { data: profile, error } = await realSupabase
      .from('profiles')
      .select('*')
      .ilike('email', email)
      .single();
    if (error) throw error;
    return profile;
  },

  signUp: async (fullName: string, email: string, phone: string, role: UserRole = 'user'): Promise<Profile> => {
    if (!realSupabase) throw new Error('Supabase client not initialized.');
    
    // Check if user exists
    const { data: existing } = await realSupabase.from('profiles').select('id').ilike('email', email).single();
    if (existing) throw new Error('An account with this email already exists.');

    const { data: profile, error } = await realSupabase
      .from('profiles')
      .insert([{ fullName, email, phone, role }])
      .select()
      .single();
    
    if (error) throw error;
    return profile;
  },
  
  getAllUsers: async (): Promise<Profile[]> => {
    if (!realSupabase) return [];
    const { data, error } = await realSupabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
};

export const realServiceService = {
  getServices: async (): Promise<Service[]> => {
    if (!realSupabase) return [];
    const { data, error } = await realSupabase.from('services').select('*').eq('active', true).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  createService: async (serviceData: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
    if (!realSupabase) throw new Error('Supabase client not initialized.');
    const { data, error } = await realSupabase
      .from('services')
      .insert([serviceData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const realApplicationService = {
  getApplications: async (userId?: string, role?: UserRole): Promise<Application[]> => {
    if (!realSupabase) return [];
    let query = realSupabase.from('applications').select('*').order('created_at', { ascending: false });
    
    if (role !== 'admin' && userId) {
      query = query.eq('userId', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  createApplication: async (
    userId: string,
    serviceId: string, 
    documents: { documentName: string; fileUrl: string }[],
    serviceDetails: { name: string, category: string, price: number },
    userDetails: { fullName: string, email: string }
  ): Promise<Application> => {
    if (!realSupabase) throw new Error('Supabase client not initialized.');
    
    // Auto generate token
    const tokenNumber = `SEAGAN-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`;

    const { data: newApp, error: appError } = await realSupabase
      .from('applications')
      .insert([{
        tokenNumber,
        userId,
        serviceId,
        amount: serviceDetails.price,
        serviceName: serviceDetails.name,
        serviceCategory: serviceDetails.category,
        userFullName: userDetails.fullName,
        userEmail: userDetails.email,
        status: 'Submitted',
        paymentStatus: 'Paid'
      }])
      .select()
      .single();

    if (appError) throw appError;

    // Insert Docs
    if (documents.length > 0) {
      const docPayloads = documents.map(d => ({
        applicationId: newApp.id,
        documentName: d.documentName,
        fileUrl: d.fileUrl,
        verified: 'Pending'
      }));
      await realSupabase.from('application_documents').insert(docPayloads);
    }

    return newApp;
  }
};
