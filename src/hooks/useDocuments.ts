import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: 'uploaded' | 'under_review' | 'approved' | 'rejected' | 'expired';
  expiration_date?: string;
  notes?: string;
  uploaded_at: string;
  approved_at?: string;
  active_shares: number;
  is_expired: boolean;
  expires_soon: boolean;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  shared_with_user_id: string;
  shared_by_user_id: string;
  job_id?: string;
  application_id?: string;
  granted_at: string;
  expires_at?: string;
  access_level: 'view' | 'download';
}

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's documents
  const fetchDocuments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nurse_document_summaries')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload a new document
  const uploadDocument = async (
    file: File,
    documentType: string,
    expirationDate?: string
  ): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('nurse-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create document record in database
      const { data: docData, error: docError } = await supabase
        .from('nurse_documents')
        .insert({
          user_id: user.id,
          document_type: documentType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          status: 'under_review',
          expiration_date: expirationDate || null
        })
        .select()
        .single();

      if (docError) throw docError;

      // Refresh documents list
      await fetchDocuments();

      return docData.id;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  // Download a document
  const downloadDocument = async (documentId: string): Promise<string> => {
    try {
      // Get document info
      const { data: doc, error: docError } = await supabase
        .from('nurse_documents')
        .select('file_path, file_name')
        .eq('id', documentId)
        .single();

      if (docError) throw docError;

      // Get signed URL for download
      const { data: urlData, error: urlError } = await supabase.storage
        .from('nurse-documents')
        .createSignedUrl(doc.file_path, 3600); // 1 hour expiry

      if (urlError) throw urlError;

      // Log the access
      await supabase
        .from('document_access_logs')
        .insert({
          document_id: documentId,
          user_id: user?.id,
          action: 'download'
        });

      return urlData.signedUrl;
    } catch (error: any) {
      console.error('Error downloading document:', error);
      throw error;
    }
  };

  // Share a document with another user
  const shareDocument = async (
    documentId: string,
    shareWithUserId: string,
    jobId?: string,
    applicationId?: string,
    expiresAt?: string
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('document_shares')
        .insert({
          document_id: documentId,
          shared_with_user_id: shareWithUserId,
          shared_by_user_id: user?.id,
          job_id: jobId,
          application_id: applicationId,
          expires_at: expiresAt
        });

      if (error) throw error;

      // Log the sharing action
      await supabase
        .from('document_access_logs')
        .insert({
          document_id: documentId,
          user_id: user?.id,
          action: 'share',
          metadata: { shared_with: shareWithUserId }
        });

      await fetchDocuments();
    } catch (error: any) {
      console.error('Error sharing document:', error);
      throw error;
    }
  };

  // Revoke document access
  const revokeDocumentAccess = async (shareId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('document_shares')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', shareId);

      if (error) throw error;

      await fetchDocuments();
    } catch (error: any) {
      console.error('Error revoking document access:', error);
      throw error;
    }
  };

  // Get document shares for a document
  const getDocumentShares = async (documentId: string): Promise<DocumentShare[]> => {
    try {
      const { data, error } = await supabase
        .from('document_shares')
        .select(`
          *,
          shared_with:auth.users!shared_with_user_id(email),
          job:jobs(title)
        `)
        .eq('document_id', documentId)
        .is('revoked_at', null)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching document shares:', error);
      throw error;
    }
  };

  // Delete a document
  const deleteDocument = async (documentId: string): Promise<void> => {
    try {
      // Get document info first
      const { data: doc, error: docError } = await supabase
        .from('nurse_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (docError) throw docError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('nurse-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database (this will cascade to shares and logs)
      const { error: dbError } = await supabase
        .from('nurse_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      await fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  return {
    documents,
    loading,
    error,
    uploadDocument,
    downloadDocument,
    shareDocument,
    revokeDocumentAccess,
    getDocumentShares,
    deleteDocument,
    refreshDocuments: fetchDocuments
  };
}