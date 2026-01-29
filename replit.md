# CycleCal

## Overview

CycleCal is a productivity application that divides the year into 36 cycles of 10 days each (360 days total). Users can set goals for each cycle and day, track tasks, and configure alarm reminders. The application helps maintain focus through short-term goal setting while building long-term momentum.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with hot module replacement

The frontend follows a standard React SPA pattern with pages located in `client/src/pages/` and reusable components in `client/src/components/`. Custom hooks in `client/src/hooks/` abstract API calls using React Query.

### Backend Architecture
- **Framework**: Express.js 5 with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect

The server uses a storage abstraction layer (`server/storage.ts`) that implements an `IStorage` interface, allowing the database implementation to be swapped if needed.

### Data Storage
- **Database**: PostgreSQL
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Managed via Drizzle Kit (`drizzle-kit push`)

Core data models:
- `cycles`: 36 ten-day periods with goals and status tracking
- `days`: Individual days within each cycle (1-10)
- `tasks`: Granular tasks assigned to specific days
- `reminderTemplates`: Pre-filled reminders based on day number (1-10)
- `alarms`: User-configurable notification settings

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod schemas
- `routes.ts`: API route definitions with type-safe input/output schemas

### Build System
- Development: Vite dev server with Express backend middleware
- Production: esbuild bundles server code, Vite builds client to `dist/public`
- The build script (`script/build.ts`) bundles specific dependencies to reduce cold start times

## External Dependencies

### Database
- PostgreSQL (connection via `DATABASE_URL` environment variable)
- `pg` driver for Node.js
- `connect-pg-simple` for session storage capability

### UI Framework
- Radix UI primitives (comprehensive set of accessible components)
- Tailwind CSS for utility-first styling
- Lucide React for icons
- date-fns for date manipulation

### API & Validation
- Zod for runtime type validation on API inputs/outputs
- drizzle-zod for generating Zod schemas from Drizzle tables

### Development Tools
- Vite plugins for Replit integration (error overlay, cartographer, dev banner)
- TypeScript with strict mode enabled