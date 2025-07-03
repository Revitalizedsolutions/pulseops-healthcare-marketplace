import React, { useState } from 'react';
import { Heart, Mail, Lock, ArrowRight, AlertTriangle, Info, ExternalLink, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { GoogleAuthButton } from './GoogleAuthButton.tsx';

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'nurse' | 'hco' | 'admin'>('nurse');
  const [error, setError] = useState('');
  const { login, loginWithGoogle, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password, userType);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle(userType);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    }
  };

  const isGoogleOAuthError = error.includes('Google OAuth is not configured');
  const isEmailNotConfirmedError = error.includes('check your email');

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#4f6883' }}>
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <img 
          src="/WhatsApp Image 2025-05-15 at 14.01.18_b6171461 - Edited.png.png" 
          alt="Healthcare professionals" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center mb-8">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
              <Heart className="h-8 w-8" />
            </div>
            <span className="ml-4 text-3xl font-bold">PulseOps</span>
          </div>
          <div className="mt-auto mb-24">
            <h1 className="text-4xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Recoleta Bold, serif' }}>
              Healthcare Without Walls
            </h1>
            <h2 className="text-3xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Recoleta Bold, serif' }}>
              Expertise Without Limits
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Bringing health equity to the community instantly connecting healthcare organizations with experienced nurses delivering quality care to the community.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center mb-6">
              <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#dc6014' }}>
                <Heart className="h-8 w-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold" style={{ color: '#20342b', fontFamily: 'Recoleta Bold, serif' }}>PulseOps</span>
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#20342b', fontFamily: 'Recoleta Bold, serif' }}>Welcome back</h2>
            <p style={{ color: '#476457' }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`border px-4 py-3 rounded-lg text-sm flex items-start ${
                isEmailNotConfirmedError 
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                {isEmailNotConfirmedError ? (
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  {error}
                  {isGoogleOAuthError && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs">
                      <strong>To set up Google OAuth:</strong>
                      <ol className="mt-2 list-decimal list-inside space-y-1">
                        <li>Go to your Supabase dashboard</li>
                        <li>Navigate to Authentication → Providers</li>
                        <li>Enable Google provider</li>
                        <li>Add your Google OAuth credentials</li>
                        <li>Set redirect URL to: <code className="bg-blue-100 px-1 rounded">{window.location.origin}/auth/callback</code></li>
                      </ol>
                      <a 
                        href="https://supabase.com/docs/guides/auth/social-login/auth-google" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Setup Guide <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="userType" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                Account Type
              </label>
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value as 'nurse' | 'hco' | 'admin')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200"
                style={{ borderColor: '#8fb1a8' }}
              >
                <option value="nurse">Independent Nurse Contractor</option>
                <option value="hco">Healthcare Organization</option>
                <option value="admin">Platform Administrator</option>
              </select>
            </div>

            {/* Google Sign In */}
            <GoogleAuthButton 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              userType={userType}
            />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500" style={{ backgroundColor: '#f5f5f5' }}>Or continue with email</span>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200"
                  style={{ borderColor: '#8fb1a8' }}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200"
                  style={{ borderColor: '#8fb1a8' }}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-2 px-4 rounded-lg focus:ring-2 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
              style={{ backgroundColor: '#dc6014' }}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p style={{ color: '#476457' }}>
              Don't have an account?{' '}
              <button
                onClick={onToggleMode}
                className="font-medium transition-colors duration-200"
                style={{ color: '#dc6014' }}
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
