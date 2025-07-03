export interface User {
  id: string;
  email: string;
  userType: 'nurse' | 'hco' | 'admin';
  isApproved?: boolean;
  credentialingStatus?: 'pending' | 'approved' | 'needs_documents';
  createdAt: string;
  lastLogin?: string;
}

export interface NurseProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  dateOfBirth: string;
  ssn: string; // encrypted in real app
  profilePhoto?: string;
  bio: string;
  specialties: string[];
  additionalCertifications?: string; // New field for free text certifications
  licenses: License[];
  education: Education[];
  workHistory: WorkHistory[];
  references: Reference[];
  availability: Availability;
  rates: ServiceRate[];
  travelRadius: number;
  workPreference: 'remote' | 'in-person' | 'both';
  credentialingStatus: 'pending' | 'approved' | 'needs_documents';
  documentsUploaded: DocumentStatus[];
  yearsExperience: number;
  rating: number;
  totalJobs: number;
  createdAt: string;
  updatedAt: string;
}

export interface License {
  id: string;
  state: string;
  licenseNumber: string;
  licenseType: 'RN' | 'LPN' | 'NP' | 'CNS' | 'CRNA' | 'CNM';
  expirationDate: string;
  isActive: boolean;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  graduationDate: string;
  field: string;
}

export interface WorkHistory {
  id: string;
  employer: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrent: boolean;
}

export interface Reference {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  title: string;
}

export interface Availability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface ServiceRate {
  serviceType: string;
  hourlyRate: number;
  isNegotiable: boolean;
}

export interface DocumentStatus {
  documentType: string;
  uploaded: boolean;
  approved: boolean;
  expirationDate?: string;
  notes?: string;
}

export interface HCOProfile {
  id: string;
  userId: string;
  organizationName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  organizationType: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethods: PaymentMethod[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'ach';
  last4: string;
  isDefault: boolean;
}

export interface Job {
  id: string;
  hcoId: string;
  title: string;
  description: string;
  serviceType: string;
  location: {
    city: string;
    state: string;
    isRemote: boolean;
  };
  requirements: {
    certifications: string[];
    additionalCertifications?: string; // New field for free text certifications
    experienceLevel: string;
    specialSkills: string[];
    licenses: string[];
  };
  rateType: 'hco_hourly' | 'hco_flat' | 'nurse_set';
  hourlyRateRange?: {
    min: number;
    max: number;
  };
  flatRate?: number;
  timeline: 'asap' | 'scheduled' | 'recurring';
  scheduledDate?: string;
  duration: string;
  urgencyLevel: 'routine' | 'urgent' | 'stat';
  status: 'open' | 'in_progress' | 'filled' | 'cancelled';
  applicationType: 'open' | 'invite_only';
  applicants: JobApplication[];
  selectedNurseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  nurseId: string;
  proposedRate?: number;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'nurse' | 'hco';
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  jobId: string;
  applicationId: string;
  hcoId: string;
  nurseId: string;
  isActive: boolean;
  lastMessageAt: string;
  createdAt: string;
  // Additional fields from view
  jobTitle?: string;
  nurseName?: string;
  hcoName?: string;
  lastMessage?: string;
  unreadCount?: number;
}
