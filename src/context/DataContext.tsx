import React, { createContext, useContext, useState } from 'react';
import { NurseProfile, HCOProfile, Job, JobApplication, Conversation, Message } from '../types';

interface DataContextType {
  nurseProfiles: NurseProfile[];
  hcoProfiles: HCOProfile[];
  jobs: Job[];
  applications: JobApplication[];
  conversations: Conversation[];
  messages: Message[];
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => void;
  applyToJob: (application: Omit<JobApplication, 'id' | 'appliedAt'>) => void;
  updateApplicationStatus: (applicationId: string, status: 'pending' | 'accepted' | 'rejected') => void;
  createConversation: (jobId: string, applicationId: string, hcoId: string, nurseId: string) => string;
  sendMessage: (conversationId: string, senderId: string, senderType: 'nurse' | 'hco', content: string) => void;
  markMessagesAsRead: (conversationId: string, userId: string) => void;
  approveNurse: (nurseId: string) => void;
  updateNurseProfile: (profile: Partial<NurseProfile>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Mock data
const mockNurseProfiles: NurseProfile[] = [
  {
    id: 'nurse1',
    userId: 'user1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    address: {
      street: '123 Main St',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101'
    },
    dateOfBirth: '1985-03-15',
    ssn: '***-**-1234',
    bio: 'Experienced ICU nurse with 8+ years in critical care, specializing in cardiac patients and advanced life support.',
    specialties: ['Critical Care', 'Cardiac Care', 'ACLS', 'Wound Care'],
    additionalCertifications: 'CRRT Certification, ECMO Specialist, Pediatric Advanced Life Support (PALS), Trauma Nursing Core Course (TNCC)',
    licenses: [
      {
        id: 'lic1',
        state: 'WA',
        licenseNumber: 'RN123456',
        licenseType: 'RN',
        expirationDate: '2025-12-31',
        isActive: true
      }
    ],
    education: [
      {
        id: 'edu1',
        degree: 'BSN',
        school: 'University of Washington',
        graduationDate: '2016-05',
        field: 'Nursing'
      }
    ],
    workHistory: [
      {
        id: 'work1',
        employer: 'Seattle Medical Center',
        position: 'ICU Staff Nurse',
        startDate: '2018-01',
        description: 'Critical care nursing in 32-bed ICU',
        isCurrent: true
      }
    ],
    references: [
      {
        id: 'ref1',
        name: 'Dr. Michael Chen',
        email: 'mchen@seattlemedical.com',
        phone: '(555) 987-6543',
        relationship: 'Direct Supervisor',
        title: 'ICU Medical Director'
      }
    ],
    availability: {
      monday: [{ start: '07:00', end: '19:00' }],
      tuesday: [{ start: '07:00', end: '19:00' }],
      wednesday: [{ start: '07:00', end: '19:00' }],
      thursday: [{ start: '07:00', end: '19:00' }],
      friday: [{ start: '07:00', end: '19:00' }],
      saturday: [],
      sunday: []
    },
    rates: [
      { serviceType: 'Critical Care', hourlyRate: 65, isNegotiable: true },
      { serviceType: 'Wound Care', hourlyRate: 55, isNegotiable: false }
    ],
    travelRadius: 25,
    workPreference: 'both',
    credentialingStatus: 'approved',
    documentsUploaded: [
      { documentType: 'License', uploaded: true, approved: true },
      { documentType: 'Malpractice Insurance', uploaded: true, approved: true },
      { documentType: 'Background Check', uploaded: true, approved: true }
    ],
    yearsExperience: 8,
    rating: 4.9,
    totalJobs: 147,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z'
  }
];

const mockJobs: Job[] = [
  {
    id: 'job1',
    hcoId: 'hco1',
    title: 'Home Infusion Therapy - IVIG Administration',
    description: 'Seeking experienced nurse for home IVIG infusion therapy. Patient requires weekly treatments, excellent IV skills essential.',
    serviceType: 'Home Infusions',
    location: {
      city: 'Bellevue',
      state: 'WA',
      isRemote: false
    },
    requirements: {
      certifications: ['IV Therapy Certification'],
      additionalCertifications: 'PICC Line Certification preferred, experience with immunoglobulin infusions',
      experienceLevel: 'Intermediate (3-5 years)',
      specialSkills: ['IV Insertion', 'Infusion Monitoring'],
      licenses: ['RN']
    },
    rateType: 'hco_hourly',
    hourlyRateRange: { min: 50, max: 65 },
    timeline: 'recurring',
    duration: '4-6 hours per session',
    urgencyLevel: 'routine',
    status: 'open',
    applicationType: 'open',
    applicants: [],
    createdAt: '2024-03-15T09:00:00Z',
    updatedAt: '2024-03-15T09:00:00Z'
  },
  {
    id: 'job2',
    hcoId: 'hco2',
    title: 'Post-Surgical Wound Care Assessment',
    description: 'Need experienced wound care nurse for post-surgical patient assessment and dressing changes.',
    serviceType: 'Wound Care',
    location: {
      city: 'Tacoma',
      state: 'WA',
      isRemote: false
    },
    requirements: {
      certifications: ['Wound Care Certification'],
      additionalCertifications: 'TNCC (Trauma Nursing Core Course), experience with complex wound management',
      experienceLevel: 'Experienced (6-10 years)',
      specialSkills: ['Wound Assessment', 'Dressing Changes'],
      licenses: ['RN']
    },
    rateType: 'hco_flat',
    flatRate: 350,
    timeline: 'asap',
    duration: 'Single visit, 2-3 hours',
    urgencyLevel: 'urgent',
    status: 'open',
    applicationType: 'open',
    applicants: [],
    createdAt: '2024-03-16T14:00:00Z',
    updatedAt: '2024-03-16T14:00:00Z'
  }
];

const mockApplications: JobApplication[] = [
  {
    id: 'app1',
    jobId: 'job1',
    nurseId: 'nurse1',
    proposedRate: 60,
    coverLetter: 'I am very interested in this IVIG administration position. I have 8 years of experience in critical care and extensive experience with IV therapy and infusion monitoring.',
    status: 'pending',
    appliedAt: '2024-03-16T10:30:00Z'
  },
  {
    id: 'app2',
    jobId: 'job2',
    nurseId: 'nurse1',
    coverLetter: 'I would like to apply for the wound care position. I have specialized training in wound assessment and complex wound management.',
    status: 'pending',
    appliedAt: '2024-03-16T15:45:00Z'
  }
];

const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    jobId: 'job1',
    applicationId: 'app1',
    hcoId: 'hco1',
    nurseId: 'nurse1',
    isActive: true,
    lastMessageAt: '2024-03-16T16:30:00Z',
    createdAt: '2024-03-16T16:00:00Z',
    jobTitle: 'Home Infusion Therapy - IVIG Administration',
    nurseName: 'Sarah Johnson',
    hcoName: 'Seattle Specialty Pharmacy',
    lastMessage: 'Thank you for your application. I would like to discuss the position further.',
    unreadCount: 1
  }
];

