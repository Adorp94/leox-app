'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building,
  TrendingUp,
  DollarSign,
  FileText,
  Eye,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  formatCurrency, 
  formatDate
} from '@/lib/format';
import { mockUsers } from '@/lib/mock-data';
import { 
  ventasService, 
  VentaContratoRecord,
  VentaPagoRecord,
  inventarioService, 
  InventarioRecord,
  proyectosService,
  ProyectoRecord
} from '@/lib/supabase';

export default function DeveloperSalesPage() {
  const user = mockUsers[2]; // Developer user
  
  // State management
  const [projects, setProjects] = useState<ProyectoRecord[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [ventas, setVentas] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [inventario, setInventario] = useState<InventarioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Client filter for cobranza
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [clientFilterOpen, setClientFilterOpen] = useState(false);

  // Load projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await proyectosService.getProyectos();
        setProjects(projectsData);
        
        // Auto-select first project or load from localStorage
        const savedProject = localStorage.getItem('selectedProject');
        const projectToSelect = savedProject && projectsData.find(p => p.id_proyecto === parseInt(savedProject)) 
          ? parseInt(savedProject)
          : projectsData[0]?.id_proyecto || null;
        
        if (projectToSelect) {
          setSelectedProject(projectToSelect);
        }
      } catch (err) {
        setError('Error loading projects');
        console.error('Error fetching projects:', err);
      }
    };

    fetchProjects();
  }, []);

  // Load data when project changes
  useEffect(() => {
    if (!selectedProject) {
      setLoading(false);
      return;
    }

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Save selected project to localStorage
        localStorage.setItem('selectedProject', selectedProject.toString());
        
        const [ventasData, pagosData, inventarioData] = await Promise.all([
          ventasService.getVentasContratosByProject(selectedProject),
          ventasService.getPagosByProject(selectedProject),
          inventarioService.getInventarioByProject(selectedProject)
        ]);
        
        setVentas(ventasData);
        setPagos(pagosData);
        setInventario(inventarioData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
        console.error('Error fetching project data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [selectedProject]);

  // Calculate KPIs
  const currentProject = projects.find(p => p.id_proyecto === selectedProject);
  const totalUnitsInProject = inventario.length;
  const totalSales = ventas.length;
  const salesPercentage = totalUnitsInProject > 0 ? Math.round((totalSales / totalUnitsInProject) * 100) : 0;
  
  const totalVentasAmount = ventas
    .filter(v => v.estatus === 'Vendida')
    .reduce((sum, v) => sum + v.precio_venta, 0);
  
  const totalCollected = pagos
    .filter(p => p.estatus_pago === 'Pagado')
    .reduce((sum, p) => sum + p.monto, 0);
  
  const totalPending = totalVentasAmount - totalCollected;
  
  // Calculate absorption rate (sales per month)
  const projectStartDate = new Date('2023-01-01');
  const currentDate = new Date();
  const monthsElapsed = Math.max(1, 
    (currentDate.getFullYear() - projectStartDate.getFullYear()) * 12 + 
    (currentDate.getMonth() - projectStartDate.getMonth())
  );
  const absorptionRate = totalSales / monthsElapsed;

  // Categorize pagos by status
  const getPaymentStatus = (pago: any) => {
    const dueDate = new Date(pago.fecha_vencimiento || pago.fecha_pago);
    const today = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (pago.estatus_pago === 'Pagado') return 'paid';
    if (daysDiff < 0) return 'overdue';
    if (daysDiff <= 7) return 'due-soon';
    return 'upcoming';
  };

  // Process pagos with payment numbering and client grouping
  const processedPagos = pagos
    .sort((a, b) => {
      // First sort by client name
      const clientA = `${a.ventas_contratos?.clientes?.nombre} ${a.ventas_contratos?.clientes?.apellidos}`.trim();
      const clientB = `${b.ventas_contratos?.clientes?.nombre} ${b.ventas_contratos?.clientes?.apellidos}`.trim();
      if (clientA !== clientB) return clientA.localeCompare(clientB);
      
      // Then sort by payment date
      return new Date(a.fecha_pago).getTime() - new Date(b.fecha_pago).getTime();
    })
    .map((pago, index, arr) => {
      const clientName = `${pago.ventas_contratos?.clientes?.nombre} ${pago.ventas_contratos?.clientes?.apellidos}`.trim();
      
      // Calculate payment number for this client
      let paymentNumber = 1;
      for (let i = 0; i < index; i++) {
        const prevClientName = `${arr[i].ventas_contratos?.clientes?.nombre} ${arr[i].ventas_contratos?.clientes?.apellidos}`.trim();
        if (prevClientName === clientName) {
          paymentNumber++;
        }
      }
      
      return {
        ...pago,
        clientName,
        paymentNumber
      };
    });

  // Get unique clients for filter
  const uniqueClients = Array.from(new Set(processedPagos.map(p => p.clientName))).sort();
  
  // Filter pagos based on selected client
  const filteredPagos = selectedClient 
    ? processedPagos.filter(p => p.clientName === selectedClient)
    : processedPagos;

  const paidPagos = filteredPagos.filter(p => getPaymentStatus(p) === 'paid');
  const overduePagos = filteredPagos.filter(p => getPaymentStatus(p) === 'overdue');
  const upcomingPagos = filteredPagos.filter(p => ['due-soon', 'upcoming'].includes(getPaymentStatus(p)));

  if (error) {
    return (
      <AppLayout user={user}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2 font-semibold">Error al cargar los datos</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/developer">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Ventas y Cobranza</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header with Project Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Registro de Ventas
            </h1>
            <p className="text-gray-600 mt-1">
              Control y seguimiento de ventas y cobranza por proyecto
            </p>
          </div>
          
          {/* Floating Action Button */}
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 fixed sm:relative bottom-6 right-6 sm:bottom-auto sm:right-auto z-50 rounded-full sm:rounded-md h-14 w-14 sm:h-auto sm:w-auto"
          >
            <PlusCircle className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Nueva Venta</span>
          </Button>
        </div>

        {/* Project Selector */}
        <Card className="border border-gray-200/50 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Proyecto
                </label>
                <Select value={selectedProject?.toString() || ''} onValueChange={(value) => setSelectedProject(parseInt(value))}>
                  <SelectTrigger className="w-full max-w-sm h-8">
                    <SelectValue placeholder="Selecciona un proyecto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id_proyecto} value={project.id_proyecto.toString()}>
                        <span className="font-medium text-sm">{project.nombre}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          // Loading Skeletons
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : selectedProject ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-gray-200/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                  <CardTitle className="text-sm font-medium text-gray-600">Avance</CardTitle>
                  <div className="rounded-full bg-gray-100 p-1.5">
                    <Users className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-semibold text-gray-900">{totalSales}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    de {totalUnitsInProject} unidades ({salesPercentage}%)
                  </p>
                  <div className="mt-2 bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-gray-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(salesPercentage, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                  <CardTitle className="text-sm font-medium text-gray-600">Ventas</CardTitle>
                  <div className="rounded-full bg-gray-100 p-1.5">
                    <FileText className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-semibold text-gray-900">{formatCurrency(totalVentasAmount)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalSales} unidades
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                  <CardTitle className="text-sm font-medium text-gray-600">Cobrado</CardTitle>
                  <div className="rounded-full bg-gray-100 p-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-semibold text-gray-900">{formatCurrency(totalCollected)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(totalPending)} pendiente
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                  <CardTitle className="text-sm font-medium text-gray-600">Absorción</CardTitle>
                  <div className="rounded-full bg-gray-100 p-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-semibold text-gray-900">{absorptionRate.toFixed(1)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    /mes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Ventas Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gray-100 rounded-lg p-1.5">
                  <FileText className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Ventas</h2>
                  <p className="text-xs text-gray-500">{ventas.length} registros</p>
                </div>
              </div>

              <Card className="border border-gray-200/50 shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-100">
                        <TableHead className="font-medium text-gray-600 text-xs h-10">Cliente</TableHead>
                        <TableHead className="font-medium text-gray-600 text-xs h-10">Departamento</TableHead>
                        <TableHead className="font-medium text-gray-600 text-xs h-10">Unidad</TableHead>
                        <TableHead className="font-medium text-gray-600 text-xs h-10">Lista</TableHead>
                        <TableHead className="font-medium text-gray-600 text-xs h-10">Venta</TableHead>
                        <TableHead className="font-medium text-gray-600 text-xs h-10">Fecha</TableHead>
                        <TableHead className="font-medium text-gray-600 text-xs h-10">Estado</TableHead>
                        <TableHead className="font-medium text-gray-600 text-xs h-10 w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ventas.map((venta) => (
                        <TableRow key={venta.id_venta} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="py-2">
                            <p className="font-medium text-gray-900 text-sm">
                              {venta.clientes?.nombre} {venta.clientes?.apellidos}
                            </p>
                          </TableCell>
                          <TableCell className="py-2">
                            <p className="text-xs text-gray-500">{venta.categoria}</p>
                          </TableCell>
                          <TableCell className="py-2 font-mono text-sm">
                            {venta.inventario?.num_unidad}
                          </TableCell>
                          <TableCell className="py-2 text-gray-600 text-sm">
                            {venta.precio_lista ? formatCurrency(venta.precio_lista) : '-'}
                          </TableCell>
                          <TableCell className="py-2 font-medium text-sm">
                            {formatCurrency(venta.precio_venta)}
                          </TableCell>
                          <TableCell className="py-2 text-xs text-gray-500">
                            {formatDate(new Date(venta.fecha_venta))}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant="outline" className={
                              venta.estatus === 'Vendida' 
                                ? 'text-green-700 border-green-200 bg-green-50 text-xs'
                                : 'text-red-700 border-red-200 bg-red-50 text-xs'
                            }>
                              {venta.estatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Eye className="h-3 w-3 text-gray-400" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {ventas.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No hay ventas registradas</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Divider */}
            <div className="relative my-8">
              <Separator className="bg-gray-200" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Cobranza
                </span>
              </div>
            </div>

            {/* Cobranza Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 rounded-lg p-1.5">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Cobranza</h2>
                    <p className="text-xs text-gray-500">{filteredPagos.length} registros</p>
                  </div>
                </div>

                {/* Client Filter */}
                <div className="w-64">
                  <Popover open={clientFilterOpen} onOpenChange={setClientFilterOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={clientFilterOpen}
                        className="w-full justify-between text-xs"
                      >
                        {selectedClient || "Filtrar por cliente..."}
                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0">
                      <Command>
                        <CommandInput placeholder="Buscar cliente..." className="h-8" />
                        <CommandList>
                          <CommandEmpty>No se encontró cliente.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              key="all"
                              onSelect={() => {
                                setSelectedClient('');
                                setClientFilterOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${selectedClient === '' ? "opacity-100" : "opacity-0"}`}
                              />
                              Todos los clientes
                            </CommandItem>
                            {uniqueClients.map((client) => (
                              <CommandItem
                                key={client}
                                onSelect={() => {
                                  setSelectedClient(client === selectedClient ? '' : client);
                                  setClientFilterOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${selectedClient === client ? "opacity-100" : "opacity-0"}`}
                                />
                                {client}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Tabs defaultValue="todos" className="space-y-4">
                <TabsList className="grid w-full max-w-lg grid-cols-3 h-9">
                  <TabsTrigger value="todos" className="text-xs">Todos ({filteredPagos.length})</TabsTrigger>
                  <TabsTrigger value="pagados" className="text-xs">Pagados ({paidPagos.length})</TabsTrigger>
                  <TabsTrigger value="pendientes" className="text-xs">Pendientes ({upcomingPagos.length + overduePagos.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="todos">
                  <Card className="border border-gray-200/50 shadow-sm">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-gray-100">
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Cliente</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">#</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Unidad</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Concepto</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Monto</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Fecha</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Estado</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10 w-20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPagos.map((pago) => {
                            const status = getPaymentStatus(pago);
                            return (
                              <TableRow key={pago.id_pago} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell className="py-2">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {pago.clientName}
                                  </p>
                                </TableCell>
                                <TableCell className="py-2">
                                  <span className="text-xs text-gray-500 font-mono">
                                    {pago.paymentNumber}
                                  </span>
                                </TableCell>
                                <TableCell className="py-2 font-mono text-sm">
                                  {pago.ventas_contratos?.inventario?.num_unidad}
                                </TableCell>
                                <TableCell className="py-2">
                                  <Badge variant="outline" className="text-xs">
                                    {pago.concepto_pago}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-2 font-medium text-sm">
                                  {formatCurrency(pago.monto)}
                                </TableCell>
                                <TableCell className="py-2 text-xs text-gray-500">
                                  {formatDate(new Date(pago.fecha_pago))}
                                </TableCell>
                                <TableCell className="py-2">
                                  <div className="flex items-center gap-1">
                                    {status === 'paid' && <CheckCircle className="h-3 w-3 text-green-600" />}
                                    {status === 'overdue' && <AlertCircle className="h-3 w-3 text-red-600" />}
                                    {status === 'due-soon' && <Clock className="h-3 w-3 text-yellow-600" />}
                                    {status === 'upcoming' && <Clock className="h-3 w-3 text-gray-400" />}
                                    <span className="text-xs text-gray-500">
                                      {status === 'paid' ? 'Pagado' : 
                                       status === 'overdue' ? 'Vencido' :
                                       status === 'due-soon' ? 'Próximo' : 'Programado'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-2">
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <Eye className="h-3 w-3 text-gray-400" />
                                    </Button>
                                    {status !== 'paid' && (
                                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                                        Pagar
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      {filteredPagos.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No hay pagos para mostrar</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pagados">
                  <Card className="border border-gray-200/50 shadow-sm">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-gray-100">
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Cliente</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">#</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Unidad</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Concepto</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Monto</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Fecha</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paidPagos.map((pago) => (
                            <TableRow key={pago.id_pago} className="hover:bg-gray-50/50 transition-colors">
                              <TableCell className="py-2">
                                <p className="font-medium text-gray-900 text-sm">
                                  {pago.clientName}
                                </p>
                              </TableCell>
                              <TableCell className="py-2">
                                <span className="text-xs text-gray-500 font-mono">
                                  {pago.paymentNumber}
                                </span>
                              </TableCell>
                              <TableCell className="py-2 font-mono text-sm">
                                {pago.ventas_contratos?.inventario?.num_unidad}
                              </TableCell>
                              <TableCell className="py-2">
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  {pago.concepto_pago}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-2 font-medium text-sm text-green-600">
                                {formatCurrency(pago.monto)}
                              </TableCell>
                              <TableCell className="py-2 text-xs text-gray-500">
                                {formatDate(new Date(pago.fecha_pago))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pendientes">
                  <Card className="border border-gray-200/50 shadow-sm">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-gray-100">
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Cliente</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">#</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Unidad</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Concepto</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Monto</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Fecha</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10">Prioridad</TableHead>
                            <TableHead className="font-medium text-gray-600 text-xs h-10 w-20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...overduePagos, ...upcomingPagos]
                            .sort((a, b) => new Date(a.fecha_pago).getTime() - new Date(b.fecha_pago).getTime())
                            .map((pago) => {
                              const status = getPaymentStatus(pago);
                              return (
                                <TableRow key={pago.id_pago} className="hover:bg-gray-50/50 transition-colors">
                                  <TableCell className="py-2">
                                    <p className="font-medium text-gray-900 text-sm">
                                      {pago.clientName}
                                    </p>
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <span className="text-xs text-gray-500 font-mono">
                                      {pago.paymentNumber}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-2 font-mono text-sm">
                                    {pago.ventas_contratos?.inventario?.num_unidad}
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <Badge variant="outline" className="text-xs">
                                      {pago.concepto_pago}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-2 font-medium text-sm">
                                    {formatCurrency(pago.monto)}
                                  </TableCell>
                                  <TableCell className="py-2 text-xs text-gray-500">
                                    {formatDate(new Date(pago.fecha_pago))}
                                  </TableCell>
                                  <TableCell className="py-2">
                                    {status === 'overdue' && (
                                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                        Vencido
                                      </Badge>
                                    )}
                                    {status === 'due-soon' && (
                                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                                        Próximo
                                      </Badge>
                                    )}
                                    {status === 'upcoming' && (
                                      <Badge variant="outline" className="text-xs">
                                        Programado
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                                      Pagar
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Selecciona un proyecto para ver las ventas y cobranza</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}