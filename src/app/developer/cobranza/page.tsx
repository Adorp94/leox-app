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
  Building,
  DollarSign,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Check,
  ChevronsUpDown,
  TrendingUp,
  CreditCard
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

  // Calculate KPIs
  const totalCollected = pagos
    .filter((p: any) => p.estatus_pago === 'Pagado')
    .reduce((sum: number, p: any) => sum + p.monto, 0);
  
  const totalPending = pagos
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
  
  // Filter pagos based on selected client
  const filteredPagos = selectedClient 
    ? processedPagos.filter((p: any) => p.clientName === selectedClient)
    : processedPagos;

  const paidPagos = filteredPagos.filter((p: any) => getPaymentStatus(p) === 'paid');
  const overduePagos = filteredPagos.filter((p: any) => getPaymentStatus(p) === 'overdue');
  const upcomingPagos = filteredPagos.filter((p: any) => ['due-soon', 'upcoming'].includes(getPaymentStatus(p)));

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
            <h1 className="text-3xl font-bold tracking-tight">
              Cobranza
            </h1>
            <p className="text-muted-foreground mt-1">
              Control y seguimiento de pagos por proyecto
            </p>
          </div>
          
          {/* Client Filter */}
          <div className="w-64">
            <Popover open={clientFilterOpen} onOpenChange={setClientFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientFilterOpen}
                  className="w-full justify-between"
                >
                  {selectedClient || "Filtrar por cliente..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." />
                  <CommandList>
                    <CommandEmpty>No se encontró cliente.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
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
                      {uniqueClients.map((client: any) => (
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

        {/* Project Selector */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-card rounded-lg border">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</div>
                  <p className="text-xs text-muted-foreground">
                    {paidPagos.length} pagos completados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</div>
                  <p className="text-xs text-muted-foreground">
                    {upcomingPagos.length + overduePagos.length} pagos pendientes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{overduePagos.length}</div>
                  <p className="text-xs text-muted-foreground">
                    pagos vencidos
                  </p>
                </CardContent>
              </Card>
            </div>


            {/* Cobranza Tabs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registro de Cobranza</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredPagos.length} registros de pago
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="todos" className="space-y-4">
                  <TabsList className="grid w-full max-w-lg grid-cols-3">
                    <TabsTrigger value="todos">Todos ({filteredPagos.length})</TabsTrigger>
                    <TabsTrigger value="pagados">Pagados ({paidPagos.length})</TabsTrigger>
                    <TabsTrigger value="pendientes">Pendientes ({upcomingPagos.length + overduePagos.length})</TabsTrigger>
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
                                <Badge variant="outline">
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
                                <div className="flex items-center gap-1">
                                  {status === 'paid' && <CheckCircle className="h-3 w-3 text-green-600" />}
                                  {status === 'overdue' && <AlertCircle className="h-3 w-3 text-red-600" />}
                                  {status === 'due-soon' && <Clock className="h-3 w-3 text-yellow-600" />}
                                  {status === 'upcoming' && <Clock className="h-3 w-3 text-muted-foreground" />}
                                  <span className="text-xs">
                                    {status === 'paid' ? 'Pagado' : 
                                     status === 'overdue' ? 'Vencido' :
                                     status === 'due-soon' ? 'Próximo' : 'Programado'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {status !== 'paid' && (
                                    <Button variant="outline" size="sm">
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
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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
                                  <Badge variant="outline">
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
                                    <Badge variant="destructive">
                                      Vencido
                                    </Badge>
                                  )}
                                  {status === 'due-soon' && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100">
                                      Próximo
                                    </Badge>
                                  )}
                                  {status === 'upcoming' && (
                                    <Badge variant="outline">
                                      Programado
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button variant="outline" size="sm">
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
      </div>
    </AppLayout>
  );
}