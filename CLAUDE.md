# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development Server
```bash
npm run dev          # Start development server with turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
Currently no test framework is configured - check with the user for testing preferences if implementing tests.

## Project Architecture

### Core Application Structure
VazCRM is a Next.js 15 application using App Router with TypeScript for real estate contract management. The system serves two primary user roles:

- **Buyers**: View unit details, contract information, and payment status
- **Developers**: Manage sales, towers, payments, and contracts with comprehensive dashboards

### Key Architectural Patterns

#### Role-Based Route Structure
```
/buyer/*      # Buyer portal routes
/developer/*  # Developer dashboard routes  
```

#### Data Layer Architecture
- **Supabase Integration**: Full PostgreSQL database integration via Supabase
- **Real-time Data**: Live payment, sales, and inventory management
- **Database Views**: Optimized views (vw_historial_pagos, vw_cliente_panel, vw_dashboard_remodela) for complex queries
- **Type Safety**: Comprehensive TypeScript interfaces in `src/lib/supabase.ts`
- **Batch Loading**: Handles large datasets with pagination to overcome 1000-row limits

#### Component Architecture
- **shadcn/ui**: UI component library with customized styling
- **Layout Components**: Reusable AppLayout and Sidebar components
- **Role-Based Navigation**: Sidebar adapts based on user role

### Technology Stack Integration

#### UI Framework
- **shadcn/ui**: New York style, neutral base color
- **Tailwind CSS**: Utility-first styling with CSS variables
- **Lucide React**: Icon library
- **Radix UI**: Accessible component primitives

#### Form Handling
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Form validation integration

#### Data Visualization
- **Recharts**: Chart library for dashboard metrics
- **date-fns**: Date formatting and manipulation

#### Database Integration
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Database Functions**: Custom RPC functions for complex aggregations
- **Migration System**: Structured database schema with proper relationships
- **Performance**: Optimized queries with batch loading for large datasets

### Domain Model

#### Core Entities
- **Desarrollador**: Developer entities managing multiple projects
- **Proyecto**: Real estate projects with inventory tracking
- **Inventario**: Individual units with specifications and availability status
- **Clientes**: Customer records with contact information
- **Ventas_Contratos**: Sales contracts linking clients to units
- **Venta_Pagos**: Payment records with status tracking and due dates

#### Key Business Logic
- **Payment Status Management**: Automated categorization based on due dates
  - `fecha_pago`: Due date given to client
  - `fecha_vencimiento`: Actual payment date (when paid)
  - Status logic: payments due before current date = "Pagado", future dates = "Pendiente"
- **Sales Pipeline**: Complete contract-to-payment tracking
- **Inventory Management**: Real-time unit availability and status
- **Multi-Project Support**: Developer dashboard aggregating across projects

### Development Patterns

#### File Organization
```
src/
├── app/                 # Next.js App Router pages
│   ├── buyer/          # Buyer-specific routes
│   ├── developer/      # Developer-specific routes
│   └── page.tsx        # Landing page
├── components/
│   ├── ui/            # shadcn/ui components
│   └── layout/        # Layout components
├── lib/               # Utilities and Supabase client
│   ├── supabase.ts   # Database client and service functions
│   ├── mock-data.ts  # Mock data for development (deprecated)
│   └── format.ts     # Formatting utilities
└── types/             # TypeScript type definitions
```

#### State Management
- **Local Component State**: React useState for component-level state
- **Supabase Real-time**: Database subscriptions for live data updates
- **Local Storage**: Persistent user preferences (selected projects, filters)
- **No Global State**: Intentionally simple architecture without Redux/Zustand

#### Styling Approach
- Tailwind CSS with component-level styling
- Consistent design system following clean, modern aesthetics
- Responsive design patterns throughout

### Important Configuration

#### Path Aliases
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/types` → `src/types`

#### Language Settings
- Application is in Spanish (`lang="es"`)
- All UI text and data is in Spanish
- Date formatting uses Spanish locale patterns

### Current Implementation Status

#### Completed Features
- ✅ **Full Database Integration**: Supabase PostgreSQL with comprehensive schema
- ✅ **Developer Dashboard**: Multi-project overview with KPIs and charts
- ✅ **Sales Management**: Complete sales tracking and reporting
- ✅ **Payment Management**: Cobranza system with status tracking
- ✅ **Inventory Tracking**: Real-time unit availability and status
- ✅ **Data Upload System**: Bulk data processing with proper validation

#### Technical Achievements
- ✅ **Large Dataset Handling**: Batch loading to handle 1000+ payment records
- ✅ **Database Views**: Optimized aggregation views for performance
- ✅ **RPC Functions**: Custom database functions for complex operations
- ✅ **Type Safety**: Full TypeScript integration with database types

### Performance Considerations

#### Supabase Limitations & Solutions
- **1000 Row Limit**: Solved with batch loading using `.range()` pagination
- **Complex Aggregations**: Use RPC functions instead of client-side calculations
- **View Performance**: Database views (vw_historial_pagos, vw_dashboard_remodela) for optimized queries

#### Best Practices Implemented
- Batch API calls for large datasets
- Client-side filtering after data load
- Persistent user preferences in localStorage
- Proper error handling and loading states