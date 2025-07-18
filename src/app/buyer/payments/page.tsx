'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, 
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  formatCurrency, 
  formatDate, 
  getPaymentStatusColor, 
  getPaymentStatusText,
  calculateProgress
} from '@/lib/format';
import { 
  mockUsers, 
  getContractByBuyer, 
  getPaymentsByContract, 
  getTotalPaidByContract,
  getRemainingBalanceByContract
} from '@/lib/mock-data';

export default function BuyerPaymentsPage() {
  // Simular usuario comprador (en producción vendría de autenticación)
  const user = mockUsers[0]; // Juan Pérez
  const contract = getContractByBuyer(user.id);
  const payments = contract ? getPaymentsByContract(contract.id) : [];
  const totalPaid = contract ? getTotalPaidByContract(contract.id) : 0;
  const remainingBalance = contract ? getRemainingBalanceByContract(contract.id) : 0;
  const progress = contract ? calculateProgress(totalPaid, contract.totalAmount) : 0;

  if (!contract) {
    return (
      <AppLayout user={user}>
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No se encontró información de pagos</h2>
          <p className="text-gray-600">No tienes un contrato activo en este momento.</p>
        </div>
      </AppLayout>
    );
  }

  const paidPayments = payments.filter(p => p.status === 'paid');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const nextPayment = pendingPayments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estado de Pagos</h1>
          <p className="text-gray-600">Seguimiento de tu plan de pagos y historial</p>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total del Contrato</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(contract.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">Valor total de la unidad</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground">
                {paidPayments.length} pagos realizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(remainingBalance)}</div>
              <p className="text-xs text-muted-foreground">
                {pendingPayments.length} pagos pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso</CardTitle>
              <span className="text-2xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress}%</div>
              <Progress value={progress} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Next Payment */}
        {nextPayment && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <Calendar className="h-5 w-5" />
                <span>Próximo Pago</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatCurrency(nextPayment.amount)}
                  </p>
                  <p className="text-orange-700">
                    Vence el {formatDate(nextPayment.dueDate)}
                  </p>
                </div>
                <Badge className="bg-orange-100 text-orange-800">
                  {getPaymentStatusText(nextPayment.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Historial de Pagos</span>
            </CardTitle>
            <CardDescription>
              Todos los pagos programados y realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha de Vencimiento</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Pago</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Referencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments
                  .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                  .map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {formatDate(payment.dueDate)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(payment.status)}>
                          {getPaymentStatusText(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.paidDate ? formatDate(payment.paidDate) : '-'}
                      </TableCell>
                      <TableCell>
                        {payment.paymentMethod ? (
                          payment.paymentMethod === 'bank_transfer' ? 'Transferencia' :
                          payment.paymentMethod === 'cash' ? 'Efectivo' :
                          payment.paymentMethod === 'check' ? 'Cheque' :
                          payment.paymentMethod === 'credit_card' ? 'Tarjeta' :
                          payment.paymentMethod
                        ) : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.reference || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment Plan Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Plan de Pagos</CardTitle>
            <CardDescription>
              Distribución de pagos de tu contrato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Enganche</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(contract.downPayment)}</p>
                <p className="text-sm text-gray-600">Inicial</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Financiamiento</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(contract.financingAmount)}</p>
                <p className="text-sm text-gray-600">En mensualidades</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Total de Pagos</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                <p className="text-sm text-gray-600">Programados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 