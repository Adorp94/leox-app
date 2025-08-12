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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Building,
  TrendingUp,
  FileText,
  Eye,
  PlusCircle,
  Users
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  formatCurrency, 
  formatDate
} from '@/lib/format';
import { mockUsers } from '@/lib/mock-data';
import { 
  ventasService, 
  inventarioService, 
  InventarioRecord,
  proyectosService,
  ProyectoRecord
} from '@/lib/supabase';

export default function DeveloperVentasPage() {
  const user = mockUsers[2]; // Developer user
  
  // State management
  const [projects, setProjects] = useState<ProyectoRecord[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [ventas, setVentas] = useState<unknown[]>([]);
  const [inventario, setInventario] = useState<InventarioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await proyectosService.getProyectos();
        setProjects(projectsData);
        
        // Auto-select first project or load from localStorage
        const savedProject = localStorage.getItem('selectedProjectVentas');
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
        localStorage.setItem('selectedProjectVentas', selectedProject.toString());
        
        const [ventasData, inventarioData] = await Promise.all([
          ventasService.getVentasContratosByProject(selectedProject),
          inventarioService.getInventarioByProject(selectedProject)
        ]);
        
        setVentas(ventasData);
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

  // Calculate KPIs with accurate data - count both 'Vendida' and 'Liquidado' as sold
  const totalUnitsInProject = inventario.length;
  const soldVentas = ventas.filter((v: any) => v.estatus === 'Vendida' || v.estatus === 'Liquidado');
  const totalSales = soldVentas.length;
  const salesPercentage = totalUnitsInProject > 0 ? Math.round((totalSales / totalUnitsInProject) * 100) : 0;
  
  const totalVentasAmount = soldVentas.reduce((sum: number, v: any) => sum + (v.precio_venta || 0), 0);
  
  // Calculate absorption rate (sales per month)
  const projectStartDate = new Date('2023-01-01');
  const currentDate = new Date();
  const monthsElapsed = Math.max(1, 
    (currentDate.getFullYear() - projectStartDate.getFullYear()) * 12 + 
    (currentDate.getMonth() - projectStartDate.getMonth())
  );
  const absorptionRate = totalSales / monthsElapsed;

  if (error) {
    return (
      <AppLayout user={user}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2 font-semibold">Error al cargar los datos</p>
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
              Ventas
            </h1>
            <p className="text-muted-foreground mt-1">
              Registro y seguimiento de ventas por proyecto
            </p>
          </div>
          
          <Button size="lg" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Nueva Venta
          </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avance de Ventas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSales}</div>
                  <p className="text-xs text-muted-foreground">
                    de {totalUnitsInProject} unidades ({salesPercentage}%)
                  </p>
                  <div className="mt-2 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(salesPercentage, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalVentasAmount)}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalSales} unidades vendidas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absorción</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{absorptionRate.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    unidades/mes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUnitsInProject - totalSales}</div>
                  <p className="text-xs text-muted-foreground">
                    unidades restantes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Ventas Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registro de Ventas</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ventas.length} ventas registradas
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Precio Lista</TableHead>
                      <TableHead>Precio Venta</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ventas.map((venta: any) => (
                      <TableRow key={venta.id_venta}>
                        <TableCell>
                          <div className="font-medium">
                            {venta.clientes?.nombre_cliente || `Cliente ${venta.inventario?.num_unidad || venta.id_cliente}`}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {venta.inventario?.num_unidad}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {venta.categoria || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {venta.precio_lista ? formatCurrency(venta.precio_lista) : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(venta.precio_venta)}
                        </TableCell>
                        <TableCell>
                          {formatDate(new Date(venta.fecha_venta))}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={(venta.estatus === 'Vendida' || venta.estatus === 'Liquidado') ? 'default' : 'destructive'}
                            className={
                              (venta.estatus === 'Vendida' || venta.estatus === 'Liquidado') 
                                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100' 
                                : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
                            }
                          >
                            {venta.estatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {ventas.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No hay ventas registradas</h3>
                    <p className="text-muted-foreground mb-4">
                      Comienza agregando tu primera venta
                    </p>
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Registrar Venta
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Selecciona un proyecto</h3>
            <p className="text-muted-foreground">
              Elige un proyecto para ver el registro de ventas
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}