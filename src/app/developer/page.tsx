'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp,
  Home,
  DollarSign,
  Calendar,
  AlertCircle,
  Filter
} from 'lucide-react';
import { 
  formatCurrency, 
  formatNumber, 
  formatDate,
  calculateProgress
} from '@/lib/format';
import { 
  desarrolladorService,
  proyectosService,
  inventarioService,
  ventasService,
  DesarrolladorRecord,
  ProyectoRecord,
  InventarioRecord,
  VentaRecord,
  PagoRecord
} from '@/lib/supabase';
import { 
  mockUsers
} from '@/lib/mock-data';

export default function DeveloperDashboardPage() {
  // Simular usuario desarrollador (en producción vendría de autenticación)
  const user = mockUsers[2]; // Carlos Rodríguez

  // State for developers, projects, and data
  const [desarrolladores, setDesarrolladores] = useState<DesarrolladorRecord[]>([]);
  const [selectedDesarrollador, setSelectedDesarrollador] = useState<number | null>(null);
  const [proyectos, setProyectos] = useState<ProyectoRecord[]>([]);
  const [inventario, setInventario] = useState<InventarioRecord[]>([]);
  const [ventas, setVentas] = useState<VentaRecord[]>([]);
  const [pagos, setPagos] = useState<PagoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadDesarrolladores();
  }, []);

  // Load data when developer is selected
  useEffect(() => {
    if (selectedDesarrollador) {
      loadDeveloperData(selectedDesarrollador);
    } else {
      // Clear data when no developer selected
      setProyectos([]);
      setInventario([]);
      setVentas([]);
      setPagos([]);
      setLoading(false);
    }
  }, [selectedDesarrollador]);

  const loadDesarrolladores = async () => {
    try {
      const data = await desarrolladorService.getDesarrolladores();
      setDesarrolladores(data);
      // Auto-select first developer if available
      if (data.length > 0) {
        setSelectedDesarrollador(data[0].id_desarrollador);
      }
    } catch (error) {
      console.error('Error loading desarrolladores:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeveloperData = async (desarrolladorId: number) => {
    setLoading(true);
    try {
      const [proyectosData, inventarioData, ventasData, pagosData] = await Promise.all([
        proyectosService.getProyectosByDesarrollador(desarrolladorId),
        inventarioService.getInventarioByDesarrollador(desarrolladorId),
        ventasService.getVentasContratosByDesarrollador(desarrolladorId),
        ventasService.getPagosByDesarrollador(desarrolladorId)
      ]);
      
      setProyectos(proyectosData);
      setInventario(inventarioData);
      setVentas(ventasData);
      setPagos(pagosData);
    } catch (error) {
      console.error('Error loading developer data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics based on loaded data
  const totalUnits = inventario.length;
  const soldUnits = inventario.filter(unit => unit.estatus === 'Vendida').length;
  const availableUnits = inventario.filter(unit => unit.estatus === 'Disponible').length;

  const totalSalesValue = ventas.reduce((sum, venta) => sum + (venta.precio_venta || 0), 0);
  const totalPaid = pagos
    .filter(pago => pago.estatus_pago === 'Pagado')
    .reduce((sum, pago) => sum + (pago.monto || 0), 0);
  const totalPending = pagos
    .filter(pago => pago.estatus_pago === 'Pendiente')
    .reduce((sum, pago) => sum + (pago.monto || 0), 0);

  const pendingPayments = pagos.filter(pago => pago.estatus_pago === 'Pendiente');
  const overduePayments = pendingPayments.filter(pago => 
    pago.fecha_vencimiento && new Date(pago.fecha_vencimiento) < new Date()
  );

  // Recent sales (últimas ventas)
  const recentSales = ventas
    .sort((a, b) => new Date(b.fecha_venta).getTime() - new Date(a.fecha_venta).getTime())
    .slice(0, 5);

  // Upcoming payments (próximos vencimientos)
  const upcomingPayments = pendingPayments
    .filter(pago => pago.fecha_vencimiento)
    .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime())
    .slice(0, 5);

  const selectedDesarrolladorData = desarrolladores.find(
    d => d.id_desarrollador === selectedDesarrollador
  );


  if (loading && desarrolladores.length === 0) {
    return (
      <AppLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando desarrolladores...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header with Developer Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              {selectedDesarrolladorData 
                ? `Resumen del desarrollador: ${selectedDesarrolladorData.nombre}`
                : 'Selecciona un desarrollador para ver datos'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedDesarrollador?.toString() || ''}
              onValueChange={(value) => setSelectedDesarrollador(value ? parseInt(value) : null)}
            >
              <SelectTrigger className="w-64 bg-white border-gray-300">
                <SelectValue placeholder="Seleccionar desarrollador" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                {desarrolladores.map((desarrollador) => (
                  <SelectItem
                    key={desarrollador.id_desarrollador}
                    value={desarrollador.id_desarrollador.toString()}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    {desarrollador.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!selectedDesarrollador ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Selecciona un Desarrollador
                </h3>
                <p className="text-muted-foreground">
                  Elige un desarrollador del menú desplegable para ver sus proyectos, inventario y métricas.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando datos del desarrollador...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
        <>
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
              <Home className="h-4 w-4" style={{color: '#10b981'}} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{color: '#10b981'}}>{formatNumber(soldUnits)}/{formatNumber(totalUnits)}</div>
              <p className="text-xs text-muted-foreground">
                del inventario total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor de Ventas</CardTitle>
              <DollarSign className="h-4 w-4" style={{color: '#3b82f6'}} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{color: '#3b82f6'}}>{formatCurrency(totalSalesValue)}</div>
              <p className="text-xs text-muted-foreground">
                Ventas totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobranza</CardTitle>
              <TrendingUp className="h-4 w-4" style={{color: '#8b5cf6'}} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{color: '#8b5cf6'}}>
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
                  <span className="text-sm" style={{color: '#64748b'}}>Total Cobrado</span>
                  <span className="font-semibold" style={{color: '#10b981'}}>{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{color: '#64748b'}}>Pendiente de Cobro</span>
                  <span className="font-semibold" style={{color: '#f59e0b'}}>{formatCurrency(totalPending)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{color: '#64748b'}}>Pagos Vencidos</span>
                  <span className="font-semibold" style={{color: '#ef4444'}}>{overduePayments.length}</span>
                </div>
              </div>
              {overduePayments.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-danger" />
                    <span className="text-sm font-medium text-danger">
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
                {recentSales.length > 0 ? recentSales.map((venta, index) => (
                  <div key={venta.id_venta || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        {venta.clientes?.nombre_cliente || `Cliente ID: ${venta.id_cliente}`}
                      </p>
                      <p className="text-sm text-soft">
                        Unidad {venta.inventario?.num_unidad || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(venta.precio_venta || 0)}</p>
                      <p className="text-xs text-softer">{formatDate(new Date(venta.fecha_venta))}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-softer">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay ventas recientes</p>
                  </div>
                )}
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
                {upcomingPayments.length > 0 ? upcomingPayments.map((pago, index) => {
                  const isOverdue = pago.fecha_vencimiento && new Date(pago.fecha_vencimiento) < new Date();
                  
                  return (
                    <div key={pago.id_pago || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">
                          Unidad {pago.ventas_contratos?.inventario?.num_unidad || 'N/A'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-soft">
                            {pago.fecha_vencimiento ? formatDate(new Date(pago.fecha_vencimiento)) : 'Sin fecha'}
                          </p>
                          {isOverdue && (
                            <Badge className="bg-red-100 text-danger text-xs">Vencido</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(pago.monto || 0)}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-softer">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay pagos próximos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Resumen por Proyecto</span>
            </CardTitle>
            <CardDescription>
              Estado de ventas y cobranza por cada proyecto del desarrollador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {proyectos.length > 0 ? proyectos.map((proyecto) => {
                // Calculate metrics for each project
                const projectUnits = inventario.filter(unit => unit.id_proyecto === proyecto.id_proyecto);
                const projectSoldUnits = projectUnits.filter(unit => unit.estatus === 'Vendida');
                
                // Get sales for this project
                const projectSales = ventas.filter(venta => 
                  venta.inventario?.id_proyecto === proyecto.id_proyecto
                );
                const projectSoldValue = projectSales.reduce((sum, venta) => sum + (venta.precio_venta || 0), 0);
                
                // Get payments for this project
                const projectPayments = pagos.filter(pago => 
                  pago.ventas_contratos?.inventario?.id_proyecto === proyecto.id_proyecto
                );
                const projectCollected = projectPayments
                  .filter(pago => pago.estatus_pago === 'Pagado')
                  .reduce((sum, pago) => sum + (pago.monto || 0), 0);
                const projectPending = projectPayments
                  .filter(pago => pago.estatus_pago === 'Pendiente')
                  .reduce((sum, pago) => sum + (pago.monto || 0), 0);
                
                const salesProgress = projectUnits.length > 0 
                  ? (projectSoldUnits.length / projectUnits.length) * 100 
                  : 0;
                
                return (
                  <div key={proyecto.id_proyecto} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{proyecto.nombre}</h3>
                        <p className="text-sm text-soft">
                          {projectUnits.length} unidades totales
                        </p>
                      </div>
                      <Badge variant="outline">
                        {projectSoldUnits.length}/{projectUnits.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-soft">Vendido ($)</span>
                          <span className="font-semibold text-info">{formatCurrency(projectSoldValue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-soft">Cobrado ($)</span>
                          <span className="font-semibold text-success">{formatCurrency(projectCollected)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-soft">Cuentas por cobrar ($)</span>
                          <span className="font-semibold text-warning">{formatCurrency(projectPending)}</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso de ventas</span>
                          <span>{Math.round(salesProgress)}%</span>
                        </div>
                        <Progress 
                          value={salesProgress} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-2 text-center py-8 text-softer">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay proyectos para este desarrollador</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </>
        )}
      </div>
    </AppLayout>
  );
} 