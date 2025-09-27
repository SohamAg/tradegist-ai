# Tradegist - Advanced Trading Behavior Analysis

A modern Next.js application for analyzing trading behavior patterns and journaling.

## Features

- 🔐 **Authentication**: Supabase Auth with email sign-in
- 📊 **Dashboard**: KPI cards, calendar PnL view, behavior insights
- 📈 **Trade Management**: Paginated trades table with filtering and attachments
- 🤖 **AI Insights**: Analytics and behavior pattern recognition
- 📝 **Notes**: Trade journaling with emotion tracking
- 🎨 **Modern UI**: Tailwind CSS + shadcn/ui with dark/light mode

## Setup

1. **Clone and install dependencies**:
   ```bash
   cd tradegist-ai/web
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Supabase Configuration**:
   - Create a new Supabase project
   - Enable Authentication with email provider
   - Create a storage bucket named `tradegist` for image uploads
   - Set up RLS policies for your tables

4. **Database Tables**:
   The app expects these tables to exist in your Supabase database:
   - `trades`
   - `trade_behavior_tags`
   - `behaviors`
   - `metrics_daily`
   - `notes`
   - `ingest_log`
   - `trade_attachments`
   - `emotions_catalog`

5. **Run the development server**:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Architecture

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

## Key Routes

- `/signin` - Authentication
- `/app/dashboard` - Main dashboard with KPIs and insights
- `/app/trades` - Trade management and analysis
- `/app/ai-insights` - Analytics summaries
- `/app/llm` - AI agent interface (placeholder)
- `/app/notes` - Trade journaling

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Ensure components are accessible
4. Test authentication flows
5. Maintain RLS security policies