// User and Authentication Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  DoctorDetail?: DoctorDetail;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorDetail {
  id: number;
  specialization: string;
  licenseNumber: string;
  experience: number;
  contactNumber: string;
  address: string;
  userId: number;
  gender?: string;
  languages?: string;
  approved?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

// Chat Types
export interface ChatMessage {
  id: number;
  message: string;
  sender_id: number;
  receiver_id: number;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatUser {
  id: number;
  name: string;
  role: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  contactNumber?: string;
  address?: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Warning Types
export interface Warning {
  id: number;
  reporterId: number;
  reporterType: 'patient' | 'doctor';
  reportedUserId: number;
  reportedUserType: 'patient' | 'doctor';
  category: 'inappropriate_behavior' | 'harassment' | 'unprofessional_conduct' | 'spam' | 'other';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  adminNotes?: string;
  adminId?: number;
  createdAt: string;
  updatedAt: string;
  Reporter?: User;
  ReportedUser?: User;
  Admin?: User;
}
