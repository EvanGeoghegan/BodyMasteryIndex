# Body Mastery Index - Offline Fitness Training Application

## Overview

Body Mastery Index is a comprehensive offline fitness training application built with React, TypeScript, and Express. The app allows users to track workouts, create templates, monitor personal records, maintain an activity calendar, log nutrition, and perform daily assessments. It's designed to work offline-first with local storage as the primary data persistence mechanism, with plans for PostgreSQL database integration.

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
- **Supplements**: Daily supplement tracking with dosage, timing, and adherence monitoring
- **Supplement Logs**: Daily tracking records for supplement intake with completion status

### User Interface Components
- **Navigation**: Bottom tab navigation for mobile-first experience
- **Exercise Forms**: Separate forms for strength and cardio exercises
- **Activity Calendar**: Visual representation of workout consistency
- **Rest Timer**: Built-in timer for rest periods between sets
- **Progress Dashboard**: Charts and analytics for workout progression
- **Supplement Tracker**: Daily supplement management with intake logging and progress tracking

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
- June 13, 2025. Updated typography: Montserrat for headings, Inter for body text
- June 13, 2025. Added comprehensive supplement tracker with daily logging, progress tracking, and management features
- June 14, 2025. Removed muscle group heat map component and added data reset functionality
- June 14, 2025. Streamlined navigation from 7 tabs to 5 tabs, improved spacing and removed Progress/Supplements from main navigation
- June 14, 2025. Restored all 7 tabs with horizontal scrolling navigation for better accessibility and reduced crowding
- June 14, 2025. Added Core exercise type with sets containing duration or reps and rest periods, matching strength exercise format
- June 14, 2025. Implemented workout editing from dashboard - Edit Workout button in Last Activity section
- June 14, 2025. Moved notes from individual exercises to general workout notes section
- June 14, 2025. Removed auto-populated placeholder values from Core exercise inputs for cleaner interface
- June 14, 2025. Updated calendar design with rectangles for each day and colored workout type indicators - blue for strength/gym, green for cardio, yellow for core, purple for mixed
- June 14, 2025. Removed snail emoji and replaced with red border indicator for multiple consecutive rest days
- June 14, 2025. Added comprehensive workout type legend showing colored dots for different exercise types
- June 14, 2025. Added Settings page with goals, preferences, and data management including export functionality
- June 14, 2025. Implemented recommended weight progression calculations in Personal Bests showing next session recommendations
- June 14, 2025. Fixed settings persistence to properly save and load user preferences across app sessions
- June 14, 2025. Enhanced protein and water tracking with proper state management, custom amount logging, and progress bars
- June 14, 2025. Simplified progression recommendations to focus on weight increases only, removing additional rep options
- June 14, 2025. Removed app preferences section from settings to streamline user experience
- June 14, 2025. Removed refresh button from calendar to simplify navigation interface
- June 14, 2025. Added undo functionality to protein and water tracking with visual feedback
- June 14, 2025. Changed "Multiple Rest Days" to "Rest Days" in calendar legend for cleaner labeling
- June 14, 2025. Added circle charts for protein and water intake to dashboard with percentage completion display
- June 14, 2025. Rebranded application from "TrainLog" to "Body Mastery Index"
- June 14, 2025. Renamed "Supplements" tab to "Nutrition Log" for clearer functionality description
- June 14, 2025. Added profile section to settings with current weight and target weight tracking
- June 14, 2025. Added configurable assessment exercises to settings (default: Push-ups and Pull-ups)
- June 14, 2025. Implemented daily assessment section on dashboard with exercise tracking and result storage
- June 15, 2025. Changed daily assessments to weekly assessments with completion tracking
- June 15, 2025. Unified cardio and core exercise forms to match strength training set-based interface with completion buttons and rest timers
- June 15, 2025. Enhanced progress dashboard with comprehensive tracking for strength volume, cardio distance/duration, protein/water intake, weekly assessments, and body weight
- June 15, 2025. Added complete visual analytics for all fitness and nutrition metrics with color-coded charts
- June 15, 2025. Removed intervals and steps from cardio exercise options for cleaner interface
- June 15, 2025. Added scroll indicators to bottom navigation with clickable arrow buttons for better UX
- June 15, 2025. Implemented comprehensive first-time user tutorial system with 9 guided steps explaining all app features
- June 15, 2025. Removed timer references from tutorial as feature not currently implemented
- June 15, 2025. Added configurable notification system for workout and nutrition reminders with customizable timing in settings
- June 15, 2025. Added search functionality to Personal Records page with exercise name filtering and results counter
- June 15, 2025. Fixed personal best creation logic to prevent duplicates by only creating records for the best set per exercise per workout
- June 15, 2025. Replaced dumbbell icons with custom scale logo throughout dashboard and added as app favicon (updated to PNG with transparent background)
- June 15, 2025. Implemented harsh motivational quotes that activate after 3+ days without workout logging with inactivity counter display
- June 15, 2025. Fixed deployment configuration mismatch by creating build script that moves files from dist/public to dist for static deployment compatibility
- June 15, 2025. Resolved React app loading issues through systematic debugging and confirmed full application functionality before deployment
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```