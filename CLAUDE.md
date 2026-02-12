# CLAUDE.md

## Project Overview

**Aldebaran AI OEM Concierge** (アルデバラン社-ai-oem-コンシェルジュ) — a full-stack web application for an organic cosmetics OEM company. It uses Google Gemini AI to extract requirements from customer inquiries (files, URLs, text) and generate tailored product proposal documents.

## Tech Stack

- **Frontend:** React 19 + TypeScript, Vite 6, Tailwind CSS (CDN)
- **Backend:** Express 5 (Node.js, CommonJS `.cjs` files)
- **Database:** SQLite via better-sqlite3 (`aldebaran.db`)
- **AI:** Google Gemini API (`gemini-2.5-flash`) via `@google/genai`, with OpenAI fallback
- **Auth:** JWT + bcryptjs
- **PDF:** jspdf, html2pdf.js

## Repository Structure

```
/
├── components/           # React UI components
│   ├── common/           # Reusable components (Button, Input, Select, Card, etc.)
│   ├── icons/            # SVG icon components
│   ├── Dashboard.tsx     # Welcome/landing page
│   ├── LoginPage.tsx     # Auth page (login + register)
│   ├── StructuredForm.tsx# Main inquiry form (file/URL/text input)
│   ├── MatchingResults.tsx# AI-generated proposal options
│   ├── ProposalDetailView.tsx
│   ├── ProposalsList.tsx
│   ├── MaterialDatabase.tsx
│   ├── ReportsPage.tsx
│   ├── ExtractedDataEditor.tsx
│   ├── FileUpload.tsx
│   └── MaterialForm.tsx
├── contexts/             # React Context (AuthContext)
├── services/             # AI & API integration
│   ├── apiService.ts     # Gemini AI service (primary)
│   ├── apiService_openai.ts # OpenAI fallback
│   └── pdfService.ts     # PDF generation
├── public/               # Static assets (logo)
├── server.cjs            # Express server entry point
├── api.cjs               # REST API route definitions
├── db.cjs                # SQLite database setup & schema
├── auth.cjs              # JWT auth middleware
├── seed_demo_user.cjs    # Seed script for demo user
├── App.tsx               # Root React component / router
├── index.tsx             # React entry point
├── index.html            # HTML template with Tailwind CDN
├── types.ts              # Shared TypeScript type definitions
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

## Commands

```bash
# Install dependencies
npm install

# Start frontend dev server (port 3000)
npm run dev

# Start backend API server (port 8000)
node server.cjs

# Build for production
npm run build

# Preview production build (port 3001)
npm run preview

# Seed demo user (demo@aldebaran.com / demo123)
node seed_demo_user.cjs
```

## Architecture Notes

### Frontend
- Single-page app with manual view routing in `App.tsx` (no react-router)
- State management via React Context (`AuthContext`) and component state
- Path alias: `@/*` maps to project root (configured in tsconfig + vite)
- Styling via Tailwind utility classes; brand colors defined in `index.html`

### Backend API (port 8000)
- `POST /api/auth/register` / `POST /api/auth/login` — authentication
- `GET|POST|DELETE /api/proposals` — proposal CRUD
- `GET|POST /api/materials` — material database
- `GET /api/reports/stats` — analytics
- `GET /api/fetch-url` — URL content extraction
- `GET /api/extract-social-media` — social link detection

### AI Services (`services/apiService.ts`)
- `ingestFileOrUrl()` — extract requirements from files/URLs
- `parseInquiryText()` — parse free-form inquiry text
- `getMatchingProposals()` — generate 3 ranked proposal options
- `generateFullProposal()` — create detailed proposal with specs/costs
- `performClientResearch()` — company research via Google Search grounding
- All AI responses use JSON schema validation for structured output

### Database Tables
- `users` — authentication and user profiles
- `proposals` — saved proposal documents (content stored as JSON)
- `materials` — organic cosmetics material inventory (INCI names, certifications)

## Conventions

- Frontend code is TypeScript (`.tsx`/`.ts`); backend is CommonJS (`.cjs`)
- No automated test framework is configured; manual testing via `test_login.cjs`
- No linter or formatter is configured
- Environment variables prefixed with `VITE_` are exposed to the frontend
- API keys are configured in `.env` (`GEMINI_API_KEY`, `VITE_GEMINI_API_KEY`)
- The app UI is primarily in Japanese; code comments and variable names are in English
- Module system: frontend uses ESM (`"type": "module"` in package.json), backend uses CommonJS (`.cjs` extension)

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Server-side Gemini API key |
| `VITE_GEMINI_API_KEY` | Client-side Gemini API key (exposed via Vite) |
| `PORT` | Backend server port (default: 8000) |
