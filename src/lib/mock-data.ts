import { User, Unit, Contract, Payment, Tower, Sale } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    role: 'buyer'
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    role: 'buyer'
  },
  {
    id: 'dev1',
    name: 'Carlos Rodríguez',
    email: 'carlos@inmobiliaria.com',
    role: 'developer'
  }
];

export const mockUnits: Unit[] = [
  {
    id: '1',
    number: '101',
    floor: 1,
    tower: 'Torre A',
    area: 85,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    price: 2800000,
    image: '/units/unit-101.jpg',
    status: 'sold',
    deliveryDate: new Date('2025-06-15')
  },
  {
    id: '2',
    number: '102',
    floor: 1,
    tower: 'Torre A',
    area: 95,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    price: 3200000,
    image: '/units/unit-102.jpg',
    status: 'sold',
    deliveryDate: new Date('2025-06-15')
  },
  {
    id: '3',
    number: '201',
    floor: 2,
    tower: 'Torre A',
    area: 85,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    price: 2850000,
    image: '/units/unit-201.jpg',
    status: 'available',
    deliveryDate: new Date('2025-07-15')
  },
  {
    id: '4',
    number: '301',
    floor: 3,
    tower: 'Torre B',
    area: 120,
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    price: 4500000,
    image: '/units/unit-301.jpg',
    status: 'available',
    deliveryDate: new Date('2025-08-15')
  }
];

export const mockContracts: Contract[] = [
  {
    id: 'c1',
    unitId: '1',
    buyerId: '1',
    totalAmount: 2800000,
    downPayment: 560000,
    financingAmount: 2240000,
    contractDate: new Date('2024-01-15'),
    deliveryDate: new Date('2025-06-15'),
    status: 'active',
    documentUrl: '/contracts/contract-c1.pdf'
  },
  {
    id: 'c2',
    unitId: '2',
    buyerId: '2',
    totalAmount: 3200000,
    downPayment: 640000,
    financingAmount: 2560000,
    contractDate: new Date('2024-02-20'),
    deliveryDate: new Date('2025-06-15'),
    status: 'active',
    documentUrl: '/contracts/contract-c2.pdf'
  }
];

export const mockPayments: Payment[] = [
  // Pagos para contrato c1
  {
    id: 'p1',
    contractId: 'c1',
    amount: 280000,
    dueDate: new Date('2024-01-15'),
    paidDate: new Date('2024-01-15'),
    status: 'paid',
    paymentMethod: 'bank_transfer',
    reference: 'TRF001'
  },
  {
    id: 'p2',
    contractId: 'c1',
    amount: 280000,
    dueDate: new Date('2024-03-15'),
    paidDate: new Date('2024-03-14'),
    status: 'paid',
    paymentMethod: 'bank_transfer',
    reference: 'TRF002'
  },
  {
    id: 'p3',
    contractId: 'c1',
    amount: 280000,
    dueDate: new Date('2024-05-15'),
    status: 'pending'
  },
  {
    id: 'p4',
    contractId: 'c1',
    amount: 280000,
    dueDate: new Date('2024-07-15'),
    status: 'pending'
  },
  // Pagos para contrato c2
  {
    id: 'p5',
    contractId: 'c2',
    amount: 320000,
    dueDate: new Date('2024-02-20'),
    paidDate: new Date('2024-02-20'),
    status: 'paid',
    paymentMethod: 'bank_transfer',
    reference: 'TRF003'
  },
  {
    id: 'p6',
    contractId: 'c2',
    amount: 320000,
    dueDate: new Date('2024-04-20'),
    paidDate: new Date('2024-04-18'),
    status: 'paid',
    paymentMethod: 'check',
    reference: 'CHK001'
  },
  {
    id: 'p7',
    contractId: 'c2',
    amount: 320000,
    dueDate: new Date('2024-06-20'),
    status: 'pending'
  }
];

export const mockTowers: Tower[] = [
  {
    id: 't1',
    name: 'Torre A',
    totalUnits: 30,
    soldUnits: 15,
    availableUnits: 15,
    units: mockUnits.filter(unit => unit.tower === 'Torre A'),
    deliveryDate: new Date('2025-06-15'),
    image: '/towers/torre-a.jpg'
  },
  {
    id: 't2',
    name: 'Torre B',
    totalUnits: 25,
    soldUnits: 8,
    availableUnits: 17,
    units: mockUnits.filter(unit => unit.tower === 'Torre B'),
    deliveryDate: new Date('2025-08-15'),
    image: '/towers/torre-b.jpg'
  }
];

export const mockSales: Sale[] = [
  {
    id: 's1',
    unitId: '1',
    buyerName: 'Juan Pérez',
    buyerEmail: 'juan.perez@email.com',
    salePrice: 2800000,
    saleDate: new Date('2024-01-15'),
    contractId: 'c1',
    status: 'active'
  },
  {
    id: 's2',
    unitId: '2',
    buyerName: 'María González',
    buyerEmail: 'maria.gonzalez@email.com',
    salePrice: 3200000,
    saleDate: new Date('2024-02-20'),
    contractId: 'c2',
    status: 'active'
  }
];

// Funciones helper para obtener datos relacionados
export const getContractByBuyer = (buyerId: string) => 
  mockContracts.find(contract => contract.buyerId === buyerId);

export const getUnitByContract = (contractId: string) => {
  const contract = mockContracts.find(c => c.id === contractId);
  return contract ? mockUnits.find(unit => unit.id === contract.unitId) : undefined;
};

export const getPaymentsByContract = (contractId: string) =>
  mockPayments.filter(payment => payment.contractId === contractId);

export const getTotalPaidByContract = (contractId: string) =>
  mockPayments
    .filter(payment => payment.contractId === contractId && payment.status === 'paid')
    .reduce((total, payment) => total + payment.amount, 0);

export const getRemainingBalanceByContract = (contractId: string) => {
  const contract = mockContracts.find(c => c.id === contractId);
  if (!contract) return 0;
  const totalPaid = getTotalPaidByContract(contractId);
  return contract.totalAmount - totalPaid;
}; 