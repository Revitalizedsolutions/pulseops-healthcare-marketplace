import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'nurse' | 'hco' | 'admin') => Promise<void>;
  loginWithGoogle: (userType: 'nurse' | 'hco' | 'admin') => Promise<void>;
  register: (userData: any) => Promise<{ needsEmailConfirmation?: boolean }>;
  registerWithGoogle: (userType: 'nurse' | 'hco') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials configuration
const DEMO_CREDENTIALS = {
  'demo@nurse.com': { userType: 'nurse' as const, password: 'demo123' },
  'demo@hco.com': { userType: 'hco' as const, password: 'demo123' },
  'admin@pulseops.com': { userType: 'admin' as const, password: 'admin123' }
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Session found' : 'No session');
      if (session?.user) {
        handleAuthenticatedUser(session.user);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event);
        if (session?.user) {
          console.log('User authenticated:', session.user.email);
          await handleAuthenticatedUser(session.user);
        } else {
          console.log('User signed out or no session');
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthenticatedUser = async (authUser: any) => {
    try {
      console.log('Handling authenticated user:', authUser.email);
      // Check if user has a profile, if not create one
      const userType = authUser.user_metadata?.userType || 'nurse';
      console.log('User type:', userType);
      
      // Try to get existing profile
      let hasProfile = false;
      
      if (userType === 'nurse') {
        const { data: nurseProfile, error: profileError } = await supabase
          .from('nurse_profiles')
          .select('id')
          .eq('user_id', authUser.id)
          .single();
        
        console.log('Nurse profile check:', nurseProfile ? 'Found' : 'Not found', profileError ? `Error: ${profileError.message}` : '');
        
        if (!nurseProfile) {
          // Create nurse profile if it doesn't exist
          console.log('Creating nurse profile for:', authUser.id);
          await createNurseProfile(authUser.id, {
            firstName: authUser.user_metadata?.firstName || '',
            lastName: authUser.user_metadata?.lastName || '',
            email: authUser.email || '',
            phone: authUser.user_metadata?.phone || '',
            dateOfBirth: authUser.user_metadata?.dateOfBirth || null,
          });
        }
        hasProfile = true;
      } else if (userType === 'hco') {
        const { data: hcoProfile, error: profileError } = await supabase
          .from('hco_profiles')
          .select('id')
          .eq('user_id', authUser.id)
          .single();
        
        console.log('HCO profile check:', hcoProfile ? 'Found' : 'Not found', profileError ? `Error: ${profileError.message}` : '');
        
        if (!hcoProfile) {
          // Create HCO profile if it doesn't exist
          console.log('Creating HCO profile for:', authUser.id);
          await createHCOProfile(authUser.id, {
            organizationName: authUser.user_metadata?.organizationName || '',
            contactPersonName: authUser.user_metadata?.contactPersonName || '',
            email: authUser.email || '',
            phone: authUser.user_metadata?.phone || '',
            organizationType: authUser.user_metadata?.organizationType || '',
          });
        }
        hasProfile = true;
      }

      const mockUser: User = {
        id: authUser.id,
        email: authUser.email || '',
        userType,
        isApproved: true,
        credentialingStatus: userType === 'nurse' ? 'approved' : undefined,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      console.log('Setting user in state:', mockUser);
      setUser(mockUser);
    } catch (error) {
      console.error('Error handling authenticated user:', error);
      // Still set the user even if profile creation fails
      const mockUser: User = {
        id: authUser.id,
        email: authUser.email || '',
        userType: authUser.user_metadata?.userType || 'nurse',
        isApproved: true,
        credentialingStatus: authUser.user_metadata?.userType === 'nurse' ? 'approved' : undefined,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      console.log('Setting fallback user in state:', mockUser);
      setUser(mockUser);
    }
  };

  const login = async (email: string, password: string, userType: 'nurse' | 'hco' | 'admin') => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email, 'as', userType);
      // Check if this is a demo account
      const demoAccount = DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS];
      
      if (demoAccount && password === demoAccount.password && userType === demoAccount.userType) {
        console.log('Demo account login successful');
        // Handle demo login without Supabase authentication
        const mockUser: User = {
          id: `demo-${userType}-${Date.now()}`,
          email,
          userType,
          isApproved: true,
          credentialingStatus: userType === 'nurse' ? 'approved' : undefined,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        setUser(mockUser);
        return;
      }

      // For non-demo accounts, use Supabase authentication
      console.log('Attempting Supabase authentication');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        // Handle specific error cases with user-friendly messages
        if (error.message?.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in. Don\'t forget to check your spam folder!');
        } else if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else {
          throw new Error(error.message || 'Login failed');
        }
      }

      console.log('Supabase login successful:', data);
      // User will be set via the auth state change listener
    } catch (error: any) {
      console.error('Login error caught:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (userType: 'nurse' | 'hco' | 'admin') => {
    setIsLoading(true);
    try {
      console.log('Attempting Google login as:', userType);
      // Check if we're in development mode and provide helpful error
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            userType: userType,
          },
        },
      });

      if (error) {
        console.error('Supabase OAuth error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('Invalid provider') || error.message?.includes('not configured')) {
          throw new Error('Google OAuth is not configured in Supabase. Please set up Google OAuth in your Supabase dashboard under Authentication → Providers → Google.');
        } else if (error.message?.includes('redirect_uri')) {
          throw new Error('OAuth redirect URL mismatch. Please check your Google OAuth configuration.');
        } else if (error.message?.includes('client_id')) {
          throw new Error('Google OAuth client ID is missing or invalid. Please check your Supabase Google OAuth settings.');
        } else {
          throw new Error(`Google OAuth error: ${error.message}`);
        }
      }

      if (!data?.url) {
        throw new Error('Google OAuth is not properly configured. Please contact support or use email/password login.');
      }

      console.log('Redirecting to Google OAuth URL');
      // Redirect to Google OAuth
      window.location.href = data.url;
    } catch (error: any) {
      setIsLoading(false);
      console.error('Google OAuth error:', error);
      throw error;
    }
  };

  const register = async (userData: any): Promise<{ needsEmailConfirmation?: boolean }> => {
    setIsLoading(true);
    try {
      console.log('Attempting to register user:', userData.email);
      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            userType: userData.userType,
            firstName: userData.firstName,
            lastName: userData.lastName,
            organizationName: userData.organizationName,
            contactPersonName: userData.contactPersonName,
            phone: userData.phone,
            dateOfBirth: userData.dateOfBirth,
            organizationType: userData.organizationType,
          }
        }
      });

      if (authError) {
        console.error('Supabase signUp error:', authError);
        if (authError.message?.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try signing in instead.');
        }
        throw new Error(authError.message || 'Registration failed');
      }

      console.log('Supabase signUp data:', authData);

      if (authData.user) {
        // Check if email confirmation is required
        const needsEmailConfirmation = !authData.session;
        console.log('Email confirmation needed:', needsEmailConfirmation);

        if (needsEmailConfirmation) {
          // User needs to confirm email before profiles can be created
          // Profiles will be created automatically when they sign in after email confirmation
          console.log('User needs to confirm email before proceeding');
          return { needsEmailConfirmation: true };
        }

        // If user is immediately signed in (email confirmation disabled), 
        // profiles will be created via the auth state change listener
        console.log('User immediately signed in, profiles will be created via auth state change');
        return {};
      }

      return {};
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithGoogle = async (userType: 'nurse' | 'hco') => {
    setIsLoading(true);
    try {
      console.log('Attempting Google signup as:', userType);
      // Check if we're in development mode and provide helpful error
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?mode=register`,
          queryParams: {
            userType: userType,
            mode: 'register',
          },
        },
      });

      if (error) {
        console.error('Supabase OAuth error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('Invalid provider') || error.message?.includes('not configured')) {
          throw new Error('Google OAuth is not configured in Supabase. Please set up Google OAuth in your Supabase dashboard under Authentication → Providers → Google.');
        } else if (error.message?.includes('redirect_uri')) {
          throw new Error('OAuth redirect URL mismatch. Please check your Google OAuth configuration.');
        } else if (error.message?.includes('client_id')) {
          throw new Error('Google OAuth client ID is missing or invalid. Please check your Supabase Google OAuth settings.');
        } else {
          throw new Error(`Google OAuth error: ${error.message}`);
        }
      }

      if (!data?.url) {
        throw new Error('Google OAuth is not properly configured. Please contact support or use email/password registration.');
      }

      console.log('Redirecting to Google OAuth URL for registration');
      // Redirect to Google OAuth
      window.location.href = data.url;
    } catch (error: any) {
      setIsLoading(false);
      console.error('Google OAuth error:', error);
      throw error;
    }
  };

  const createNurseProfile = async (userId: string, userData: any) => {
    try {
      console.log('Creating nurse profile for user:', userId);
      // Create basic nurse profile
      const nurseProfile = {
        user_id: userId,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        date_of_birth: userData.dateOfBirth || null,
        bio: '',
        specialties: [],
        additional_certifications: '',
        years_experience: 0,
        travel_radius: 25,
        work_preference: 'both',
        credentialing_status: 'pending',
        rating: 0,
        total_jobs: 0,
        address_street: '',
        address_city: '',
        address_state: '',
        address_zip_code: '',
        ssn_encrypted: '', // Would be properly encrypted in production
      };

      const { data, error: profileError } = await supabase
        .from('nurse_profiles')
        .insert([nurseProfile]);

      if (profileError) {
        console.error('Error creating nurse profile:', profileError);
        throw new Error('Failed to create nurse profile');
      }

      console.log('Nurse profile created successfully:', data);

      // Create default availability (empty schedule)
      const availabilityData = {
        user_id: userId,
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      };

      const { error: availabilityError } = await supabase
        .from('nurse_availability')
        .insert([availabilityData]);

      if (availabilityError) {
        console.error('Error creating nurse availability:', availabilityError);
        // Don't throw here as profile creation is more important
      } else {
        console.log('Nurse availability created successfully');
      }
    } catch (error) {
      console.error('Error in createNurseProfile:', error);
      throw error;
    }
  };

  const createHCOProfile = async (userId: string, userData: any) => {
    try {
      console.log('Creating HCO profile for user:', userId);
      // Create HCO profile
      const hcoProfile = {
        user_id: userId,
        organization_name: userData.organizationName || '',
        contact_person_name: userData.contactPersonName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        organization_type: userData.organizationType || '',
        address_street: '',
        address_city: '',
        address_state: '',
        address_zip_code: '',
        billing_address_street: '',
        billing_address_city: '',
        billing_address_state: '',
        billing_address_zip_code: '',
        is_verified: false,
        verification_documents: [],
      };

      const { data, error: profileError } = await supabase
        .from('hco_profiles')
        .insert([hcoProfile]);

      if (profileError) {
        console.error('Error creating HCO profile:', profileError);
        throw new Error('Failed to create HCO profile');
      }

      console.log('HCO profile created successfully:', data);
    } catch (error) {
      console.error('Error in createHCOProfile:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    // For demo accounts, just clear the user state
    if (user?.id.startsWith('demo-')) {
      setUser(null);
      return;
    }
    
    // For real accounts, sign out from Supabase
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithGoogle, 
      register, 
      registerWithGoogle, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
