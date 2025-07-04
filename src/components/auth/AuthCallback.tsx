import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../context/AuthContext';
import { LoadingOverlay } from '../common/LoadingSpinner';
import { CheckCircle, AlertTriangle, Heart } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...');
        
        // Get the hash fragment from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check for error in URL
        const error = hashParams.get('error') || urlParams.get('error');
        const errorDescription = hashParams.get('error_description') || urlParams.get('error_description');
        
        if (error) {
          console.error('Auth callback error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || error);
          return;
        }

        // Check for access token (email confirmation or OAuth)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const tokenType = hashParams.get('token_type');
        
        if (accessToken && refreshToken) {
          console.log('Setting session from callback tokens...');
          
          // Set the session
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage('Failed to complete authentication. Please try again.');
            return;
          }

          console.log('Session set successfully:', data);
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting to your dashboard...');
          
          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          // Check if user is already authenticated
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            console.log('User already authenticated, redirecting...');
            setStatus('success');
            setMessage('Already signed in! Redirecting to your dashboard...');
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          } else {
            console.log('No valid session found in callback');
            setStatus('error');
            setMessage('Invalid authentication link. Please try signing in again.');
          }
        }
      } catch (error: any) {
        console.error('Auth callback processing error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, []);

  // If user is already authenticated, redirect
  useEffect(() => {
    if (user && status === 'loading') {
      console.log('User already authenticated, redirecting from callback...');
      window.location.href = '/';
    }
  }, [user, status]);

  if (status === 'loading') {
    return <LoadingOverlay message="Confirming your email..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#dc6014' }}>
              <Heart className="h-8 w-8 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold" style={{ color: '#20342b', fontFamily: 'Recoleta Bold, serif' }}>PulseOps</span>
          </div>
        </div>

        <div className={`rounded-lg p-6 text-center ${
          status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {status === 'success' ? (
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          )}
          
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#20342b', fontFamily: 'Recoleta Bold, serif' }}>
            {status === 'success' ? 'Email Confirmed!' : 'Confirmation Failed'}
          </h2>
          
          <p className={`mb-6 ${
            status === 'success' ? 'text-green-700' : 'text-red-700'
          }`}>
            {message}
          </p>
          
          {status === 'error' && (
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg text-white"
              style={{ backgroundColor: '#dc6014' }}
            >
              Go to Sign In
            </button>
          )}
        </div>
        
        {status === 'error' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Make sure you clicked the link from your email</li>
              <li>• Check if the link has expired (24 hours)</li>
              <li>• Try signing in with your email and password</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}