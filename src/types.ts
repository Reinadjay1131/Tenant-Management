export enum PaymentStatus {
  Paid = 'Paid',
  Unpaid = 'Unpaid',
  Late = 'Late',
}

export enum MaintenanceStatus {
  Submitted = 'Submitted',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export enum PaymentFrequency {
  Weekly = 'weekly',
  Monthly = 'monthly',
  Annual = 'annual',
}

export interface Property {
  id: string;
  name: string;
  address: string;
  imageUrl?: string;
}

export interface Tenant {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  apartmentNumber: string;
  leaseStartDate: string;
  leaseEndDate: string;
  rentAmount: number;
  paymentFrequency: PaymentFrequency;
  profilePicture?: string;
}

export interface Payment {
  id:string;
  tenantId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  apartmentNumber: string;
  description: string;
  photo?: string;
  submittedDate: string;
  status: MaintenanceStatus;
}

export interface Announcement {
  id: string;
  propertyId: string;
  title: string;
  content: string;
  date: string;
}

export interface AppContextType {
  // Global, unfiltered data
  allTenants: Tenant[];

  // Property-specific data
  tenants: Tenant[];
  payments: Payment[];
  requests: MaintenanceRequest[];
  announcements: Announcement[];
  
  // Property management
  properties: Property[];
  currentProperty: Property | null;
  addProperty: (property: Omit<Property, 'id'>) => void;
  setCurrentProperty: (property: Property | null) => void;

  // Tenant management
  addTenant: (tenant: Omit<Tenant, 'id' | 'propertyId'>) => void;
  updateTenant: (id: string, data: Partial<Omit<Tenant, 'id'>>) => void;

  // Other actions
  addRequest: (request: Omit<MaintenanceRequest, 'id'|'submittedDate'|'status'|'apartmentNumber'>) => void;
  updateRequestStatus: (id: string, status: MaintenanceStatus) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id'|'date'|'propertyId'>) => void;
  markPaymentAsPaid: (paymentId: string) => void;
  // FIX: Add currentTenant and setCurrentTenant for the tenant portal
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
}