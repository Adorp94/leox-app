'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  MapPin, 
  Calendar, 
  Square, 
  Car, 
  Bath, 
  Bed,
  Download
} from 'lucide-react';
import { formatCurrency, formatDateLong, getUnitStatusColor, getUnitStatusText } from '@/lib/format';
import { mockUsers, getContractByBuyer, getUnitByContract } from '@/lib/mock-data';

export default function BuyerUnitPage() {
  // Simular usuario comprador (en producción vendría de autenticación)
  const user = mockUsers[0]; // Juan Pérez
  const contract = getContractByBuyer(user.id);
  const unit = contract ? getUnitByContract(contract.id) : null;

  if (!contract || !unit) {
    return (
      <AppLayout user={user}>
        <div className="text-center py-12">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No se encontró información de unidad</h2>
          <p className="text-gray-600">No tienes una unidad asignada en este momento.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Unidad</h1>
            <p className="text-gray-600">Información detallada de tu propiedad</p>
          </div>
          <Badge className={getUnitStatusColor(unit.status)}>
            {getUnitStatusText(unit.status)}
          </Badge>
        </div>

        {/* Unit Image */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-center">
              <Home className="h-16 w-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Imagen de la unidad {unit.number}</p>
            </div>
          </div>
        </Card>

        {/* Unit Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Información General</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Número de Unidad</p>
                  <p className="text-lg font-bold text-gray-900">{unit.number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Piso</p>
                  <p className="text-lg font-bold text-gray-900">{unit.floor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Torre</p>
                  <p className="text-lg font-bold text-gray-900">{unit.tower}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Área</p>
                  <p className="text-lg font-bold text-gray-900">{unit.area} m²</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Square className="h-5 w-5" />
                <span>Características</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <Bed className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{unit.bedrooms}</p>
                  <p className="text-sm text-gray-500">Recámaras</p>
                </div>
                <div className="text-center">
                  <Bath className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{unit.bathrooms}</p>
                  <p className="text-sm text-gray-500">Baños</p>
                </div>
                <div className="text-center">
                  <Car className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{unit.parking}</p>
                  <p className="text-sm text-gray-500">Estacionamiento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>💰</span>
                <span>Información Financiera</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Precio Total</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(unit.price)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Enganche</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(contract.downPayment)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Financiamiento</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(contract.financingAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Fechas Importantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Contrato</p>
                <p className="text-lg font-semibold text-gray-900">{formatDateLong(contract.contractDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Entrega Estimada</p>
                <p className="text-lg font-semibold text-blue-600">{formatDateLong(unit.deliveryDate)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Disponibles</CardTitle>
            <CardDescription>
              Descarga tu contrato y accede a documentos importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Descargar Contrato</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Ver Ubicación</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 