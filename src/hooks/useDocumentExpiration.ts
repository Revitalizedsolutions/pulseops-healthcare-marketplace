import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface ExpirationAlert {
  id: string;
  document_id: string;
  alert_type: '60_day' | '30_day' | '7_day' | 'expired';
  sent_at: string;
  acknowledged_at?: string;
  document: {
    document_type: string;
    file_name: string;
    expiration_date: string;
  };
}

export interface DocumentStatus {
  expired_count: number;
  expiring_soon_count: number;
  missing_required_count: number;
  can_apply_for_jobs: boolean;
  needs_attention: boolean;
  has_warnings: boolean;
}

export function useDocumentExpiration() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ExpirationAlert[]>([]);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expiration alerts
  const fetchAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('document_expiration_alerts')
        .select(`
          *,
          document:nurse_documents(
            document_type,
            file_name,
            expiration_date
          )
        `)
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err: any) {
      console.error('Error fetching expiration alerts:', err);
      setError(err.message);
    }
  };

  // Fetch document status
  const fetchDocumentStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_nurse_document_status', { nurse_user_id: user.id });

      if (error) throw error;
      setDocumentStatus(data);
    } catch (err: any) {
      console.error('Error fetching document status:', err);
      setError(err.message);
    }
  };

  // Check if nurse can apply for jobs
  const canApplyForJobs = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('can_nurse_apply_for_jobs', { nurse_user_id: user.id });

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error checking job application eligibility:', err);
      return false;
    }
  };

  // Acknowledge an alert
  const acknowledgeAlert = async (alertId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('document_expiration_alerts')
        .update({ acknowledged_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
      await fetchAlerts();
    } catch (err: any) {
      console.error('Error acknowledging alert:', err);
      throw err;
    }
  };

  // Get unacknowledged alerts
  const getUnacknowledgedAlerts = () => {
    return alerts.filter(alert => !alert.acknowledged_at);
  };

  // Get critical alerts (expired or 7-day)
  const getCriticalAlerts = () => {
    return alerts.filter(alert => 
      (alert.alert_type === 'expired' || alert.alert_type === '7_day') && 
      !alert.acknowledged_at
    );
  };

  // Get alert severity
  const getAlertSeverity = (alertType: string) => {
    switch (alertType) {
      case 'expired': return 'critical';
      case '7_day': return 'high';
      case '30_day': return 'medium';
      case '60_day': return 'low';
      default: return 'low';
    }
  };

  // Get alert message
  const getAlertMessage = (alert: ExpirationAlert) => {
    const docType = alert.document.document_type.replace('_', ' ').toLowerCase();
    const fileName = alert.document.file_name;
    const expiryDate = new Date(alert.document.expiration_date).toLocaleDateString();

    switch (alert.alert_type) {
      case 'expired':
        return `Your ${docType} (${fileName}) expired on ${expiryDate}. Please upload a new document immediately to continue applying for jobs.`;
      case '7_day':
        return `Your ${docType} (${fileName}) expires in 7 days on ${expiryDate}. Please upload a new document soon.`;
      case '30_day':
        return `Your ${docType} (${fileName}) expires in 30 days on ${expiryDate}. Consider uploading a new document.`;
      case '60_day':
        return `Your ${docType} (${fileName}) expires in 60 days on ${expiryDate}. Start planning to renew this document.`;
      default:
        return `Your ${docType} needs attention.`;
    }
  };

  // Get alert color
  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case 'expired': return 'red';
      case '7_day': return 'orange';
      case '30_day': return 'yellow';
      case '60_day': return 'blue';
      default: return 'gray';
    }
  };

  // Manually trigger expiration check (for testing)
  const triggerExpirationCheck = async (): Promise<void> => {
    try {
      const { error } = await supabase.rpc('run_expiration_check');
      if (error) throw error;
      
      // Refresh data after check
      await Promise.all([fetchAlerts(), fetchDocumentStatus()]);
    } catch (err: any) {
      console.error('Error triggering expiration check:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (user && user.userType === 'nurse') {
      Promise.all([fetchAlerts(), fetchDocumentStatus()])
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    alerts,
    documentStatus,
    loading,
    error,
    acknowledgeAlert,
    canApplyForJobs,
    getUnacknowledgedAlerts,
    getCriticalAlerts,
    getAlertSeverity,
    getAlertMessage,
    getAlertColor,
    triggerExpirationCheck,
    refreshData: () => Promise.all([fetchAlerts(), fetchDocumentStatus()])
  };
}