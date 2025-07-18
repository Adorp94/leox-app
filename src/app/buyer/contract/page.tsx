'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Calendar,
  User,
  Home,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatDateLong } from '@/lib/format';
import { mockUsers, getContractByBuyer, getUnitByContract } from '@/lib/mock-data';

export default function BuyerContractPage() {
  // Simular usuario comprador (en producción vendría de autenticación)
  const user = mockUsers[0]; // Juan Pérez
  const contract = getContractByBuyer(user.id);
  const unit = contract ? getUnitByContract(contract.id) : null;

  if (!contract || !unit) {
    return (
      <AppLayout user={user}>
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No se encontró información del contrato</h2>
          <p className="text-gray-600">No tienes un contrato activo en este momento.</p>
        </div>
      </AppLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Contrato</h1>
            <p className="text-gray-600">Detalles y documentación de tu contrato de compraventa</p>
          </div>
          <Badge className={getStatusColor(contract.status)}>
            {getStatusText(contract.status)}
          </Badge>
        </div>

        {/* Contract Overview */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <FileText className="h-6 w-6" />
              <span>Contrato #{contract.id.toUpperCase()}</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Contrato de compraventa para la unidad {unit.number} en {unit.tower}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-700">Valor Total del Contrato</p>
                <p className="text-3xl font-bold text-blue-900">{formatCurrency(contract.totalAmount)}</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Descargar Contrato
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contract Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información del Comprador</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                <p className="text-lg font-semibold text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ID del Contrato</p>
                <p className="text-lg font-semibold text-gray-900 font-mono">{contract.id.toUpperCase()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Información de la Propiedad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Unidad</p>
                <p className="text-lg font-semibold text-gray-900">{unit.number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Torre</p>
                <p className="text-lg font-semibold text-gray-900">{unit.tower}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Área</p>
                <p className="text-lg font-semibold text-gray-900">{unit.area} m²</p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Términos Financieros</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Precio Total</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(contract.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Enganche</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(contract.downPayment)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Financiamiento</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(contract.financingAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Fechas Importantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Firma</p>
                <p className="text-lg font-semibold text-gray-900">{formatDateLong(contract.contractDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Entrega Estimada</p>
                <p className="text-lg font-semibold text-blue-600">{formatDateLong(contract.deliveryDate)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Terms and Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Términos y Condiciones</CardTitle>
            <CardDescription>
              Principales cláusulas y condiciones del contrato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Obligaciones del Comprador</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Realizar pagos según calendario establecido</li>
                  <li>• Mantener actualizada información de contacto</li>
                  <li>• Cumplir con reglamento interno del desarrollo</li>
                  <li>• Notificar cambios en situación financiera</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Obligaciones del Desarrollador</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Entregar la unidad en fecha establecida</li>
                  <li>• Mantener calidad según especificaciones</li>
                  <li>• Proporcionar servicios comunes</li>
                  <li>• Garantías de construcción por 2 años</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos y Acciones</CardTitle>
            <CardDescription>
              Descarga documentos importantes y realiza gestiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Contrato Original
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Estado de Cuenta
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Anexos y Modificaciones
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 