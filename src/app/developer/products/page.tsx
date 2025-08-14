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
  Home,
  TrendingUp,
  Package,
  Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  formatCurrency, 
  formatDate
} from '@/lib/format';
import { mockUsers } from '@/lib/mock-data';
import { 
  inventarioService, 
  InventarioRecord,
  proyectosService,
  ProyectoRecord,
  ventasService
} from '@/lib/supabase';

export default function DeveloperProductsPage() {
  const user = mockUsers[2]; // Developer user
  
  // State management
  const [projects, setProjects] = useState<ProyectoRecord[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [inventario, setInventario] = useState<InventarioRecord[]>([]);
  const [ventas, setVentas] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await proyectosService.getProyectos();
        setProjects(projectsData);
        
        // Auto-select first project or load from localStorage
        const savedProject = localStorage.getItem('selectedProjectProducts');
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
        localStorage.setItem('selectedProjectProducts', selectedProject.toString());
        
        const [inventarioData, ventasData] = await Promise.all([
          inventarioService.getInventarioByProject(selectedProject),
          ventasService.getVentasContratosByProject(selectedProject)
        ]);
        
        setInventario(inventarioData);
        setVentas(ventasData);
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
  const totalUnits = inventario.length;
  const soldUnits = inventario.filter(unit => {
    const venta = ventas.find((v: any) => v.inventario?.num_unidad === unit.num_unidad);
    return venta && ((venta as any).estatus === 'Vendida' || (venta as any).estatus === 'Liquidado');
  }).length;
  const availableUnits = totalUnits - soldUnits;
  const salesPercentage = totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0;
  
  // Calculate average price per m2 from sold units
  const soldUnitsWithPrices = ventas.filter((v: any) => v.precio_venta && v.inventario?.num_unidad);
  const totalSalesValue = soldUnitsWithPrices.reduce((sum: number, v: any) => {
    return sum + (v.precio_venta || 0);
  }, 0);

  if (error) {
    return (
      <AppLayout user={user}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Package className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
              Inventario
            </h1>
            <p className="text-muted-foreground mt-1">
              Administración y seguimiento de unidades por proyecto
            </p>
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
                  {[...Array(8)].map((_, i) => (
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
                  <CardTitle className="text-sm font-medium">Total Unidades</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUnits}</div>
                  <p className="text-xs text-muted-foreground">
                    unidades en inventario
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendidas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{soldUnits}</div>
                  <p className="text-xs text-muted-foreground">
                    {salesPercentage}% del inventario
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{availableUnits}</div>
                  <p className="text-xs text-muted-foreground">
                    unidades disponibles
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Vendido</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalSalesValue)}</div>
                  <p className="text-xs text-muted-foreground">
                    {soldUnitsWithPrices.length} unidades
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Inventory Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inventario de Unidades</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {inventario.length} unidades registradas
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Área Total</TableHead>
                      <TableHead>Área Interior</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Precio Venta</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventario
                      .sort((a, b) => (a.num_unidad || '').localeCompare(b.num_unidad || ''))
                      .map((unit) => {
                        // Find if this unit has been sold
                        const venta = ventas.find((v: any) => v.inventario?.num_unidad === unit.num_unidad);
                        const isSold = venta && ((venta as any).estatus === 'Vendida' || (venta as any).estatus === 'Liquidado');
                        const salePrice = (venta as any)?.precio_venta;
                        
                        return (
                          <TableRow key={unit.id_inventario}>
                            <TableCell className="font-medium font-mono">
                              {unit.num_unidad}
                            </TableCell>
                            <TableCell>
                              {unit.nivel || '-'}
                            </TableCell>
                            <TableCell>
                              {unit.m2_total ? `${unit.m2_total} m²` : '-'}
                            </TableCell>
                            <TableCell>
                              {unit.m2_interior ? `${unit.m2_interior} m²` : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={isSold ? 'default' : 'secondary'}
                                className={
                                  isSold 
                                    ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100' 
                                    : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100'
                                }
                              >
                                {isSold ? 'Vendida' : 'Disponible'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {salePrice ? formatCurrency(salePrice) : '-'}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                {inventario.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No hay unidades registradas</h3>
                    <p className="text-muted-foreground mb-4">
                      Este proyecto no tiene unidades en el inventario
                    </p>
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
              Elige un proyecto para ver el inventario de unidades
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}