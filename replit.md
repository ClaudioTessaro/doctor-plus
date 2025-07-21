# Medical Clinic Management System (DoctorPlus)

## Overview

DoctorPlus is a comprehensive medical clinic management system built with React frontend and Express backend. The system provides functionality for managing patients, appointments, medical records, inventory, and staff (professionals and secretaries) in a medical clinic environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Context API for authentication and React hooks for local state
- **UI Library**: Radix UI components with Tailwind CSS styling using shadcn/ui design system
- **Build Tool**: Vite for fast development and optimized production builds
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Custom API client with fetch-based requests
- **Icons**: Lucide React for consistent iconography

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema**: Centralized schema definitions in shared directory
- **API Pattern**: RESTful endpoints with standardized error handling
- **Development**: Hot reload with tsx for development server

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express backend API
├── shared/          # Shared types and schemas
├── migrations/      # Database migration files
└── dist/           # Built application output
```

## Key Components

### Authentication System
- Context-based authentication using React Context API
- JWT-like token system (currently using base64 encoding)
- Role-based access control with three user types: ADMIN, PROFISSIONAL, SECRETARIO
- Protected routes with automatic redirection
- Persistent authentication state in localStorage

### Database Schema
The system uses a comprehensive medical schema with the following main entities:
- **Users**: Base user accounts with role-based typing
- **Professionals**: Medical professionals with specializations and CRM numbers
- **Secretaries**: Administrative staff with optional professional associations
- **Patients**: Patient records with complete contact and demographic information
- **Appointments**: Consultation scheduling with status tracking
- **Inventory**: Medical supply and equipment management
- **Medical Records**: Patient history and consultation notes

### API Layer
- Custom API client with automatic token management
- Standardized response handling and error management
- Pagination support for large datasets
- Search and filtering capabilities
- CRUD operations for all major entities

### UI Components
- Modular component architecture with reusable UI elements
- Form components with validation and error handling
- Data tables with pagination, search, and sorting
- Modal dialogs for create/edit operations
- Responsive design optimized for desktop and tablet use

## Data Flow

### Authentication Flow
1. User submits credentials through login form
2. Backend validates credentials against database
3. Token generated and returned to client
4. Client stores token and user data in localStorage
5. API client automatically includes token in subsequent requests
6. Protected routes verify authentication status

### CRUD Operations Flow
1. UI components trigger API calls through the API client
2. Backend routes handle requests with validation
3. Drizzle ORM executes database operations
4. Results returned through standardized response format
5. UI updates with new data and user feedback

### Real-time Updates
- Components refetch data after mutations
- Optimistic updates for better user experience
- Loading states during API operations
- Toast notifications for user feedback

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Database URL**: Required environment variable for connection

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **ESBuild**: Production bundling for backend
- **PostCSS**: CSS processing with Tailwind

## Deployment Strategy

### Development Environment
- Vite development server for frontend with hot reload
- Express server with tsx for backend hot reload
- Automatic error overlay in development
- Cartographer plugin for Replit integration

### Production Build
- Frontend built with Vite to `dist/public`
- Backend compiled with ESBuild to `dist/index.js`
- Static file serving through Express
- Environment-specific configurations

### Database Management
- Schema definitions in TypeScript using Drizzle
- Database migrations managed through Drizzle Kit
- Push-based schema updates with `db:push` command
- Environment variable configuration for database connection

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database (Neon recommended)
- Environment variables: `DATABASE_URL`, `NODE_ENV`
- Static file serving capability for frontend assets

The system is designed for scalability and maintainability, with clear separation of concerns between frontend and backend, type safety throughout, and modern development practices.