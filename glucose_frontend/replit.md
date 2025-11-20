# Blood Sugar Monitoring System

## Overview

A comprehensive healthcare web application for continuous glucose monitoring and management. The system provides role-based dashboards for patients, specialists, staff, and administrators to track blood sugar readings, analyze trends, generate AI-powered recommendations, and manage patient care. Built with a modern tech stack focusing on medical-grade data visualization and professional healthcare UX.

## Current Status

**✅ Frontend Complete** (November 20, 2025)
- All 5 pages implemented: Landing page with authentication, Patient Dashboard, Specialist Dashboard, Staff Dashboard, Admin Dashboard
- Role-based authentication with proper route protection and automatic dashboard redirects
- Comprehensive data-testid attributes for testing coverage
- Professional medical design with teal/blue color palette following design guidelines
- End-to-end testing verified: authentication flows, role-based access control, dashboard navigation, and core features
- Using mock data throughout for demonstration (backend integration ready when needed)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast HMR and optimized production builds
- Wouter for lightweight client-side routing (alternative to React Router)
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

**UI Component System**
- Shadcn UI component library (New York variant) with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Component library includes 40+ pre-built, accessible components (forms, dialogs, tables, charts, navigation)
- Design system follows medical professional interface guidelines emphasizing trust, data clarity, and WCAG AA compliance

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- Context API for authentication state (`AuthContext`)
- Local storage for session persistence and user data in development

**Visualization**
- Recharts library for blood sugar trend charts and data visualization
- Custom `BloodSugarChart` component for 7-day glucose trend analysis
- Responsive chart containers with medical-themed color schemes

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server framework
- Node.js runtime with ES modules (type: "module")
- TypeScript for type safety across client and server

**Current Storage Strategy**
- In-memory storage implementation (`MemStorage` class) for development
- Interface-based storage abstraction (`IStorage`) allowing easy swap to database implementation
- Designed for migration to PostgreSQL with Drizzle ORM

**API Design**
- RESTful API with `/api` prefix for all application routes
- Request/response logging middleware for debugging
- JSON body parsing with raw body preservation for webhook support
- Session management ready (connect-pg-simple imported)

**Development Tooling**
- Hot module replacement via Vite middleware in development
- Custom error overlay for runtime errors (Replit integration)
- Separate development and production build scripts

### Data Model & Schema

**Database Schema (Drizzle ORM)**
- PostgreSQL dialect with UUID primary keys
- Three core tables:
  - `profiles`: User accounts with role-based access (patient, specialist, staff, administrator)
  - `bloodSugarReadings`: Glucose measurements with timestamps, categories, context (food, activity, notes)
  - `recommendations`: AI and specialist advice linked to patients

**Type Safety**
- Drizzle-Zod integration for runtime validation schemas
- Shared TypeScript types between client and server (`@shared/schema`)
- Centralized constants for roles and dashboard routes

**Authentication Model**
- Role-based access control (RBAC) with four distinct user types
- Protected routes with role validation and automatic redirects
- Session-based authentication prepared for Supabase or custom implementation

### Role-Based Dashboard System

**Four Distinct User Interfaces**
- **Patient Dashboard**: View personal readings, trends, recommendations; submit new blood sugar data
- **Specialist Dashboard**: Monitor multiple patients, filter by status, send professional recommendations
- **Staff Dashboard**: Manage patient records, configure system settings (glucose thresholds)
- **Admin Dashboard**: User management, system-wide reports, analytics

**Navigation Architecture**
- Sidebar navigation component (`AppSidebar`) with role-specific menu items
- Responsive design with mobile sheet drawer and desktop persistent sidebar
- Centralized route mapping (`ROLE_DASHBOARDS` constant) for maintainability

### Design System Implementation

**Typography & Spacing**
- Professional medical font stack with system fonts
- Consistent spacing scale (4, 6, 8, 12, 16px units)
- Monospace fonts for precise numerical glucose data

**Color System**
- HSL-based color tokens for light/dark mode support
- Medical-appropriate color palette emphasizing trust and clarity
- Chart-specific color variables for data visualization consistency

**Component Patterns**
- Card-based layouts for data grouping
- Stat cards with icons, values, and trend indicators
- Form components with comprehensive validation
- Table components for patient lists and records

## External Dependencies

### UI & Component Libraries
- **Radix UI**: Unstyled, accessible component primitives (20+ packages for dialogs, dropdowns, navigation, etc.)
- **Shadcn UI**: Pre-styled component system built on Radix
- **Lucide React**: Icon library for medical and interface icons
- **Recharts**: Charting library for blood sugar trend visualization
- **Embla Carousel**: Carousel/slider component

### Utility Libraries
- **class-variance-authority**: Type-safe CSS class composition
- **clsx & tailwind-merge**: Conditional className utilities
- **date-fns**: Date formatting and manipulation
- **nanoid**: Unique ID generation

### Form Management
- **React Hook Form**: Form state and validation
- **@hookform/resolvers**: Validation schema resolvers
- **Zod**: Runtime type validation and schema definition

### Database & ORM
- **Drizzle ORM**: Type-safe SQL query builder and ORM
- **Drizzle Kit**: Database migration tools
- **Drizzle Zod**: Schema to Zod validator generator
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver (prepared but not yet connected)
- **connect-pg-simple**: PostgreSQL session store for Express (imported but not configured)

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production server
- **Replit Plugins**: Runtime error modal, cartographer, dev banner (development environment integration)

### Planned Integrations
- PostgreSQL database connection (Drizzle schema defined, migration files ready)
- Session management with PostgreSQL store
- Potential AI service integration for recommendation generation (structure prepared in schema)
- External health data APIs (structure supports contextual data like food intake, activity)

## Recent Changes

### November 20, 2025
- **Centralized Role Dashboard Mapping**: Created `shared/constants.ts` with `ROLE_DASHBOARDS` constant used across App.tsx and landing.tsx to eliminate code duplication
- **Enhanced Route Protection**: ProtectedRoute component now redirects unauthorized users to their correct role-specific dashboard instead of generic landing page
- **Comprehensive Test Coverage**: Added data-testid attributes to all interactive elements and key data displays (stat card trends, status badges, table cells, recommendation sources)
- **Authentication Flow Fixes**: Sign-in/sign-up now properly retrieve and use user roles from localStorage, ensuring correct dashboard redirects for all 4 user types
- **End-to-End Testing**: Validated complete user flows including sign-up, sign-in, role-based navigation, dashboard features, and access control