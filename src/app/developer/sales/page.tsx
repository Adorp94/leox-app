'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Users, 
  Search,
  Filter,
  Eye,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useState } from 'react';
import { 
  formatCurrency, 
  formatDate
} from '@/lib/format';
import { 
  mockUsers, 
  mockSales,
  mockUnits,
  mockPayments
} from '@/lib/mock-data';

export default function DeveloperSalesPage() {
  // Simular usuario desarrollador (en producción vendría de autenticación)
  const user = mockUsers[2]; // Carlos Rodríguez
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [towerFilter, setTowerFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Filtrar ventas
  const filteredSales = mockSales.filter(sale => {
    const unit = mockUnits.find(u => u.id === sale.unitId);
    const matchesSearch = sale.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sale.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          unit?.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchesTower = towerFilter === 'all' || unit?.tower === towerFilter;
    
    // Date filtering
    const matchesDateFrom = !dateFrom || sale.saleDate >= dateFrom;
    const matchesDateTo = !dateTo || sale.saleDate <= dateTo;
    
    return matchesSearch && matchesStatus && matchesTower && matchesDateFrom && matchesDateTo;
  });

  // Calcular métricas
  const totalUnits = mockUnits.length;
  const totalSales = mockSales.length;
  const salesPercentage = Math.round((totalSales / totalUnits) * 100);
  
  // Cálculos de cobranza
  const totalCollected = mockPayments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = mockPayments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Cálculo de absorción (unidades por mes)
  const projectStartDate = new Date('2024-01-01'); // Fecha de inicio del proyecto
  const currentDate = new Date();
  const monthsElapsed = Math.max(1, 
    (currentDate.getFullYear() - projectStartDate.getFullYear()) * 12 + 
    (currentDate.getMonth() - projectStartDate.getMonth())
  );
  const absorptionRate = totalSales / monthsElapsed;

  // Obtener torres únicas
  const towers = [...new Set(mockUnits.map(unit => unit.tower))];

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Ventas</h1>
          <p className="text-gray-600">Control y seguimiento de ventas</p>
        </div>

        {/* Sales Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avance de Ventas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales} de {totalUnits} vendidas</div>
              <p className="text-xs text-muted-foreground">
                ({salesPercentage}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalSales}</div>
              <p className="text-xs text-muted-foreground">
                Total de ventas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobranza</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCollected)}</div>
              <p className="text-xs text-muted-foreground">
                y {formatCurrency(totalPending)} por cobrar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absorción</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{absorptionRate.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                unidades por mes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros y Búsqueda</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente, email o unidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full md:w-48">
                      <Calendar className="h-4 w-4 mr-2" />
                      {dateFrom ? formatDate(dateFrom) : "Fecha desde"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full md:w-48">
                      <Calendar className="h-4 w-4 mr-2" />
                      {dateTo ? formatDate(dateTo) : "Fecha hasta"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={towerFilter} onValueChange={setTowerFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Torre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las torres</SelectItem>
                  {towers.map(tower => (
                    <SelectItem key={tower} value={tower}>{tower}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Registro de Ventas</span>
            </CardTitle>
            <CardDescription>
              {filteredSales.length} de {totalSales} ventas mostradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Torre</TableHead>
                  <TableHead>Precio de Venta</TableHead>
                  <TableHead>Fecha de Venta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales
                  .sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime())
                  .map((sale) => {
                    const unit = mockUnits.find(u => u.id === sale.unitId);
                    
                    return (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{sale.buyerName}</p>
                            <p className="text-sm text-gray-500">{sale.buyerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {unit?.number}
                        </TableCell>
                        <TableCell>
                          {unit?.tower}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(sale.salePrice)}
                        </TableCell>
                        <TableCell>
                          {formatDate(sale.saleDate)}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            sale.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }>
                            {sale.status === 'active' ? 'Activo' : 'Completado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              Contrato
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
} 