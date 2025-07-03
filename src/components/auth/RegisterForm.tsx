import React, { useState } from 'react';
import { Heart, ArrowLeft, User, Building2, Mail, Lock, Phone, MapPin, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { GoogleAuthButton } from './GoogleAuthButton';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'nurse' | 'hco'>('nurse');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    // Nurse fields
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    // HCO fields
    organizationName: '',
    contactPersonName: '',
    organizationType: '',
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { register, registerWithGoogle, isLoading } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};

    if (userType === 'nurse') {
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
      } else if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(formData.phone) && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Please enter a valid phone number';
      }
      if (!formData.dateOfBirth) {
        errors.dateOfBirth = 'Date of birth is required';
      } else {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18 || age > 100) {
          errors.dateOfBirth = 'Please enter a valid date of birth';
        }
      }
    } else {
      if (!formData.organizationName.trim()) {
        errors.organizationName = 'Organization name is required';
      }
      if (!formData.contactPersonName.trim()) {
        errors.contactPersonName = 'Contact person name is required';
      }
      if (!formData.organizationType) {
        errors.organizationType = 'Organization type is required';
      }
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
      }
    }

    return errors;
  };

  const handleStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      const errors = validateStep1();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      setValidationErrors({});
      setStep(2);
    } else {
      const errors = validateStep2();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      setValidationErrors({});
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    try {
      const result = await register({ ...formData, userType });
      
      if (result.needsEmailConfirmation) {
        setNeedsEmailConfirmation(true);
        setRegistrationSuccess(true);
      } else {
        setRegistrationSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    try {
      await registerWithGoogle(userType);
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed. Please try again.');
    }
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  // Show success message if registration was successful
  if (registrationSuccess) {
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
            <h1 className="text-4xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Recoleta Bold, serif' }}>
              Welcome to PulseOps!
            </h1>
            <p className="text-xl opacity-90 mb-8">
              {needsEmailConfirmation 
                ? 'Please check your email to complete your registration.'
                : 'Your account has been created successfully!'
              }
            </p>
          </div>
        </div>

        {/* Right side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12" style={{ backgroundColor: '#f5f5f5' }}>
          <div className="w-full max-w-md text-center">
            <div className="lg:hidden flex items-center justify-center mb-6">
              <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#dc6014' }}>
                <Heart className="h-8 w-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold" style={{ color: '#20342b', fontFamily: 'Recoleta Bold, serif' }}>PulseOps</span>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#20342b', fontFamily: 'Recoleta Bold, serif' }}>
                {needsEmailConfirmation ? 'Check Your Email!' : 'Registration Successful!'}
              </h2>
              
              {needsEmailConfirmation ? (
                <div className="space-y-4">
                  <p style={{ color: '#476457' }}>
                    We've sent a confirmation link to <strong>{formData.email}</strong>
                  </p>
                  <p style={{ color: '#476457' }}>
                    Please click the link in your email to verify your account before signing in.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <div className="flex items-start">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-sm text-blue-700">
                        <strong>Don't see the email?</strong>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>Check your spam/junk folder</li>
                          <li>Make sure you entered the correct email address</li>
                          <li>Wait a few minutes for the email to arrive</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#476457' }}>
                  Your account has been created and you can now sign in.
                </p>
              )}
            </div>

            <button
              onClick={onToggleMode}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg transform hover:scale-105 text-white"
              style={{ backgroundColor: '#dc6014' }}
            >
              {needsEmailConfirmation ? 'Go to Sign In' : 'Sign In Now'}
            </button>

            {needsEmailConfirmation && (
              <p className="mt-4 text-sm" style={{ color: '#476457' }}>
                After confirming your email, you'll be able to sign in and complete your profile.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

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

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center mb-6">
              <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#dc6014' }}>
                <Heart className="h-8 w-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold" style={{ color: '#20342b', fontFamily: 'Recoleta Bold, serif' }}>PulseOps</span>
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#20342b', fontFamily: 'Recoleta Bold, serif' }}>Create Account</h2>
            <p style={{ color: '#476457' }}>Step {step} of 2 - {step === 1 ? 'Account Setup' : 'Profile Information'}</p>
          </div>

          {step === 1 && (
            <form onSubmit={handleStepSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#476457' }}>
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('nurse')}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      userType === 'nurse'
                        ? 'border-[#dc6014] bg-[#dc6014]/10 shadow-lg transform scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <User className={`h-6 w-6 mb-2 ${userType === 'nurse' ? 'text-[#dc6014]' : 'text-gray-400'}`} />
                    <div className="font-medium" style={{ color: '#20342b' }}>Nurse</div>
                    <div className="text-sm" style={{ color: '#476457' }}>Independent Contractor</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('hco')}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      userType === 'hco'
                        ? 'border-[#7993ae] bg-[#7993ae]/10 shadow-lg transform scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <Building2 className={`h-6 w-6 mb-2 ${userType === 'hco' ? 'text-[#7993ae]' : 'text-gray-400'}`} />
                    <div className="font-medium" style={{ color: '#20342b' }}>Healthcare Org</div>
                    <div className="text-sm" style={{ color: '#476457' }}>Organization</div>
                  </button>
                </div>
              </div>

              {/* Google Sign Up */}
              <GoogleAuthButton 
                onClick={handleGoogleSignup}
                disabled={isLoading}
                userType={userType}
                mode="signup"
              />

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-500" style={{ backgroundColor: '#f5f5f5' }}>Or continue with email</span>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200 ${
                      validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    style={{ borderColor: validationErrors.email ? '#f87171' : '#8fb1a8' }}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200 ${
                      validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    style={{ borderColor: validationErrors.password ? '#f87171' : '#8fb1a8' }}
                    placeholder="Create a password"
                    required
                  />
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200 ${
                      validationErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    style={{ borderColor: validationErrors.confirmPassword ? '#f87171' : '#8fb1a8' }}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full text-white py-2 px-4 rounded-lg focus:ring-2 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
                style={{ backgroundColor: '#dc6014' }}
              >
                Continue
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStepSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {userType === 'nurse' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                        First Name *
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200 ${
                          validationErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        style={{ borderColor: validationErrors.firstName ? '#f87171' : '#8fb1a8' }}
                        placeholder="First name"
                        required
                      />
                      {validationErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                        Last Name *
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200 ${
                          validationErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        style={{ borderColor: validationErrors.lastName ? '#f87171' : '#8fb1a8' }}
                        placeholder="Last name"
                        required
                      />
                      {validationErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200 ${
                          validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        style={{ borderColor: validationErrors.phone ? '#f87171' : '#8fb1a8' }}
                        placeholder="(555) 123-4567"
                        maxLength={14}
                        required
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                      Date of Birth *
                    </label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200 ${
                        validationErrors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      style={{ borderColor: validationErrors.dateOfBirth ? '#f87171' : '#8fb1a8' }}
                      max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      required
                    />
                    {validationErrors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.dateOfBirth}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="organizationName" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                      Organization Name *
                    </label>
                    <input
                      id="organizationName"
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200 ${
                        validationErrors.organizationName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      style={{ borderColor: validationErrors.organizationName ? '#f87171' : '#8fb1a8' }}
                      placeholder="Your organization name"
                      required
                    />
                    {validationErrors.organizationName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.organizationName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contactPersonName" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                      Contact Person Name *
                    </label>
                    <input
                      id="contactPersonName"
                      type="text"
                      value={formData.contactPersonName}
                      onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200 ${
                        validationErrors.contactPersonName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      style={{ borderColor: validationErrors.contactPersonName ? '#f87171' : '#8fb1a8' }}
                      placeholder="Primary contact person"
                      required
                    />
                    {validationErrors.contactPersonName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.contactPersonName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200 ${
                          validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        style={{ borderColor: validationErrors.phone ? '#f87171' : '#8fb1a8' }}
                        placeholder="(555) 123-4567"
                        maxLength={14}
                        required
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="organizationType" className="block text-sm font-medium mb-2" style={{ color: '#476457' }}>
                      Organization Type *
                    </label>
                    <select
                      id="organizationType"
                      value={formData.organizationType}
                      onChange={(e) => handleInputChange('organizationType', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-gray-400 transition-all duration-200 ${
                        validationErrors.organizationType ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      style={{ borderColor: validationErrors.organizationType ? '#f87171' : '#8fb1a8' }}
                      required
                    >
                      <option value="">Select organization type</option>
                      <option value="specialty_pharmacy">Specialty Pharmacy</option>
                      <option value="medical_device">Medical Device Company</option>
                      <option value="telehealth">Telehealth Practice</option>
                      <option value="private_practice">Private Practice</option>
                      <option value="concierge_medicine">Concierge Medicine</option>
                      <option value="community_health">Community Health</option>
                      <option value="home_health">Home Health Agency</option>
                      <option value="infusion_center">Infusion Center</option>
                      <option value="other">Other</option>
                    </select>
                    {validationErrors.organizationType && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.organizationType}</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center hover:shadow-md"
                  style={{ color: '#476457' }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 text-white py-2 px-4 rounded-lg focus:ring-2 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
                  style={{ backgroundColor: '#dc6014' }}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p style={{ color: '#476457' }}>
              Already have an account?{' '}
              <button
                onClick={onToggleMode}
                className="font-medium transition-colors duration-200"
                style={{ color: '#dc6014' }}
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Registration Benefits */}
          <div className="mt-8 rounded-lg p-4" style={{ backgroundColor: '#b4d6d2' }}>
            <h3 className="font-medium mb-3" style={{ color: '#20342b' }}>
              {userType === 'nurse' ? 'Nurse Benefits' : 'Organization Benefits'}
            </h3>
            <ul className="text-sm space-y-2" style={{ color: '#476457' }}>
              {userType === 'nurse' ? (
                <>
                  <li>• Set your own rates and schedule</li>
                  <li>• Direct payment without agency fees</li>
                  <li>• Access to verified healthcare organizations</li>
                  <li>• Comprehensive credentialing support</li>
                </>
              ) : (
                <>
                  <li>• Save 40-60% on staffing costs</li>
                  <li>• Access pre-credentialed nurses</li>
                  <li>• Faster hiring process</li>
                  <li>• HIPAA-compliant platform</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
