# TrainLog - Offline Fitness Training Application

## Overview

TrainLog is a comprehensive offline fitness training application built with React, TypeScript, and Express. The app allows users to track workouts, create templates, monitor personal records, and maintain an activity calendar. It's designed to work offline-first with local storage as the primary data persistence mechanism, with plans for PostgreSQL database integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom dark theme variables
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Single-page application with tab-based navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: Neon serverless PostgreSQL (configured but not yet implemented)
- **API Structure**: RESTful API with `/api` prefix (routes placeholder implemented)
- **Build Process**: ESBuild for server bundling

### Data Storage Strategy
- **Current**: Local Storage implementation for offline functionality
- **Planned**: PostgreSQL database with Drizzle ORM for persistent storage
- **Migration Path**: Abstract storage interface allows seamless transition from localStorage to database

## Key Components

### Core Data Models
- **Workouts**: Exercise sessions with sets, reps, weights, and cardio metrics
- **Templates**: Predefined workout structures for quick workout creation
- **Personal Bests**: Track maximum achievements for strength exercises
- **Exercise Sets**: Individual set data including completion status and rest timing

### User Interface Components
- **Navigation**: Bottom tab navigation for mobile-first experience
- **Exercise Forms**: Separate forms for strength and cardio exercises
- **Activity Calendar**: Visual representation of workout consistency
- **Rest Timer**: Built-in timer for rest periods between sets
- **Progress Dashboard**: Charts and analytics for workout progression

### Storage Abstraction Layer
- **IStorage Interface**: Defines CRUD operations for all data entities
- **LocalStorage Implementation**: Current offline-first storage solution
- **Database Implementation**: Prepared structure for PostgreSQL integration

## Data Flow

### Workout Creation Flow
1. User selects workout type (strength/cardio/mixed)
2. Adds exercises with sets and target metrics
3. Completes sets during workout with real-time tracking
4. Saves completed workout to storage
5. Updates personal bests and activity calendar

### Template System Flow
1. Create templates from scratch or existing workouts
2. Categorize templates by type and muscle groups
3. Use templates to quickly start new workouts
4. Templates populate with suggested weights/reps based on history

### Progress Tracking Flow
1. Aggregate workout data for analytics
2. Calculate trends and personal records
3. Display progress charts and statistics
4. Maintain streak tracking and consistency metrics

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, TanStack Query
- **UI Components**: Radix UI primitives, shadcn/ui components
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **Database**: Drizzle ORM, Neon serverless PostgreSQL driver
- **Build Tools**: Vite, ESBuild, TypeScript
- **Charts**: Recharts for progress visualization

### Development Dependencies
- **Replit Integration**: Vite plugins for Replit development environment
- **Session Management**: connect-pg-simple for PostgreSQL sessions
- **Validation**: Zod schema validation, drizzle-zod integration
- **Date Handling**: date-fns for date manipulation
- **Utilities**: nanoid for ID generation, various utility libraries

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module provisioned
- **Port Configuration**: Server runs on port 5000, exposed as port 80
- **Hot Reload**: Vite development server with HMR

### Production Build Process
1. Frontend build with Vite optimization
2. Server bundle with ESBuild for Node.js
3. Static asset serving from Express
4. Database migrations with Drizzle Kit

### Scaling Considerations
- **Autoscale Deployment**: Configured for automatic scaling
- **Database**: Neon serverless PostgreSQL for scalable data storage
- **Offline Support**: PWA capabilities for offline usage
- **Session Management**: PostgreSQL-backed sessions for user state

## Changelog

```
Changelog:
- June 13, 2025. Initial setup with blue navy theme
- June 13, 2025. Implemented darker red theme replacing blue accents throughout app
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```