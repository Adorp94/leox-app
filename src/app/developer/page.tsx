'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Filter,
  MousePointer,
  Activity,
  ArrowUpRight,
  MoreHorizontal,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  formatCurrency, 
  formatNumber, 
  formatDate,
  calculateProgress
} from '@/lib/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  desarrolladorService,
  proyectosService,
  inventarioService,
  ventasService,
  DesarrolladorRecord,
  ProyectoRecord,
  InventarioRecord,
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
  const [selectedProyecto, setSelectedProyecto] = useState<number | null>(null);
  const [proyectos, setProyectos] = useState<ProyectoRecord[]>([]);
  const [inventario, setInventario] = useState<InventarioRecord[]>([]);
  const [ventas, setVentas] = useState<unknown[]>([]);
  const [pagos, setPagos] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalSalesValue: 0,
    totalPaid: 0,
    totalPending: 0
  });
  const [proyectosSummary, setProyectosSummary] = useState<any[]>([]);
  const [chartMode, setChartMode] = useState<'ventas' | 'cobranza'>('ventas');
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([]);

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
      setProyectosSummary([]);
      setSelectedProyecto(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDesarrollador]);

  // Load data when project is selected
  useEffect(() => {
    if (selectedDesarrollador && selectedProyecto) {
      loadProjectData(selectedDesarrollador, selectedProyecto);
      // Always try to load monthly chart data regardless of other data
      loadMonthlyChartData(selectedProyecto);
    } else if (selectedDesarrollador && selectedProyecto === null) {
      loadDeveloperData(selectedDesarrollador);
      // Clear monthly data when no project selected
      setMonthlyChartData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProyecto, selectedDesarrollador]);

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
      const [proyectosData, inventarioData] = await Promise.all([
        proyectosService.getProyectosByDesarrollador(desarrolladorId),
        inventarioService.getInventarioByDesarrollador(desarrolladorId)
      ]);
      
      setProyectos(proyectosData);
      setInventario(inventarioData);
      
      // Load corrected metrics and summary data
      await loadCorrectedMetrics(desarrolladorId);
      
    } catch (error) {
      console.error('Error loading developer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectData = async (desarrolladorId: number, proyectoId: number) => {
    setLoading(true);
    try {
      const { dashboardData, ventasData, pagosData } = await desarrolladorService.getDeveloperDataByProject(desarrolladorId, proyectoId);
      
      setVentas(ventasData || []);
      setPagos(pagosData || []);
      
      // Update metrics for selected project using dashboard data
      const projectMetrics = dashboardData?.[0];
      if (projectMetrics) {
        console.log('Debug - project metrics:', projectMetrics);
        setDashboardMetrics({
          totalSalesValue: Number(projectMetrics.total_vendido) || 0,
          totalPaid: Number(projectMetrics.total_cobrado) || 0,
          totalPending: Number(projectMetrics.cuentas_por_cobrar) || 0
        });
      }
      
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCorrectedMetrics = async (desarrolladorId: number) => {
    try {
      const [totalCobranza, proyectosSummaryData, ventasData, pagosData] = await Promise.all([
        desarrolladorService.getTotalCobranza(desarrolladorId),
        desarrolladorService.getProyectosSummary(desarrolladorId),
        ventasService.getVentasContratosByDesarrollador(desarrolladorId),
        ventasService.getPagosByDesarrollador(desarrolladorId)
      ]);
      
      // Calculate total ventas from proyectosSummary (this works!)
      const totalVentas = proyectosSummaryData?.reduce((sum, proyecto) => {
        return sum + (Number(proyecto.total_vendido) || 0);
      }, 0) || 0;
      
      console.log('Debug - calculated totalVentas from summary:', totalVentas);
      console.log('Debug - totalCobranza:', totalCobranza);
      
      setDashboardMetrics({
        totalSalesValue: totalVentas,
        totalPaid: totalCobranza || 0,
        totalPending: 0
      });
      
      setProyectosSummary(proyectosSummaryData || []);
      setVentas(ventasData || []);
      setPagos(pagosData || []);
      
    } catch (error) {
      console.error('Error loading corrected metrics:', error);
    }
  };

  const loadMonthlyChartData = async (proyectoId: number) => {
    try {
      console.log('Loading monthly chart data for project:', proyectoId);
      const data = await desarrolladorService.getMonthlyChartData(proyectoId);
      console.log('Monthly chart data loaded:', data);
      setMonthlyChartData(data);
    } catch (error) {
      console.error('Error loading monthly chart data:', error);
      setMonthlyChartData([]);
    }
  };

  // Calculate metrics based on loaded data
  const totalUnits = selectedProyecto 
    ? inventario.filter(unit => unit.id_proyecto === selectedProyecto).length
    : inventario.length;
  const soldUnits = selectedProyecto 
    ? inventario.filter(unit => unit.id_proyecto === selectedProyecto && unit.estatus === 'Vendida').length
    : inventario.filter(unit => unit.estatus === 'Vendida').length;
  const availableUnits = selectedProyecto 
    ? inventario.filter(unit => unit.id_proyecto === selectedProyecto && unit.estatus === 'Disponible').length
    : inventario.filter(unit => unit.estatus === 'Disponible').length;

  // Use corrected metrics from state
  const { totalSalesValue, totalPaid, totalPending } = dashboardMetrics;

  const pendingPayments = pagos.filter((pago: any) => pago.estatus_pago === 'Pendiente');
  const paidPayments = pagos.filter((pago: any) => pago.estatus_pago === 'Pagado');
  
  // Calculate different types of pending payments based on due dates
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  
  // Categorize payments based on due dates
  const futurePayments = pendingPayments.filter((pago: any) => {
    if (!pago.fecha_vencimiento) return false; // No due date = treat separately
    const dueDate = new Date(pago.fecha_vencimiento);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= today;
  });
  
  const overduePayments = pendingPayments.filter((pago: any) => {
    if (!pago.fecha_vencimiento) return false; // No due date = treat separately
    const dueDate = new Date(pago.fecha_vencimiento);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });
  
  // Payments without due dates (current obligations)
  const currentPayments = pendingPayments.filter((pago: any) => !pago.fecha_vencimiento);
  
  // Calculate amounts
  // Pendiente de Cobro: Future payments + current obligations (no due date)
  const totalPendingAmount = [...futurePayments, ...currentPayments].reduce((sum: number, pago: any) => 
    sum + (Number(pago.monto) || 0), 0
  );
  // Pagos Pendientes: Only overdue payments
  const totalOverdueAmount = overduePayments.reduce((sum: number, pago: any) => 
    sum + (Number(pago.monto) || 0), 0
  );
  const totalCurrentAmount = currentPayments.reduce((sum: number, pago: any) => 
    sum + (Number(pago.monto) || 0), 0
  );
  const totalPaidAmount = paidPayments.reduce((sum: number, pago: any) => 
    sum + (Number(pago.monto) || 0), 0
  );

  // Recent sales (últimas ventas)
  const recentSales = ventas
    .sort((a: any, b: any) => new Date(b.fecha_venta).getTime() - new Date(a.fecha_venta).getTime())
    .slice(0, 5);

  // Prepare chart data for individual project
  const chartData = selectedProyecto ? [
    {
      name: 'Ventas',
      amount: totalSalesValue
    },
    {
      name: 'Cobrado',
      amount: totalPaidAmount
    },
    {
      name: 'Pendiente',
      amount: totalPendingAmount
    }
  ] : [];

  // Show payments in priority order: overdue, current (no due date), then future
  const upcomingPayments = [
    ...overduePayments.sort((a: any, b: any) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime()),
    ...currentPayments.slice(0, 3), // Show some current payments
    ...futurePayments.sort((a: any, b: any) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime())
  ].slice(0, 5);

  const selectedDesarrolladorData = desarrolladores.find(
    d => d.id_desarrollador === selectedDesarrollador
  );


  if (loading && desarrolladores.length === 0) {
    return (
      <AppLayout user={user}>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Cargando desarrolladores...</p>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header with Developer and Project Selection */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="grid gap-1">
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">
              {selectedDesarrolladorData 
                ? `${selectedDesarrolladorData.nombre}${selectedProyecto ? ` - ${proyectos.find(p => p.id_proyecto === selectedProyecto)?.nombre || 'Proyecto'}` : ''}`
                : 'Selecciona un desarrollador para ver datos'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedDesarrollador?.toString() || ''}
              onValueChange={(value) => {
                setSelectedDesarrollador(value ? parseInt(value) : null);
                setSelectedProyecto(null);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Desarrollador" />
              </SelectTrigger>
              <SelectContent>
                {desarrolladores.map((desarrollador) => (
                  <SelectItem
                    key={desarrollador.id_desarrollador}
                    value={desarrollador.id_desarrollador.toString()}
                  >
                    {desarrollador.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedDesarrollador && proyectos.length > 0 && (
              <Select
                value={selectedProyecto?.toString() || 'all'}
                onValueChange={(value) => setSelectedProyecto(value === 'all' ? null : parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todos los proyectos
                  </SelectItem>
                  {proyectos.map((proyecto) => (
                    <SelectItem
                      key={proyecto.id_proyecto}
                      value={proyecto.id_proyecto.toString()}
                    >
                      {proyecto.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {!selectedDesarrollador ? (
          <Card>
            <CardContent className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-2 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">
                  Selecciona un Desarrollador
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Elige un desarrollador del menú desplegable para ver sus proyectos, inventario y métricas.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Cargando datos del desarrollador...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
        <>
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card className="">
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
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(soldUnits)}</div>
              <p className="text-xs text-muted-foreground">
                unidades vendidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor de Ventas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSalesValue)}</div>
              <p className="text-xs text-muted-foreground">
                Ventas totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobranza</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalPaid > 0 ? '100' : '0'}% cobrado hasta hoy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Cobranza</CardTitle>
            <CardDescription>
              Resumen de pagos y cobranza
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <p className="text-sm font-medium leading-none">Total Cobrado</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaidAmount)}</p>
              </div>
              <div className="grid gap-2">
                <p className="text-sm font-medium leading-none">Pendiente de Cobro</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendingAmount)}</p>
                <p className="text-xs text-muted-foreground">
                  {futurePayments.length + currentPayments.length} pagos por cobrar
                </p>
              </div>
              <div className="grid gap-2">
                <p className="text-sm font-medium leading-none">Pagos Vencidos</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalOverdueAmount)}</p>
                <p className="text-xs text-muted-foreground">{overduePayments.length} pagos vencidos</p>
              </div>
            </div>
            {overduePayments.length > 0 && (
              <div className="rounded-lg bg-orange-50 p-3 border border-orange-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    {overduePayments.length} pagos vencidos - {formatCurrency(totalOverdueAmount)}
                  </span>
                </div>
              </div>
            )}
            {currentPayments.length > 0 && (
              <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {currentPayments.length} pagos pendientes actuales - {formatCurrency(totalCurrentAmount)}
                  </span>
                </div>
              </div>
            )}
            {futurePayments.length > 0 && (
              <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {futurePayments.length} pagos programados para fechas futuras
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {/* Recent Sales */}
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Ventas Recientes</CardTitle>
                <CardDescription>
                  Últimas unidades vendidas
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <a href="/developer/sales">
                  Ver todas
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {recentSales.length > 0 ? recentSales.map((venta: any, index) => (
                  <div key={venta.id_venta || index} className="flex items-center gap-4">
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {venta.clientes?.nombre_cliente || `Cliente ID: ${venta.id_cliente}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Unidad {venta.inventario?.num_unidad || 'N/A'} • {formatDate(new Date(venta.fecha_venta))}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {formatCurrency(venta.precio_venta || 0)}
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No hay ventas recientes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Pagos</CardTitle>
              <CardDescription>
                Pagos vencidos y próximos vencimientos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {upcomingPayments.length > 0 ? upcomingPayments.map((pago: any, index) => {
                  const isOverdue = pago.fecha_vencimiento && new Date(pago.fecha_vencimiento) < new Date();
                  
                  return (
                    <div key={pago.id_pago || index} className="flex items-center gap-4">
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                          Unidad {pago.ventas_contratos?.inventario?.num_unidad || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pago.fecha_vencimiento ? formatDate(new Date(pago.fecha_vencimiento)) : 'Sin fecha'}
                          {isOverdue && (
                            <Badge variant="destructive" className="ml-2">Vencido</Badge>
                          )}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {formatCurrency(pago.monto || 0)}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No hay pagos próximos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Overview - Only show when no specific project is selected */}
        {!selectedProyecto && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Proyecto</CardTitle>
            <CardDescription>
              Estado de ventas y cobranza por cada proyecto del desarrollador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Show project summaries only if no specific project selected */}
              {!selectedProyecto && proyectosSummary.length > 0 ? proyectosSummary.map((projectSummary) => {
                const proyecto = proyectos.find(p => p.id_proyecto === projectSummary.id_proyecto);
                if (!proyecto) return null;
                
                // Use corrected data from dashboard view
                const projectSoldValue = projectSummary.total_vendido || 0;
                const projectCollected = projectSummary.total_cobrado || 0;
                const projectPending = projectSummary.cuentas_por_cobrar || 0;
                const salesProgress = projectSummary.progreso_ventas_pct || 0;
                
                return (
                  <Card 
                    key={projectSummary.id_proyecto} 
                    className="cursor-pointer transition-colors hover:bg-accent/50"
                    onClick={() => setSelectedProyecto(projectSummary.id_proyecto)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{projectSummary.proyecto}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {projectSummary.total_unidades} unidades totales
                          </p>
                        </div>
                        <Badge variant="outline">
                          {projectSummary.unidades_vendidas}/{projectSummary.total_unidades}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Vendido</span>
                          <span className="font-medium">{formatCurrency(projectSoldValue)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Cobrado</span>
                          <span className="font-medium text-green-600">{formatCurrency(projectCollected)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Cuentas por cobrar</span>
                          <span className="font-medium text-yellow-600">{formatCurrency(projectPending)}</span>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progreso de ventas</span>
                          <span>{Math.round(salesProgress)}%</span>
                        </div>
                        <Progress value={salesProgress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : selectedProyecto ? (
                <div className="col-span-2">
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <Building2 className="h-8 w-8 text-blue-600 mb-2" />
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Proyecto: {proyectos.find(p => p.id_proyecto === selectedProyecto)?.nombre}
                      </h3>
                      <p className="text-blue-700 text-sm mb-4">
                        Vista filtrada por proyecto seleccionado
                      </p>
                      <Button 
                        onClick={() => setSelectedProyecto(null)}
                        variant="outline"
                      >
                        Ver todos los proyectos
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="col-span-2">
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No hay proyectos para este desarrollador</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Chart Section - Always show when project is selected */}
        {selectedProyecto && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Análisis del Proyecto</CardTitle>
                  <CardDescription>
                    Evolución mensual del proyecto - {proyectos.find(p => p.id_proyecto === selectedProyecto)?.nombre}
                  </CardDescription>
                </div>
                <Tabs value={chartMode} onValueChange={(value) => setChartMode(value as 'ventas' | 'cobranza')}>
                  <TabsList>
                    <TabsTrigger value="ventas" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Ventas
                    </TabsTrigger>
                    <TabsTrigger value="cobranza" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cobranza
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {monthlyChartData.length > 0 ? (
                      <BarChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fontSize: 11 }}
                          tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), chartMode === 'ventas' ? 'Ventas' : 'Cobranza']}
                          labelStyle={{ color: '#000' }}
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar 
                          dataKey={chartMode}
                          radius={[4, 4, 0, 0]}
                          fill={chartMode === 'ventas' ? '#3b82f6' : '#10b981'}
                        />
                      </BarChart>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No hay datos mensuales disponibles</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Este proyecto no tiene datos en la tabla venta_cobranza_upload
                        </p>
                        {chartData.length > 0 && (
                          <div className="w-full max-w-md">
                            <h4 className="text-sm font-medium mb-2">Resumen del proyecto:</h4>
                            <div className="h-[200px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Monto']} />
                                  <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                      <Cell 
                                        key={`cell-${index}`}
                                        fill={
                                          entry.name === 'Ventas' ? '#3b82f6' : 
                                          entry.name === 'Cobrado' ? '#10b981' : '#f59e0b'
                                        }
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>
        )}
        </>
        )}
      </div>
    </AppLayout>
  );
} 