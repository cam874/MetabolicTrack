# MedTrack Pro - Weight Loss Tracker

## Overview

MedTrack Pro is a premium weight loss tracking application designed specifically for GLP-1 medication users (Ozempic, Wegovy, Mounjaro, etc.). The application provides comprehensive tracking capabilities for weight entries, medication schedules, injection logs, and progress analytics. Built as a full-stack web application with a mobile-first responsive design, it offers features like medication titration scheduling, injection site tracking, data import from screenshots, detailed progress visualization, comprehensive onboarding flow, weight unit preferences (lbs/kg), and goal prediction algorithms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built using **React 18** with **TypeScript** and follows a component-based architecture. The application uses **Wouter** for lightweight client-side routing and **TanStack Query** for server state management and API interactions. The UI is constructed with **shadcn/ui** components built on top of **Radix UI** primitives, providing accessible and customizable components. Styling is handled through **Tailwind CSS** with a comprehensive design system including custom CSS variables for theming.

### Backend Architecture
The server uses **Express.js** with TypeScript in ESM module format. It implements a RESTful API architecture with structured route handlers for different resource types (weight entries, medications, injection logs, data imports). The application follows a modular storage abstraction pattern with an `IStorage` interface, currently implemented with an in-memory storage system for development purposes. The server includes comprehensive error handling, request logging middleware, and CORS support.

### Data Layer
The application uses **Drizzle ORM** with **PostgreSQL** as the database system, specifically configured for **Neon Database** serverless PostgreSQL. The schema defines four main entities: users, weight entries, medications, and injection logs, with proper relationships and constraints. The user schema includes onboarding completion tracking, weight unit preferences, and goal weight settings. Database migrations are handled through Drizzle Kit, and the schema includes support for complex data types like JSONB for medication titration schedules.

### Build System and Development
The project uses **Vite** as the build tool for the frontend with hot module replacement during development. The backend uses **tsx** for TypeScript execution in development and **esbuild** for production builds. The application is configured for deployment with separate client and server build processes, outputting to a unified distribution directory.

### State Management and API Integration
Client-side state is managed through TanStack Query for server state and React's built-in state management for local component state. The API layer uses a custom `apiRequest` function with proper error handling and credential management. The application implements optimistic updates and cache invalidation strategies for a responsive user experience.

### Authentication and Session Management
The architecture includes provisions for session-based authentication using PostgreSQL session storage through `connect-pg-simple`, though the current implementation uses a demo user system for development purposes. The application features a comprehensive onboarding flow that guides new users through profile setup, weight goals, and medication configuration before allowing access to the main application.

## Recent Updates (January 2025)

### Enhanced User Experience
- **Compact Quick Actions**: Redesigned the home screen quick action buttons to use a space-efficient 3-column grid layout
- **Floating + Button**: Added a prominent floating action button in the center of the bottom navigation for quick access to adding entries
- **Weight Unit Support**: Full support for both pounds (lbs) and kilograms (kg) with user preference settings
- **Goal Prediction Algorithm**: Smart weight loss prediction that calculates estimated goal achievement dates based on recent weight loss trends

### Comprehensive Onboarding Flow
- **4-Step Setup Process**: Personal info, weight goals, medication details, and confirmation
- **Screenshot Integration**: Users can import data from existing weight tracking apps during onboarding
- **Medication Database**: Pre-configured options for common GLP-1 medications (Ozempic, Wegovy, Mounjaro, etc.)
- **Smart Defaults**: Automatic titration schedule generation based on medication type

### Enhanced Analytics
- **Dynamic Weight Chart**: Progress visualization with goal prediction timeline
- **Personalized Metrics**: All weight displays respect user's preferred unit (lbs/kg)
- **Weekly Loss Calculation**: Real-time average weekly loss calculations for goal predictions

## External Dependencies

### Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting platform configured through environment variables
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **Radix UI**: Comprehensive collection of accessible UI primitives for components like dialogs, dropdowns, forms, and navigation
- **Tailwind CSS**: Utility-first CSS framework with custom design system configuration
- **Lucide React**: Icon library providing consistent iconography
- **shadcn/ui**: Pre-built component library based on Radix UI with Tailwind styling

### Charts and Data Visualization
- **Recharts**: React-based charting library for weight progress visualization and analytics

### File Upload and Processing
- **Multer**: Middleware for handling multipart/form-data file uploads
- **react-dropzone**: Drag-and-drop file upload interface for screenshot imports

### Form Management
- **React Hook Form**: Form state management with validation
- **Hookform Resolvers**: Integration with validation libraries
- **Zod**: Runtime type validation and schema definition (via drizzle-zod)

### Development and Build Tools
- **Vite**: Frontend build tool with React plugin and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx** and **tailwind-merge**: Conditional CSS class management
- **nanoid**: Unique ID generation
- **class-variance-authority**: Type-safe variant API for component styling