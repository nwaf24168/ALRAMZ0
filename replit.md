# Real Estate Performance Analytics Platform - Al-Ramz Real Estate

## Overview

This is a comprehensive real estate performance analytics platform built for Al-Ramz Real Estate Company. The system provides a complete dashboard for tracking and analyzing key performance indicators (KPIs), managing customer complaints, handling property bookings, and monitoring customer service metrics with an Arabic-first interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Arabic font support (Cairo, Tajawal)
- **State Management**: React Context API with custom providers
- **Data Fetching**: TanStack React Query for server state management
- **Routing**: React Router with hash-based routing for compatibility
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite with TypeScript support

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM with schema-first approach
- **Authentication**: Custom JWT-based authentication
- **Real-time**: Supabase real-time subscriptions

### Database Architecture
- **Primary Database**: Supabase (PostgreSQL)
- **Schema Management**: Drizzle with migration files
- **Row Level Security**: Enabled on all tables
- **Real-time Updates**: Supabase real-time for live data sync

## Key Components

### 1. Metrics Management System
- **Weekly/Yearly KPIs**: 15 different performance indicators
- **Customer Service Data**: Call volumes, maintenance requests, inquiries
- **Satisfaction Tracking**: NPS scores, maintenance satisfaction, delivery quality
- **Real-time Updates**: Live data synchronization across all clients

### 2. Complaint Management System
- **CRUD Operations**: Create, read, update, delete complaints
- **Status Tracking**: Multiple status levels with priority management
- **History Tracking**: Complete audit trail of all changes
- **Email Notifications**: Automated notifications for new/updated complaints

### 3. Booking Management (Delivery System)
- **Three-Stage Process**: Sales → Project Management → Customer Service
- **Status Tracking**: Real-time booking status updates
- **Analytics Dashboard**: Performance metrics and completion rates
- **Data Import/Export**: Excel integration for bulk operations

### 4. Reception Management
- **Visitor Records**: Track office visitors and appointments
- **Quality Calls**: Monitor and evaluate customer service calls
- **Customer Interaction**: Manage various customer touchpoints

### 5. User Management & Permissions
- **Role-based Access**: Admin, Manager, Employee roles
- **Granular Permissions**: Page-level and operation-level controls
- **User Administration**: Create, update, delete user accounts

## Data Flow

### 1. Authentication Flow
```
Login → JWT Token → Context Storage → Protected Routes
```

### 2. Data Management Flow
```
User Input → Form Validation → API Call → Database Update → Real-time Sync → UI Update
```

### 3. Real-time Updates Flow
```
Database Change → Supabase Real-time → WebSocket → Context Update → Component Re-render
```

## External Dependencies

### Core Dependencies
- **@supabase/supabase-js**: Database and real-time functionality
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation
- **@radix-ui/react-***: UI component primitives
- **recharts**: Data visualization
- **date-fns**: Date manipulation
- **clsx**: Conditional class names
- **tailwind-merge**: Tailwind class merging

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tailwindcss**: Styling framework
- **drizzle-orm**: Database ORM
- **tsx**: TypeScript execution

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20
- **Database**: Supabase PostgreSQL
- **Port**: 5000 (configurable)
- **Hot Reload**: Vite HMR enabled

### Production Deployment
- **Build Process**: `npm run build` - Vite builds frontend, esbuild bundles backend
- **Deployment Targets**: 
  - Vercel (configured with vercel.json)
  - Generic Node.js hosting
  - Replit production mode
- **Environment Variables**: Supabase credentials, database URL, JWT secrets

### Database Management
- **Migrations**: Automated via Drizzle Kit
- **Schema**: Version-controlled in `shared/schema.ts`
- **Seeds**: Initial data via migration files
- **Backup**: Supabase automated backups

## Changelog

- June 26, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.