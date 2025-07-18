# VazCRM - Sistema de Control de Contratos Inmobiliarios

## 📋 Descripción

VazCRM es un sistema integral para el control de contratos y cobranza de proyectos inmobiliarios en preventa, diseñado específicamente para desarrolladores y compradores de vivienda vertical residencial.

## 🚀 Características Principales

### Para Compradores
- **Vista de Unidad**: Información completa de la propiedad con características, imágenes y detalles
- **Gestión de Contrato**: Visualización del contrato, términos y condiciones, descarga de documentos
- **Estado de Pagos**: Seguimiento detallado del plan de pagos, historial y próximos vencimientos
- **Dashboard Personal**: Resumen del progreso de pagos y estado general

### Para Desarrolladores
- **Dashboard Ejecutivo**: Métricas clave, KPIs de ventas y cobranza en tiempo real
- **Gestión de Torres**: Control visual de inventario por torre con progreso de ventas
- **Registro de Ventas**: Listado completo de ventas con filtros y búsqueda avanzada
- **Control de Pagos**: Seguimiento de cobranza, vencimientos y estados de cuenta
- **Gestión de Contratos**: Administración centralizada de todos los contratos

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Íconos**: Lucide React
- **Formateo de Fechas**: date-fns
- **Validación**: Zod
- **Formularios**: React Hook Form

## 🎨 Diseño

La interfaz está inspirada en el diseño limpio y moderno de OpenAI y Apple, priorizando:
- Tipografía clara y legible
- Espaciado consistente
- Colores neutros con acentos funcionales
- Componentes reutilizables
- Experiencia responsive

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── buyer/             # Páginas del comprador
│   │   ├── unit/          # Vista de unidad
│   │   ├── contract/      # Información del contrato
│   │   └── payments/      # Estado de pagos
│   ├── developer/         # Páginas del desarrollador
│   │   ├── page.tsx       # Dashboard principal
│   │   ├── sales/         # Registro de ventas
│   │   ├── towers/        # Gestión de torres
│   │   ├── payments/      # Control de cobranza
│   │   └── contracts/     # Gestión de contratos
│   └── page.tsx           # Landing page
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base de shadcn/ui
│   └── layout/           # Componentes de layout
├── lib/                  # Utilidades y configuración
│   ├── mock-data.ts      # Datos de ejemplo
│   ├── format.ts         # Funciones de formateo
│   └── utils.ts          # Utilidades generales
└── types/                # Definiciones TypeScript
    └── index.ts          # Tipos principales
```

## 🗃️ Modelo de Datos

### Entidades Principales

- **User**: Información de usuarios (compradores y desarrolladores)
- **Unit**: Detalles de unidades inmobiliarias
- **Contract**: Contratos de compraventa
- **Payment**: Pagos individuales y plan de pagos
- **Tower**: Información de torres del proyecto
- **Sale**: Registro de ventas realizadas

### Relaciones

- Un contrato pertenece a una unidad y un comprador
- Los pagos están asociados a un contrato específico
- Las unidades pertenecen a una torre
- Las ventas conectan compradores con unidades

## 🚦 Instalación y Ejecución

### Requisitos Previos

- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd vaz
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🔗 Navegación

### Accesos Rápidos desde Landing Page

- **Portal del Comprador**: `/buyer/unit`
- **Dashboard del Desarrollador**: `/developer`

### Rutas Principales

#### Comprador
- `/buyer/unit` - Información de la unidad
- `/buyer/contract` - Detalles del contrato
- `/buyer/payments` - Estado de pagos

#### Desarrollador
- `/developer` - Dashboard principal
- `/developer/sales` - Registro de ventas
- `/developer/towers` - Gestión de torres
- `/developer/payments` - Control de cobranza
- `/developer/contracts` - Gestión de contratos

## 💾 Datos de Ejemplo

La aplicación incluye datos de muestra que representan:

- **2 Torres**: Torre A y Torre B
- **4 Unidades**: Con diferentes características y estados
- **2 Compradores**: Con contratos activos
- **1 Desarrollador**: Con acceso completo al sistema
- **Múltiples Pagos**: Con diferentes estados y fechas

## 🎯 Funcionalidades Clave

### Dashboard del Desarrollador
- Métricas de ventas en tiempo real
- Progreso de cobranza
- Alertas de pagos vencidos
- Resumen por torres
- Actividad reciente

### Portal del Comprador
- Vista detallada de la unidad adquirida
- Progreso del plan de pagos
- Historial de transacciones
- Descarga de documentos
- Próximos vencimientos

### Gestión de Torres
- Vista consolidada por torre
- Progreso de ventas por torre
- Inventario disponible
- Fechas de entrega
- Métricas financieras

## 🔮 Futuras Mejoras

- Autenticación real con NextAuth.js
- Base de datos con Prisma + PostgreSQL
- Notificaciones push y email
- Reportes PDF generados dinámicamente
- Dashboard con gráficos interactivos (Recharts)
- Sistema de pagos integrado
- Portal de documentos con firma digital
- App móvil con React Native

## 📝 Notas de Desarrollo

- Los datos actualmente son mock data para demostración
- La aplicación está preparada para integrar un backend real
- El diseño es completamente responsive
- Todos los componentes son tipados con TypeScript
- La estructura permite escalabilidad fácil

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

**VazCRM** - Transformando la gestión inmobiliaria con tecnología moderna 🏗️✨
