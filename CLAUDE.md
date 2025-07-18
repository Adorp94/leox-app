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
- **Mock Data**: All data currently comes from `src/lib/mock-data.ts`
- **Type Safety**: Comprehensive TypeScript interfaces in `src/types/index.ts`
- **Helper Functions**: Data relationship helpers in mock-data.ts (getContractByBuyer, getPaymentsByContract, etc.)

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

### Domain Model

#### Core Entities
- **User**: Supports 'buyer' and 'developer' roles
- **Unit**: Real estate units with detailed specifications
- **Contract**: Links buyers to units with payment terms
- **Payment**: Individual payment records with status tracking
- **Tower**: Groups units with aggregate metrics
- **Sale**: Transaction records

#### Key Business Logic
- Payment plan calculations and status tracking
- Contract-to-unit-to-buyer relationships
- Tower-level sales metrics and inventory management
- Role-based data access patterns

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
├── lib/               # Utilities and mock data
└── types/             # TypeScript type definitions
```

#### State Management
- No global state management (Redux, Zustand) currently implemented
- Mock data provides all application state
- Ready for integration with real backend APIs

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

### Future Integration Points
The codebase is structured to easily integrate:
- Real authentication (NextAuth.js ready)
- Database layer (Prisma + PostgreSQL architecture planned)
- Payment processing systems
- Document management and PDF generation
- Email/SMS notification systems