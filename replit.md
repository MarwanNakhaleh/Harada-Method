# Harada Method Application

## Overview
A Next.js application implementing the Harada Method - a goal-setting and achievement framework. The app includes a questionnaire form, board editor for the Harada grid system, AI-powered recommendations, and PDF generation.

## Project Structure
- `src/app/` - Next.js App Router pages and API routes
  - `api/generate-pdf/` - PDF generation endpoint
  - `api/recommendations/` - AI recommendations endpoint
- `src/components/` - React components
  - `board/` - Harada board grid components
  - `QuestionnaireForm.tsx` - Main questionnaire form
- `src/lib/` - Utility functions and types
  - `board-types.ts` - Type definitions for the board
  - `prompt.ts` - AI prompt templates
  - `questionnaire.ts` - Questionnaire logic

## Tech Stack
- Next.js 16 with App Router and Turbopack
- React 19
- TypeScript
- Tailwind CSS 4
- pdf-lib for PDF generation
- OpenRouter AI SDK for AI integration

## Development
- Run: `npm run dev` (configured for port 5000)
- Build: `npm run build`
- Start production: `npm start`

## Configuration
- Dev server binds to 0.0.0.0:5000 for Replit compatibility
- `allowedDevOrigins` configured to accept Replit proxy connections
