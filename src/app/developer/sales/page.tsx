'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart,
  DollarSign,
  ArrowRight,
  FileText,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { mockUsers } from '@/lib/mock-data';

export default function DeveloperSalesPage() {
  const user = mockUsers[2]; // Developer user

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Ventas y Cobranza
          </h1>
          <p className="text-xl text-muted-foreground">
            Gestiona tus operaciones de ventas y cobranza de manera eficiente
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Ventas</CardTitle>
                  <p className="text-muted-foreground">
                    Registro y seguimiento de ventas
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Registro de ventas por proyecto</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">KPIs de absorción y avance</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Control de inventario vendido</span>
                </div>
              </div>
              
              <Button asChild className="w-full group">
                <Link href="/developer/ventas">
                  Ir a Ventas
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Cobranza</CardTitle>
                  <p className="text-muted-foreground">
                    Control y seguimiento de pagos
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Seguimiento de pagos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Alertas de vencimientos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Reportes de cobranza</span>
                </div>
              </div>
              
              <Button asChild className="w-full group" variant="outline">
                <Link href="/developer/cobranza">
                  Ir a Cobranza
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Acceso Rápido</CardTitle>
              <p className="text-sm text-muted-foreground">
                Navega directamente a las secciones más utilizadas
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button asChild variant="outline" className="h-auto py-4 px-4">
                  <Link href="/developer/ventas" className="flex flex-col items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium">Nueva Venta</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto py-4 px-4">
                  <Link href="/developer/cobranza" className="flex flex-col items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <span className="text-sm font-medium">Registrar Pago</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto py-4 px-4">
                  <Link href="/developer/cobranza" className="flex flex-col items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm font-medium">Pagos Vencidos</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto py-4 px-4">
                  <Link href="/developer" className="flex flex-col items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}