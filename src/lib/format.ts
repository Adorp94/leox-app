import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-MX').format(num);
};

export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy', { locale: es });
};

export const formatDateLong = (date: Date): string => {
  return format(date, 'dd \'de\' MMMM \'de\' yyyy', { locale: es });
};

export const formatDateShort = (date: Date): string => {
  return format(date, 'dd MMM', { locale: es });
};

export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getUnitStatusColor = (status: string): string => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'sold':
      return 'bg-blue-100 text-blue-800';
    case 'reserved':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPaymentStatusText = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'Pagado';
    case 'pending':
      return 'Pendiente';
    case 'overdue':
      return 'Vencido';
    default:
      return status;
  }
};

export const getUnitStatusText = (status: string): string => {
  switch (status) {
    case 'available':
      return 'Disponible';
    case 'sold':
      return 'Vendida';
    case 'reserved':
      return 'Reservada';
    default:
      return status;
  }
};

export const calculateProgress = (paid: number, total: number): number => {
  return Math.round((paid / total) * 100);
}; 