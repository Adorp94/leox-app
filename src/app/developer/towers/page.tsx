'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Building2, 
  Eye,
  Home,
  Users
} from 'lucide-react';
import { 
  formatCurrency, 
  formatDate, 
  getUnitStatusColor,
  getUnitStatusText
} from '@/lib/format';
import { 
  mockUsers, 
  mockTowers,
  mockUnits
} from '@/lib/mock-data';

export default function DeveloperTowersPage() {
  // Simular usuario desarrollador (en producción vendría de autenticación)
  const user = mockUsers[2]; // Carlos Rodríguez

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Producto</h1>
          <p className="text-gray-600">Lista de precios y administración de fases</p>
        </div>

        {/* Towers Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockTowers.map((tower) => {
            const towerUnits = mockUnits.filter(unit => unit.tower === tower.name);
            const soldUnits = towerUnits.filter(unit => unit.status === 'sold');
            const availableUnits = towerUnits.filter(unit => unit.status === 'available');
            const reservedUnits = towerUnits.filter(unit => unit.status === 'reserved');
            const salesProgress = (soldUnits.length / towerUnits.length) * 100;
            const totalValue = towerUnits.reduce((sum, unit) => sum + unit.price, 0);
            const soldValue = soldUnits.reduce((sum, unit) => sum + unit.price, 0);

            return (
              <Card key={tower.id} className="card-hover">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Building2 className="h-6 w-6" />
                        <span>{tower.name}</span>
                      </CardTitle>
                      <CardDescription>
                        {towerUnits.length} unidades totales
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progreso de Ventas</span>
                      <span>{Math.round(salesProgress)}%</span>
                    </div>
                    <Progress value={salesProgress} className="h-3" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">{soldUnits.length}</p>
                      <p className="text-xs text-green-700">Vendidas</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">{availableUnits.length}</p>
                      <p className="text-xs text-blue-700">Disponibles</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-lg font-bold text-yellow-600">{reservedUnits.length}</p>
                      <p className="text-xs text-yellow-700">Reservadas</p>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valor Total de Inventario</span>
                      <span className="font-semibold">{formatCurrency(totalValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valor Vendido</span>
                      <span className="font-semibold text-green-600">{formatCurrency(soldValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fecha de Entrega</span>
                      <span className="font-semibold text-blue-600">{formatDate(tower.deliveryDate)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Unit Details by Tower */}
        {mockTowers.map((tower) => {
          const towerUnits = mockUnits.filter(unit => unit.tower === tower.name);
          
          return (
            <Card key={`units-${tower.id}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="h-5 w-5" />
                  <span>Unidades - {tower.name}</span>
                </CardTitle>
                <CardDescription>
                  Detalle de todas las unidades en {tower.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Piso</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Características</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Entrega</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {towerUnits
                      .sort((a, b) => a.number.localeCompare(b.number))
                      .map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">{unit.number}</TableCell>
                          <TableCell>{unit.floor}</TableCell>
                          <TableCell>{unit.area} m²</TableCell>
                          <TableCell>
                            <div className="flex space-x-4 text-xs text-gray-600">
                              <span>{unit.bedrooms} rec</span>
                              <span>{unit.bathrooms} baños</span>
                              <span>{unit.parking} est</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(unit.price)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getUnitStatusColor(unit.status)}>
                              {getUnitStatusText(unit.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(unit.deliveryDate)}
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Resumen General del Proyecto</span>
            </CardTitle>
            <CardDescription>
              Estadísticas consolidadas de todas las torres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{mockUnits.length}</p>
                <p className="text-sm text-gray-600">Total de Unidades</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {mockUnits.filter(u => u.status === 'sold').length}
                </p>
                <p className="text-sm text-green-700">Unidades Vendidas</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {mockUnits.filter(u => u.status === 'available').length}
                </p>
                <p className="text-sm text-blue-700">Unidades Disponibles</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(mockUnits.reduce((sum, unit) => sum + unit.price, 0))}
                </p>
                <p className="text-sm text-purple-700">Valor Total Inventario</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 