# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Financial risk scoring application that extracts data from French tax forms (liasse fiscale) using AI, calculates 50+ financial ratios, and generates deficiency risk scores (0-100). Built for comparing enterprises against sector benchmarks with multi-year trend analysis.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Runtime:** Bun
- **Language:** TypeScript (strict mode)
- **Database/Auth:** Supabase (PostgreSQL + SSR auth)
- **AI:** Google Gemini 2.0-flash (via ai SDK v6)
- **UI:** shadcn/ui + TailwindCSS 4
- **PDF:** jsPDF, react-pdf

## Commands

```bash
bun run dev      # Development server (port 3000)
bun run build    # Production build
bun run lint     # ESLint
```

## Architecture

### Directory Structure

- `src/app/` - Next.js App Router pages
  - `(protected)/` - Auth-required routes (dashboard, enterprise)
  - `api/` - API routes
- `src/actions/` - Server actions (all mutations)
- `src/repositories/` - Data access layer (abstracts Supabase)
- `src/lib/` - Core utilities
  - `supabase/` - Client/server Supabase setup + middleware
  - `ratios/` - Financial calculation engine
  - `api/` - External API integrations (SIRENE, INPI)
  - `pdf/` - Report generation
- `src/config/` - Configuration
  - `ratios.config.ts` - Scoring model (5 families, 50+ ratios)
  - `prompts/` - AI extraction prompts
- `src/hooks/` - React hooks
- `src/schemas/` - Zod validation schemas
- `supabase/` - Database schema and migrations

### Key Patterns

**Authentication:** Supabase SSR with middleware at `src/lib/supabase/middleware.ts`. RLS policies enforce tenant isolation.

**Data Flow:** Server Actions → Repositories → Supabase. All mutations use server actions.

**AI Extraction:** PDF upload → Gemini extracts 54 financial fields → User validates → Scoring engine calculates ratios.

**Scoring Engine:** 5 weighted ratio families (Liquidité 30%, Rentabilité 20%, Solvabilité 20%, Activité 15%, Évolution 15%). Each ratio has thresholds (fixed or quartile-based) producing Green/Yellow/Red zones.

### Critical Files

- `/src/config/ratios.config.ts` - Scoring model definition
- `/src/actions/extraction.actions.ts` - AI extraction logic
- `/src/lib/ratios/calculate.ts` - Financial calculations
- `/supabase/schema.sql` - Database schema
- `/src/lib/supabase/middleware.ts` - Auth middleware

### Database Tables

- `dossiers` - Enterprise/case files
- `documents` - Uploaded PDFs (liasse fiscale)
- `donnees_extraites` - Extracted financial data (JSONB)
- `scores_history` - Historical scores

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `SIRENE_API_KEY` / `SIRENE_URL`
- `INPI_API_URL` / `INPI_USERNAME` / `INPI_PASSWORD`

## Deployment

Docker multi-stage build with Bun runtime. Uses `output: 'standalone'` in next.config.ts. Health check at `/api/health`.
