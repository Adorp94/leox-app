"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  CheckCircle2,
  Clock,
  Search,
  AlertCircle,
  Eye,
} from "lucide-react"

export default function Cobranza2Page() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cobranza</h1>
          <p className="text-muted-foreground">
            Control y seguimiento de pagos por proyecto
          </p>
        </div>
      </div>

      {/* Project Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="project-select" className="text-sm font-medium">
              Proyecto:
            </Label>
            <Select defaultValue="cassia">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecciona un proyecto..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cassia">Cassia</SelectItem>
                <SelectItem value="remodela">Remodela</SelectItem>
                <SelectItem value="proyecto3">Proyecto 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$153,629,833</div>
            <p className="text-xs text-muted-foreground">
              1546 pagos completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">$170,808,602</div>
            <p className="text-xs text-muted-foreground">
              106 pagos pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1</div>
            <p className="text-xs text-muted-foreground">
              $40,000 vencido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Registro de Cobranza</CardTitle>
              <p className="text-sm text-muted-foreground">
                1652 registros de pago
              </p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pagos..."
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              {/* Client Filter */}
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos los clientes</SelectItem>
                  <SelectItem value="alberto">Alberto del Río Ruiz</SelectItem>
                  <SelectItem value="maria">María González</SelectItem>
                  <SelectItem value="carlos">Carlos Mendoza</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="todos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="todos">Todos (1652)</TabsTrigger>
              <TabsTrigger value="pagados">Pagados (1546)</TabsTrigger>
              <TabsTrigger value="pendientes">Pendientes (106)</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="space-y-4">
              <div className="rounded-md">
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
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Alberto del Río Ruiz</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>A-101</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Enganche</Badge>
                      </TableCell>
                      <TableCell>$50,000</TableCell>
                      <TableCell>2024-03-15</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Pagado
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell className="font-medium">María González</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>B-205</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Mensualidad</Badge>
                      </TableCell>
                      <TableCell>$25,000</TableCell>
                      <TableCell>2024-03-20</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Pagar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Carlos Mendoza</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>C-102</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Enganche</Badge>
                      </TableCell>
                      <TableCell>$40,000</TableCell>
                      <TableCell>2024-02-10</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Vencido
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            Pagar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pagados">
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">Pagos Completados</h3>
                <p className="text-muted-foreground">
                  Aquí se mostrarán solo los pagos completados
                </p>
              </div>
            </TabsContent>

            <TabsContent value="pendientes">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-amber-600" />
                <h3 className="text-lg font-semibold mb-2">Pagos Pendientes</h3>
                <p className="text-muted-foreground">
                  Aquí se mostrarán solo los pagos pendientes
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}