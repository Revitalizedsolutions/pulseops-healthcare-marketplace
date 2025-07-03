import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { AuthCallback } from './components/auth/AuthCallback';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { LoadingOverlay } from './components/common/LoadingSpinner';

// Dashboards
import { NurseDashboard } from './components/nurse/NurseDashboard';
import { HCODashboard } from './components/hco/HCODashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminPanel } from './components/admin/AdminPanel';

// Nurse Components
import { NurseProfile } from './components/nurse/NurseProfile';
import { NurseProfileEnhanced } from './components/nurse/NurseProfileEnhanced';
import { JobBrowser } from './components/nurse/JobBrowser';
import { DocumentUpload } from './components/nurse/DocumentUpload';
import { DocumentUploadComprehensive } from './components/nurse/DocumentUploadComprehensive';

// HCO Components
import { JobPostingForm } from './components/hco/JobPostingForm';
import { ApplicantView } from './components/hco/ApplicantView';
import { NurseSearch } from './components/hco/NurseSearch';

// Messaging Components
import { MessagingCenter } from './components/messaging/MessagingCenter';

// Subscription Components
import { SubscriptionPlans } from './components/subscription/SubscriptionPlans';
import { SubscriptionSuccess } from './components/subscription/SubscriptionSuccess';
import { SubscriptionStatus } from './components/subscription/SubscriptionStatus';

// Notification Components
import { NotificationsPage } from './components/notifications/NotificationsPage';

function AuthenticatedApp() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (isLoading) {
    return <LoadingOverlay message="Loading your dashboard..." />;
  }

  // Handle subscription routes
  if (window.location.pathname === '/subscription/plans') {
    return <SubscriptionPlans />;
  }

  if (window.location.pathname === '/subscription/success') {
    return <SubscriptionSuccess />;
  }

  const renderContent = () => {
    // Admin panel route
    if (currentView === 'admin-panel' || window.location.pathname === '/admin') {
      return <AdminPanel />;
    }
    
    // Notifications view for all user types
    if (currentView === 'notifications' || window.location.pathname === '/notifications') {
      return (
        <div className="p-6 h-full">
          <NotificationsPage />
        </div>
      );
    }
    
    // Messages view for all user types
    if (currentView === 'messages') {
      return (
        <div className="p-6 h-full">
          <MessagingCenter />
        </div>
      );
    }

    // Subscription view for all user types
    if (currentView === 'subscription') {
      if (window.location.search.includes('plans')) {
        return <SubscriptionPlans />;
      }
      return (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription Management</h1>
            <p className="text-gray-600">Manage your subscription and billing information</p>
          </div>
          <SubscriptionStatus />
          <div className="mt-8">
            <button
              onClick={() => window.location.href = '/subscription/plans'}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              View All Plans
            </button>
          </div>
        </div>
      );
    }

    // Nurse Views
    if (user?.userType === 'nurse') {
      switch (currentView) {
        case 'dashboard':
          return <NurseDashboard />;
        case 'profile':
          return <NurseProfileEnhanced />;
        case 'jobs':
          return <JobBrowser />;
        case 'documents':
          return <DocumentUploadComprehensive />;
        default:
          return <NurseDashboard />;
      }
    }

    // HCO Views
    if (user?.userType === 'hco') {
      switch (currentView) {
        case 'dashboard':
          return <HCODashboard />;
        case 'post-job':
          return <JobPostingForm />;
        case 'applicants':
          return <ApplicantView />;
        case 'search-nurses':
          return <NurseSearch />;
        default:
          return <HCODashboard />;
      }
    }

    // Admin Views
    if (user?.userType === 'admin') {
      switch (currentView) {
        case 'dashboard':
          return <AdminDashboard />;
        default:
          return <AdminDashboard />;
      }
    }

    return <div>Invalid user type</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function AuthFlow() {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <LoginForm onToggleMode={() => setIsLogin(false)} />
  ) : (
    <RegisterForm onToggleMode={() => setIsLogin(true)} />
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay message="Initializing PulseOps..." />;
  }

  // Handle auth callback route
  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  return user ? <AuthenticatedApp /> : <AuthFlow />;
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
