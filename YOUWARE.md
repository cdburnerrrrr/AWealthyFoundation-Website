# A Wealthy Foundation

A comprehensive financial assessment web application that helps users understand their financial health through a proprietary 7-pillar scoring system.

## Project Overview

**A Wealthy Foundation** provides two levels of financial assessment:

1. **Snapshot Score** (Free) - A quick 5-minute assessment with immediate feedback
2. **Wealth Audit** (Premium) - Comprehensive 15-minute analysis with PDF report and personalized investment strategy

## Features

### 7 Financial Pillars Assessment
- **Income** - Stability, growth trajectory, concentration risk, career momentum
- **Cash Flow** - Spending discipline, savings rate, lifestyle creep control
- **Debt** - High-interest exposure, DTI ratio, strategic vs destructive debt
- **Protection** - Emergency fund strength, insurance coverage, risk mitigation
- **Investments** - Participation, consistency, long-term behavior, tax-advantaged usage
- **Organization** - Account tracking, beneficiaries, document clarity
- **Direction** - Financial goals, values alignment, written plan presence

### Scoring System
- Pillar scores: 1-100 scale
- Wealth Score: 300-850 scale (credit score style)
- 6 reporting categories for easy visualization

### Dashboard Features
- Wealth Score tracking over time
- Visual breakdown of asset allocation
- Progress tracking across all pillars
- Consultation scheduling with financial advisors

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (mobile-first)
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Backend**: Hono + Drizzle ORM (Youbase)
- **Database**: SQLite (D1)

## Project Structure

```
src/
├── api/              # API client configuration
├── components/       # Reusable UI components
├── pages/            # Page components
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── SnapshotQuestionnaire.tsx
│   ├── ComprehensiveQuestionnaire.tsx
│   ├── ResultsPage.tsx
│   └── ScheduleConsultation.tsx
├── store/            # Zustand state management
├── types/            # TypeScript type definitions
└── App.tsx           # Main app with routing

backend/
├── src/
│   ├── index.ts      # API routes and scoring logic
│   └── __generated__/ # Auto-generated schema
└── ...
```

## Database Schema

- `assessments` - Stores questionnaire responses and scores
- `pillar_scores` - Individual pillar scores per assessment
- `consultations` - Scheduled advisor consultations
- `user_profiles` - User subscription status

## Getting Started

1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Preview: `npm run preview`

## Mobile Optimization

This app is designed mobile-first with:
- Touch-optimized interactions
- Safe area compliance for notched devices
- Responsive layouts (375px-430px mobile containers)

## Backend API Endpoints

### Public
- `GET /api/public/hello` - Health check

### Protected (Authentication Required)
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update user profile
- `POST /api/assessments` - Create new assessment
- `GET /api/assessments` - Get all user assessments
- `GET /api/assessments/:id` - Get specific assessment
- `GET /api/assessments/latest` - Get latest assessment
- `POST /api/consultations` - Schedule consultation
- `GET /api/consultations` - Get user consultations
- `PATCH /api/consultations/:id/cancel` - Cancel consultation
- `GET /api/analytics/history` - Get score history

## Environment Variables

- `EDGESPARK_PROJECT_ID` - Youbase project ID (auto-configured)
