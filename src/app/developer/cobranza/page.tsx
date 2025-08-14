'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { 
  Building,
  DollarSign,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  ChevronsUpDown,
  TrendingUp,
  CreditCard,
  Receipt,
  CalendarIcon,
  User,
  Hash,
  FileText,
  Banknote,
  Search,
  Filter,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  formatCurrency, 
  formatDate
} from '@/lib/format';
import { mockUsers } from '@/lib/mock-data';
import { 
  ventasService, 
  proyectosService,
  ProyectoRecord
} from '@/lib/supabase';

export default function DeveloperCobranzaPage() {
  const user = mockUsers[2]; // Developer user
  
  // State management
  const [projects, setProjects] = useState<ProyectoRecord[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [pagos, setPagos] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters for cobranza
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [clientFilterOpen, setClientFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({from: undefined, to: undefined});
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'todos' | 'pagados' | 'pendientes'>('todos');
  
  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    metodoPago: '',
    referencia: '',
    notas: ''
  });

  // Load projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await proyectosService.getProyectos();
        setProjects(projectsData);
        
        // Auto-select first project or load from localStorage
        const savedProject = localStorage.getItem('selectedProjectCobranza');
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
        localStorage.setItem('selectedProjectCobranza', selectedProject.toString());
        
        const pagosData = await ventasService.getPagosByProject(selectedProject);
        setPagos(pagosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
        console.error('Error fetching project data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [selectedProject]);
  
  // Handle payment marking
  const handleMarkAsPaid = async (pago: any) => {
    setSelectedPayment(pago);
    setPaymentDialogOpen(true);
  };
  
  const handleSubmitPayment = async () => {
    if (!selectedPayment) return;
    
    try {
      await ventasService.updatePagoStatus(
        selectedPayment.id_pago,
        'Pagado',
        paymentForm.metodoPago || undefined,
        paymentForm.referencia || undefined,
        paymentForm.notas || undefined
      );
      
      // Refresh data
      const pagosData = await ventasService.getPagosByProject(selectedProject!);
      setPagos(pagosData);
      
      // Close dialog and reset form
      setPaymentDialogOpen(false);
      setSelectedPayment(null);
      setPaymentForm({ metodoPago: '', referencia: '', notas: '' });
    } catch (err) {
      console.error('Error updating payment status:', err);
      // You could add a toast notification here
    }
  };

  // Calculate original KPIs (for reference, but we'll use filtered ones)
  const originalTotalCollected = pagos
    .filter((p: any) => p.estatus_pago === 'Pagado')
    .reduce((sum: number, p: any) => sum + p.monto, 0);
  
  const originalTotalPending = pagos
    .filter((p: any) => p.estatus_pago !== 'Pagado')
    .reduce((sum: number, p: any) => sum + p.monto, 0);

  // Categorize pagos by status
  const getPaymentStatus = (pago: unknown) => {
    const pagoObj = pago as Record<string, unknown>;
    const dueDate = new Date((pagoObj.fecha_vencimiento || pagoObj.fecha_pago) as string);
    const today = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (pagoObj.estatus_pago === 'Pagado') return 'paid';
    if (daysDiff < 0) return 'overdue';
    if (daysDiff <= 7) return 'due-soon';
    return 'upcoming';
  };

  // Process pagos with payment numbering and client grouping
  const processedPagos = pagos
    .sort((a: any, b: any) => {
      // First sort by client name (using the corrected field name)
      const clientA = a.ventas_contratos?.clientes?.nombre_cliente || `Cliente ${a.ventas_contratos?.inventario?.num_unidad || 'N/A'}`;
      const clientB = b.ventas_contratos?.clientes?.nombre_cliente || `Cliente ${b.ventas_contratos?.inventario?.num_unidad || 'N/A'}`;
      if (clientA !== clientB) return clientA.localeCompare(clientB);
      
      // Then sort by payment date
      return new Date(a.fecha_pago).getTime() - new Date(b.fecha_pago).getTime();
    })
    .map((pago: any, index: any, arr: any) => {
      const clientName = pago.ventas_contratos?.clientes?.nombre_cliente || `Cliente ${pago.ventas_contratos?.inventario?.num_unidad || 'N/A'}`;
      
      // Calculate payment number for this client
      let paymentNumber = 1;
      for (let i = 0; i < index; i++) {
        const prevClientName = arr[i].ventas_contratos?.clientes?.nombre_cliente || `Cliente ${arr[i].ventas_contratos?.inventario?.num_unidad || 'N/A'}`;
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
  const uniqueClients = Array.from(new Set(processedPagos.map((p: any) => p.clientName))).sort();
  
  // Apply all filters
  const filteredPagos = processedPagos.filter((pago: any) => {
    // Client filter
    if (selectedClient && pago.clientName !== selectedClient) {
      return false;
    }
    
    // Search filter (search in client name, unit, concept, amount)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchFields = [
        pago.clientName,
        pago.ventas_contratos?.inventario?.num_unidad,
        pago.concepto_pago,
        pago.monto?.toString()
      ].filter(Boolean).map(field => field.toString().toLowerCase());
      
      if (!searchFields.some(field => field.includes(searchLower))) {
        return false;
      }
    }
    
    // Date range filter
    if (dateRange.from || dateRange.to) {
      const pagoDate = new Date(pago.fecha_pago);
      if (dateRange.from && pagoDate < dateRange.from) {
        return false;
      }
      if (dateRange.to && pagoDate > dateRange.to) {
        return false;
      }
    }
    
    return true;
  });

  // Calculate KPIs based on current filters and active tab
  const getFilteredPagosForTab = (tab: string) => {
    switch (tab) {
      case 'pagados':
        return filteredPagos.filter((p: any) => getPaymentStatus(p) === 'paid');
      case 'pendientes':
        return filteredPagos.filter((p: any) => getPaymentStatus(p) !== 'paid');
      default:
        return filteredPagos;
    }
  };
  
  const currentTabPagos = getFilteredPagosForTab(activeTab);
  const paidPagos = filteredPagos.filter((p: any) => getPaymentStatus(p) === 'paid');
  const overduePagos = filteredPagos.filter((p: any) => getPaymentStatus(p) === 'overdue');
  const upcomingPagos = filteredPagos.filter((p: any) => ['due-soon', 'upcoming'].includes(getPaymentStatus(p)));
  
  // Recalculate totals based on current filters
  const filteredTotalCollected = paidPagos.reduce((sum: number, p: any) => sum + p.monto, 0);
  const filteredTotalPending = upcomingPagos.concat(overduePagos).reduce((sum: number, p: any) => sum + p.monto, 0);

  if (error) {
    return (
      <AppLayout user={user}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-2 font-semibold">Error al cargar los datos</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Cobranza
            </h1>
            <p className="text-slate-500 mt-1">
              Control y seguimiento de pagos por proyecto
            </p>
          </div>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50/50 rounded-xl border border-slate-200/50">
          <Building className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">
            Proyecto:
          </span>
          <Select value={selectedProject?.toString() || ''} onValueChange={(value) => setSelectedProject(parseInt(value))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecciona un proyecto..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project: any) => (
                <SelectItem key={project.id_proyecto} value={project.id_proyecto.toString()}>
                  {project.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          // Loading Skeletons
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
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
        ) : selectedProject ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm bg-emerald-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-100 p-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-slate-600">Total Cobrado</CardTitle>
                      <div className="text-2xl font-semibold text-emerald-700">{formatCurrency(filteredTotalCollected)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-500">
                    {paidPagos.length} pagos completados
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-amber-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-100 p-3">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-slate-600">Pendiente</CardTitle>
                      <div className="text-2xl font-semibold text-amber-700">{formatCurrency(filteredTotalPending)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-500">
                    {upcomingPagos.length + overduePagos.length} pagos pendientes
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-rose-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-rose-100 p-3">
                      <AlertCircle className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-slate-600">Vencidos</CardTitle>
                      <div className="text-2xl font-semibold text-rose-700">{overduePagos.length}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-500">
                    {overduePagos.length > 0 ? 'requieren atención' : 'todos al día'}
                  </p>
                </CardContent>
              </Card>
            </div>


            {/* Cobranza Tabs */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-slate-800">Registro de Cobranza</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      {filteredPagos.length} registros de pago
                    </p>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Buscar pagos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Date Range Filter */}
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto justify-start bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                              </>
                            ) : (
                              formatDate(dateRange.from)
                            )
                          ) : (
                            <span>Filtrar por fecha</span>
                          )}
                          {(dateRange.from || dateRange.to) && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setDateRange({from: undefined, to: undefined});
                              }}
                              className="ml-2 hover:bg-slate-200 rounded p-0.5 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border-slate-200 shadow-lg" align="start">
                        <Calendar
                          mode="range"
                          defaultMonth={dateRange.from || new Date()}
                          selected={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : dateRange.from ? { from: dateRange.from, to: dateRange.from } : undefined}
                          onSelect={(range) => {
                            if (range) {
                              setDateRange({ from: range.from, to: range.to });
                            } else {
                              setDateRange({ from: undefined, to: undefined });
                            }
                          }}
                          numberOfMonths={1}
                          className="rounded-md border-0"
                        />
                      </PopoverContent>
                    </Popover>
                    
                    {/* Client Filter */}
                    <Popover open={clientFilterOpen} onOpenChange={setClientFilterOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={clientFilterOpen}
                          className="w-full sm:w-auto justify-between bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{selectedClient || "Cliente"}</span>
                            <div className="flex items-center gap-1 ml-2">
                              {selectedClient && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedClient('');
                                  }}
                                  className="hover:bg-slate-200 rounded p-0.5 cursor-pointer"
                                >
                                  <X className="h-3 w-3" />
                                </span>
                              )}
                              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                            </div>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0 bg-white border-slate-200 shadow-lg">
                        <Command className="bg-white">
                          <CommandInput placeholder="Buscar cliente..." className="border-0 focus:ring-0" />
                          <CommandList className="bg-white">
                            <CommandEmpty className="text-slate-500">No se encontró cliente.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => {
                                  setSelectedClient('');
                                  setClientFilterOpen(false);
                                }}
                                className="hover:bg-slate-50 cursor-pointer"
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${selectedClient === '' ? "opacity-100" : "opacity-0"}`}
                                />
                                Todos los clientes
                              </CommandItem>
                              {uniqueClients.map((client: any) => (
                                <CommandItem
                                  key={client}
                                  onSelect={() => {
                                    setSelectedClient(client === selectedClient ? '' : client);
                                    setClientFilterOpen(false);
                                  }}
                                  className="hover:bg-slate-50 cursor-pointer"
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
                    
                    {/* Active Filters Indicator */}
                    {(selectedClient || searchTerm || dateRange.from || dateRange.to) && (
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Filter className="h-4 w-4" />
                        <span>{filteredPagos.length} de {processedPagos.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'todos' | 'pagados' | 'pendientes')} className="space-y-6">
                  <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-100 p-1">
                    <TabsTrigger value="todos" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 font-medium">Todos ({filteredPagos.length})</TabsTrigger>
                    <TabsTrigger value="pagados" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 font-medium">Pagados ({paidPagos.length})</TabsTrigger>
                    <TabsTrigger value="pendientes" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 font-medium">Pendientes ({upcomingPagos.length + overduePagos.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="todos">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>#</TableHead>
                          <TableHead>Unidad</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="w-[120px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPagos.map((pago: any) => {
                          const status = getPaymentStatus(pago);
                          return (
                            <TableRow key={pago.id_pago}>
                              <TableCell>
                                <div className="font-medium">
                                  {pago.clientName}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {pago.paymentNumber}
                                </span>
                              </TableCell>
                              <TableCell className="font-mono">
                                {pago.ventas_contratos?.inventario?.num_unidad}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-50 font-medium">
                                  {pago.concepto_pago}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(pago.monto)}
                              </TableCell>
                              <TableCell>
                                {formatDate(new Date(pago.fecha_pago))}
                              </TableCell>
                              <TableCell>
                                {status === 'paid' && (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-medium">
                                    <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                    Pagado
                                  </Badge>
                                )}
                                {status === 'overdue' && (
                                  <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100 font-medium">
                                    <AlertCircle className="h-3 w-3 mr-1.5" />
                                    Vencido
                                  </Badge>
                                )}
                                {status === 'due-soon' && (
                                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 font-medium">
                                    <Clock className="h-3 w-3 mr-1.5" />
                                    Próximo
                                  </Badge>
                                )}
                                {status === 'upcoming' && (
                                  <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100 font-medium">
                                    <CalendarIcon className="h-3 w-3 mr-1.5" />
                                    Programado
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Ver detalles</span>
                                  </Button>
                                  {status !== 'paid' && (
                                    <Button 
                                      size="sm"
                                      onClick={() => handleMarkAsPaid(pago)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 font-medium shadow-sm"
                                    >
                                      <Banknote className="h-3 w-3 mr-1.5" />
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
                      <div className="text-center py-8">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No hay pagos para mostrar</h3>
                        <p className="text-muted-foreground">
                          {selectedClient ? 'Este cliente no tiene pagos registrados' : 'No hay registros de cobranza'}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="pagados">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>#</TableHead>
                          <TableHead>Unidad</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paidPagos.map((pago: any) => (
                          <TableRow key={pago.id_pago}>
                            <TableCell>
                              <div className="font-medium">
                                {pago.clientName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground font-mono">
                                {pago.paymentNumber}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono">
                              {pago.ventas_contratos?.inventario?.num_unidad}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-medium">
                                {pago.concepto_pago}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              {formatCurrency(pago.monto)}
                            </TableCell>
                            <TableCell>
                              {formatDate(new Date(pago.fecha_pago))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="pendientes">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>#</TableHead>
                          <TableHead>Unidad</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Prioridad</TableHead>
                          <TableHead className="w-[100px]">Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...overduePagos, ...upcomingPagos]
                          .sort((a: any, b: any) => new Date(a.fecha_pago).getTime() - new Date(b.fecha_pago).getTime())
                          .map((pago: any) => {
                            const status = getPaymentStatus(pago);
                            return (
                              <TableRow key={pago.id_pago}>
                                <TableCell>
                                  <div className="font-medium">
                                    {pago.clientName}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {pago.paymentNumber}
                                  </span>
                                </TableCell>
                                <TableCell className="font-mono">
                                  {pago.ventas_contratos?.inventario?.num_unidad}
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-50 font-medium">
                                    {pago.concepto_pago}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {formatCurrency(pago.monto)}
                                </TableCell>
                                <TableCell>
                                  {formatDate(new Date(pago.fecha_pago))}
                                </TableCell>
                                <TableCell>
                                  {status === 'overdue' && (
                                    <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100 font-medium">
                                      Vencido
                                    </Badge>
                                  )}
                                  {status === 'due-soon' && (
                                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 font-medium">
                                      Próximo
                                    </Badge>
                                  )}
                                  {status === 'upcoming' && (
                                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100 font-medium">
                                      Programado
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleMarkAsPaid(pago)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 font-medium shadow-sm"
                                  >
                                    <Banknote className="h-3 w-3 mr-1.5" />
                                    Pagar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Selecciona un proyecto</h3>
            <p className="text-muted-foreground">
              Elige un proyecto para ver el registro de cobranza
            </p>
          </div>
        )}
        
        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white border-0 shadow-2xl">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-semibold text-slate-800">Confirmar Pago</DialogTitle>
              <DialogDescription className="text-slate-600 text-base">
                {selectedPayment && (
                  <>Registrar pago de <span className="font-semibold text-slate-800">{formatCurrency(selectedPayment.monto)}</span></>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-2">
              {/* Payment Details Summary */}
              {selectedPayment && (
                <div className="rounded-xl bg-slate-50/70 border border-slate-200/50 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2.5">
                        <Receipt className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-slate-800">{formatCurrency(selectedPayment.monto)}</span>
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">{selectedPayment.concepto_pago}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedPayment.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        <span>Unidad {selectedPayment.ventas_contratos?.inventario?.num_unidad}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment Form */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="metodoPago" className="text-sm font-medium text-slate-700">
                    Método de Pago
                  </Label>
                  <Select value={paymentForm.metodoPago} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, metodoPago: value }))}>
                    <SelectTrigger className="h-11 border-slate-200 focus:border-blue-300 focus:ring-blue-100">
                      <SelectValue placeholder="Selecciona método..." />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 bg-white">
                      <SelectItem value="Efectivo" className="focus:bg-slate-50">Efectivo</SelectItem>
                      <SelectItem value="Transferencia" className="focus:bg-slate-50">Transferencia</SelectItem>
                      <SelectItem value="Tarjeta" className="focus:bg-slate-50">Tarjeta</SelectItem>
                      <SelectItem value="Cheque" className="focus:bg-slate-50">Cheque</SelectItem>
                      <SelectItem value="Otro" className="focus:bg-slate-50">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="referencia" className="text-sm font-medium text-slate-700">
                    Referencia / Comprobante
                  </Label>
                  <Input
                    id="referencia"
                    value={paymentForm.referencia}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, referencia: e.target.value }))}
                    placeholder="Número de referencia..."
                    className="h-11 border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notas" className="text-sm font-medium text-slate-700">
                    Notas Adicionales
                  </Label>
                  <Textarea
                    id="notas"
                    value={paymentForm.notas}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notas: e.target.value }))}
                    placeholder="Observaciones del pago..."
                    rows={3}
                    className="border-slate-200 focus:border-blue-300 focus:ring-blue-100 resize-none"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-3 pt-6">
              <Button 
                variant="outline" 
                onClick={() => setPaymentDialogOpen(false)}
                className="flex-1 sm:flex-none h-11 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmitPayment}
                className="flex-1 sm:flex-none h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Pago
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}