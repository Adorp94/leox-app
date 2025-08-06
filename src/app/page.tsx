'use client';

import Link from 'next/link';
import { Building2, Users, CreditCard, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const features = [
    {
      icon: Building2,
      title: 'Gestión de Torres',
      description: 'Visualiza y administra todas las torres del proyecto con información detallada de unidades'
    },
    {
      icon: Users,
      title: 'Control de Ventas',
      description: 'Registra y da seguimiento a todas las ventas, contratos y clientes'
    },
    {
      icon: CreditCard,
      title: 'Seguimiento de Pagos',
      description: 'Monitorea pagos, genera estados de cuenta y gestiona la cobranza'
    },
    {
      icon: FileText,
      title: 'Documentación',
      description: 'Administra contratos, documentos legales y reportes del proyecto'
    }
  ];

  const benefits = [
    'Control total de inventario y ventas',
    'Automatización de estados de cuenta',
    'Visualización en tiempo real del proyecto',
    'Gestión centralizada de documentos',
    'Reportes detallados de cobranza',
    'Interface moderna y fácil de usar'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-gray-900" />
              <span className="text-2xl font-bold gradient-text">Leox Preventas</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/buyer/unit">
                <Button variant="outline" className="border-gray-300">
                  Acceso Comprador
                </Button>
              </Link>
              <Link href="/developer">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  Acceso Desarrollador
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold gradient-text mb-6">
              Sistema de Control de<br />Contratos Inmobiliarios
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plataforma integral para la gestión de contratos, cobranza y control de proyectos 
              inmobiliarios en preventa. Diseñado para desarrolladores y compradores.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/developer">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                  Comenzar como Desarrollador
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/buyer/unit">
                <Button size="lg" variant="outline" className="border-gray-300">
                  Portal del Comprador
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Funcionalidades Principales
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Herramientas completas para la gestión eficiente de proyectos inmobiliarios
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardHeader className="text-center">
                  <feature.icon className="h-12 w-12 text-gray-900 mx-auto mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir Leox Preventas?
              </h2>
              <p className="text-gray-600 mb-8">
                Diseñado específicamente para el mercado inmobiliario mexicano, 
                Leox Preventas ofrece todas las herramientas necesarias para gestionar 
                proyectos de preventa de manera eficiente y profesional.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Dashboard Desarrollador</h3>
                <p className="text-gray-300 mb-6">
                  Control total de tu proyecto inmobiliario desde una sola plataforma
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="metric-card bg-white/10 border-white/20">
                    <div className="text-2xl font-bold">23</div>
                    <div className="text-sm text-gray-300">Unidades Vendidas</div>
                  </div>
                  <div className="metric-card bg-white/10 border-white/20">
                    <div className="text-2xl font-bold">85%</div>
                    <div className="text-sm text-gray-300">Progreso de Cobranza</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comienza a gestionar tu proyecto hoy
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Únete a los desarrolladores que ya están optimizando sus procesos de venta y cobranza
          </p>
          <Link href="/developer">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              Acceder al Sistema
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-gray-900" />
              <span className="text-lg font-bold text-gray-900">Leox Preventas</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 Leox Preventas. Sistema de gestión inmobiliaria.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