const mockMessages: Message[] = [
  {
    id: 'msg1',
    conversationId: 'conv1',
    senderId: 'hco1',
    senderType: 'hco',
    content: 'Thank you for your application. I would like to discuss the position further.',
    isRead: false,
    createdAt: '2024-03-16T16:30:00Z'
  }
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [nurseProfiles, setNurseProfiles] = useState(mockNurseProfiles);
  const [hcoProfiles, setHcoProfiles] = useState<HCOProfile[]>([]);
  const [jobs, setJobs] = useState(mockJobs);
  const [applications, setApplications] = useState<JobApplication[]>(mockApplications);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const addJob = (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newJob: Job = {
      ...jobData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const applyToJob = (applicationData: Omit<JobApplication, 'id' | 'appliedAt'>) => {
    const newApplication: JobApplication = {
      ...applicationData,
      id: Math.random().toString(36).substr(2, 9),
      appliedAt: new Date().toISOString(),
    };
    setApplications(prev => [newApplication, ...prev]);
    
    // Update job with new applicant
    setJobs(prev => prev.map(job => 
      job.id === applicationData.jobId 
        ? { ...job, applicants: [...job.applicants, newApplication] }
        : job
    ));
  };

  const updateApplicationStatus = (applicationId: string, status: 'pending' | 'accepted' | 'rejected') => {
    setApplications(prev => prev.map(app =>
      app.id === applicationId
        ? { ...app, status }
        : app
    ));
    
    // Also update the application in the job's applicants array
    setJobs(prev => prev.map(job => ({
      ...job,
      applicants: job.applicants.map(app =>
        app.id === applicationId
          ? { ...app, status }
          : app
      )
    })));
  };

  const createConversation = (jobId: string, applicationId: string, hcoId: string, nurseId: string): string => {
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.jobId === jobId && conv.applicationId === applicationId
    );
    
    if (existingConversation) {
      return existingConversation.id;
    }

    const newConversation: Conversation = {
      id: Math.random().toString(36).substr(2, 9),
      jobId,
      applicationId,
      hcoId,
      nurseId,
      isActive: true,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setConversations(prev => [newConversation, ...prev]);
    return newConversation.id;
  };

  const sendMessage = (conversationId: string, senderId: string, senderType: 'nurse' | 'hco', content: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      conversationId,
      senderId,
      senderType,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [newMessage, ...prev]);

    // Update conversation's last message time
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, lastMessageAt: new Date().toISOString() }
        : conv
    ));
  };

  const markMessagesAsRead = (conversationId: string, userId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.conversationId === conversationId && msg.senderId !== userId
        ? { ...msg, isRead: true }
        : msg
    ));
  };

  const approveNurse = (nurseId: string) => {
    setNurseProfiles(prev => prev.map(nurse =>
      nurse.id === nurseId
        ? { ...nurse, credentialingStatus: 'approved' as const }
        : nurse
    ));
  };

  const updateNurseProfile = (profileData: Partial<NurseProfile>) => {
    setNurseProfiles(prev => prev.map(nurse =>
      nurse.id === profileData.id
        ? { ...nurse, ...profileData, updatedAt: new Date().toISOString() }
        : nurse
    ));
  };

  return (
    <DataContext.Provider value={{
      nurseProfiles,
      hcoProfiles,
      jobs,
      applications,
      conversations,
      messages,
      addJob,
      applyToJob,
      updateApplicationStatus,
      createConversation,
      sendMessage,
      markMessagesAsRead,
      approveNurse,
      updateNurseProfile,
    }}>
      {children}
    </DataContext.Provider>
  );
}