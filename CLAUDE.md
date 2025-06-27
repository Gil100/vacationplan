# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Hebrew RTL vacation planning website for Israeli families. Focus on detailed daily itinerary planning with emotional copywriting and conversion optimization. Deployment target: GitHub Pages.

## Current Status
Project is in early planning phase with comprehensive documentation:
- `proj.md` - Main project plan with 5 phases and detailed checkpoints
- `design.md` - UI/UX design system for Hebrew RTL interfaces
- `research.md` - Market research on Israeli family travel patterns  
- `roadmap.md` - Feature prioritization and development timeline

## Tech Stack (Planned)
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with RTL support
- **State Management**: React Context + useReducer
- **Routing**: React Router
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library
- **Deployment**: GitHub Actions + GitHub Pages

## Key Requirements
- **Hebrew RTL Support**: Complete right-to-left interface design
- **Mobile-First**: Primary focus on smartphone experience
- **Cultural Sensitivity**: Israeli family travel patterns, kosher options, Shabbat considerations
- **Payment Integration**: Israeli payment methods (Bit, Paybox)
- **Currency**: New Israeli Shekel (NIS) as primary display

## Development Workflow
1. Read project documentation before starting implementation
2. Create PRD (Product Requirements Document) before building
3. Write plan to proj.md with todo items
4. Check with user before beginning work
5. Mark todos as complete while working
6. Run tests after each checkpoint/phase
7. Remove mock data and verify no dead references

## Hebrew/RTL Considerations
- Use Hebrew typography with proper line spacing (1.6-1.8)
- Mirror navigation and UI elements appropriately
- Support Hebrew date formats and calendar
- Right-align text and form layouts
- Test with Hebrew content throughout

## File Structure (When Implemented)
- `/src` - React components and application code
- `/public` - Static assets and Hebrew fonts
- `/docs` - Documentation and project planning
- `/tests` - Test files and test utilities

## Deployment
GitHub Pages deployment with custom domain support. Build process should optimize for Hebrew fonts and RTL layouts.