import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingOverlay } from '../common/LoadingSpinner';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function AuthCallback() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('Authentication failed. Please try again.');
          return;
        }

        if (data.session?.user) {
          // Get user type from URL params or user metadata
          const urlParams = new URLSearchParams(window.location.search);
          const userType = urlParams.get('userType') || data.session.user.user_metadata?.userType;
          const mode = urlParams.get('mode');

          // If this is a new registration via Google, create profile
          if (mode === 'register' && userType) {
            await createProfileForGoogleUser(data.session.user, userType);
          }

          // Redirect to main app
          window.location.href = '/';
        } else {
          setError('No user session found. Please try signing in again.');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError('Authentication failed. Please try again.');
      }
    };

    handleAuthCallback();
  }, []);

  const createProfileForGoogleUser = async (user: any, userType: string) => {
    try {
      if (userType === 'nurse') {
        const nurseProfile = {
          user_id: user.id,
          first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: '',
          date_of_birth: null,
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
          ssn_encrypted: '',
        };

        const { error: profileError } = await supabase
          .from('nurse_profiles')
          .insert([nurseProfile]);

        if (profileError) {
          console.error('Error creating nurse profile:', profileError);
        }

        // Create default availability
        const availabilityData = {
          user_id: user.id,
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: []
        };

        await supabase.from('nurse_availability').insert([availabilityData]);

      } else if (userType === 'hco') {
        const hcoProfile = {
          user_id: user.id,
          organization_name: '', // Will need to be filled out later
          contact_person_name: user.user_metadata?.full_name || '',
          email: user.email,
          phone: '',
          organization_type: '',
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

        const { error: profileError } = await supabase
          .from('hco_profiles')
          .insert([hcoProfile]);

        if (profileError) {
          console.error('Error creating HCO profile:', profileError);
        }
      }
    } catch (error) {
      console.error('Error creating profile for Google user:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return <LoadingOverlay message="Completing authentication..." />;
}
