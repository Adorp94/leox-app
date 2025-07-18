'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp,
  Home,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  formatCurrency, 
  formatNumber, 
  formatDate,
  calculateProgress
} from '@/lib/format';
import { 
  mockUsers, 
  mockSales, 
  mockTowers, 
  mockUnits,
  mockPayments,
  mockContracts
} from '@/lib/mock-data';

export default function DeveloperDashboardPage() {
  // Simular usuario desarrollador (en producción vendría de autenticación)
  const user = mockUsers[2]; // Carlos Rodríguez

  // Calcular métricas
  const totalUnits = mockUnits.length;
  const soldUnits = mockUnits.filter(unit => unit.status === 'sold').length;
  const availableUnits = mockUnits.filter(unit => unit.status === 'available').length;

  const totalSalesValue = mockSales.reduce((sum, sale) => sum + sale.salePrice, 0);
  const totalPaid = mockPayments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = mockPayments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingPayments = mockPayments.filter(payment => payment.status === 'pending');
  const overduePayments = pendingPayments.filter(payment => 
    new Date(payment.dueDate) < new Date()
  );

  // Últimas ventas
  const recentSales = mockSales
    .sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime())
    .slice(0, 5);

  // Próximos vencimientos
  const upcomingPayments = pendingPayments
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen general del proyecto</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Unidades</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalUnits)}</div>
              <p className="text-xs text-muted-foreground">
                {availableUnits} disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unidades Vendidas</CardTitle>
              <Home className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatNumber(soldUnits)}/{formatNumber(totalUnits)}</div>
              <p className="text-xs text-muted-foreground">
                del inventario total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor de Ventas</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSalesValue)}</div>
              <p className="text-xs text-muted-foreground">
                Ventas totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobranza</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground">
                {calculateProgress(totalPaid, totalPaid + totalPending)}% cobrado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Status */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Estado de Cobranza</span>
              </CardTitle>
              <CardDescription>
                Resumen de pagos y cobranza
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Cobrado</span>
                  <span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pendiente de Cobro</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(totalPending)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pagos Vencidos</span>
                  <span className="font-semibold text-red-600">{overduePayments.length}</span>
                </div>
              </div>
              {overduePayments.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      {overduePayments.length} pagos vencidos requieren atención
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Ventas Recientes</span>
              </CardTitle>
              <CardDescription>
                Últimas unidades vendidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSales.map((sale) => {
                  const unit = mockUnits.find(u => u.id === sale.unitId);
                  return (
                    <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{sale.buyerName}</p>
                        <p className="text-sm text-gray-600">
                          Unidad {unit?.number} - {unit?.tower}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(sale.salePrice)}</p>
                        <p className="text-xs text-gray-500">{formatDate(sale.saleDate)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Próximos Vencimientos</span>
              </CardTitle>
              <CardDescription>
                Pagos programados para los próximos días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPayments.map((payment) => {
                  const contract = mockContracts.find(c => c.id === payment.contractId);
                  const unit = contract ? mockUnits.find(u => u.id === contract.unitId) : null;
                  const isOverdue = new Date(payment.dueDate) < new Date();
                  
                  return (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          Unidad {unit?.number} - {unit?.tower}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-600">{formatDate(payment.dueDate)}</p>
                          {isOverdue && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Vencido</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Towers Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Resumen por Fase</span>
            </CardTitle>
            <CardDescription>
              Estado de ventas y cobranza por cada fase del proyecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockTowers.map((tower) => {
                // Calculate financial metrics for each tower
                const towerUnits = tower.units.filter(unit => unit.status === 'sold');
                const towerSoldValue = towerUnits.reduce((sum, unit) => sum + unit.price, 0);
                
                // Get contracts for this tower's sold units
                const towerContracts = mockContracts.filter(contract => 
                  towerUnits.some(unit => unit.id === contract.unitId)
                );
                
                // Calculate collected amount for this tower
                const towerCollected = mockPayments
                  .filter(payment => 
                    payment.status === 'paid' && 
                    towerContracts.some(contract => contract.id === payment.contractId)
                  )
                  .reduce((sum, payment) => sum + payment.amount, 0);
                
                // Calculate pending amount for this tower
                const towerPending = mockPayments
                  .filter(payment => 
                    payment.status === 'pending' && 
                    towerContracts.some(contract => contract.id === payment.contractId)
                  )
                  .reduce((sum, payment) => sum + payment.amount, 0);
                
                return (
                  <div key={tower.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{tower.name}</h3>
                        <p className="text-sm text-gray-600">
                          Entrega: {formatDate(tower.deliveryDate)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {tower.soldUnits}/{tower.totalUnits}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Vendido ($)</span>
                          <span className="font-semibold text-blue-600">{formatCurrency(towerSoldValue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cobrado ($)</span>
                          <span className="font-semibold text-green-600">{formatCurrency(towerCollected)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cuentas por cobrar ($)</span>
                          <span className="font-semibold text-orange-600">{formatCurrency(towerPending)}</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso de ventas</span>
                          <span>{Math.round((tower.soldUnits / tower.totalUnits) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(tower.soldUnits / tower.totalUnits) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 