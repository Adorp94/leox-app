export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'developer';
  avatar?: string;
}

export interface Unit {
  id: string;
  number: string;
  floor: number;
  tower: string;
  area: number; // m²
  bedrooms: number;
  bathrooms: number;
  parking: number;
  price: number;
  image: string;
  status: 'available' | 'sold' | 'reserved';
  deliveryDate: Date;
}

export interface Contract {
  id: string;
  unitId: string;
  buyerId: string;
  totalAmount: number;
  downPayment: number;
  financingAmount: number;
  contractDate: Date;
  deliveryDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  documentUrl: string;
}

export interface Payment {
  id: string;
  contractId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod?: 'bank_transfer' | 'cash' | 'check' | 'credit_card';
  reference?: string;
}

export interface PaymentPlan {
  id: string;
  contractId: string;
  payments: Payment[];
  totalPaid: number;
  remainingBalance: number;
}

export interface Tower {
  id: string;
  name: string;
  totalUnits: number;
  soldUnits: number;
  availableUnits: number;
  units: Unit[];
  deliveryDate: Date;
  image: string;
}

export interface Sale {
  id: string;
  unitId: string;
  buyerName: string;
  buyerEmail: string;
  salePrice: number;
  saleDate: Date;
  contractId: string;
  status: 'active' | 'completed';
}

export interface AccountStatement {
  id: string;
  contractId: string;
  buyerId: string;
  generatedDate: Date;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  nextPaymentDue: Date;
  payments: Payment[];
} 