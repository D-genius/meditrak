export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  insurance_info?: string;
  medical_history?: string;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  patient?: Patient;
  visit_date: string;
  visit_type: 'OPD' | 'IPD' | 'Emergency';
  diagnosis: string;
  prescription: Medication[];
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalVisits: number;
  opdVisits: number;
  ipdVisits: number;
  visitsPerWeek: { week: string; count: number }[];
  commonDiagnoses: { diagnosis: string; count: number }[];
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  specialization?: string;
  license_number?: string;
  phone?: string;
}