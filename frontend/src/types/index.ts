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

// Meeting Types
export interface Meeting {
  id: number;
  patient_id: number;
  doctor_id: number;
  meeting_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  patient?: User;
  doctor?: User;
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

// Prescription Types
export interface Prescription {
  id: number;
  patient_id: number;
  doctor_id: number;
  medication: string;
  dosage: string;
  instructions: string;
  prescribed_date: string;
  doctor?: User;
  patient?: User;
}
