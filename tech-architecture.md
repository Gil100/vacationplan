# Technical Architecture Plan - Vacation Planning Website

## Technology Stack Decision

### Frontend Framework: React + TypeScript
**Chosen**: React 18+ with TypeScript
**Rationale**:
- Excellent RTL support with libraries like `react-with-direction`
- Strong TypeScript ecosystem for type safety
- Proven performance for complex UI interactions (drag-and-drop planning)
- Large community with Hebrew/RTL examples
- GitHub Pages friendly with simple build process

### CSS Framework: Tailwind CSS
**Chosen**: Tailwind CSS v3+ with RTL plugin
**Rationale**:
- Built-in RTL support with `@tailwindcss/rtl` plugin
- Mobile-first approach by default
- Rapid prototyping for vacation planning UI
- Easy Hebrew typography customization
- Small bundle size when purged

### State Management: Zustand + React Query
**Chosen**: Zustand for global state, React Query for server state
**Rationale**:
- Zustand: Lightweight, TypeScript-first, no boilerplate
- React Query: Excellent for caching vacation data, offline support
- Simpler than Redux for MVP scope
- Better performance for frequent vacation plan updates

### Build Tool: Vite
**Chosen**: Vite with React plugin
**Rationale**:
- Fast development server and HMR
- Built-in TypeScript support
- Optimized GitHub Pages deployment
- Better bundle splitting for Hebrew fonts
- Native ESM support

## Component Architecture

### Folder Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements (buttons, inputs)
│   ├── forms/           # Form components with Hebrew validation
│   ├── layout/          # Layout components (header, sidebar)
│   └── vacation/        # Vacation-specific components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores
├── types/               # TypeScript type definitions  
├── utils/               # Utility functions
├── constants/           # App constants and configuration
├── assets/              # Static assets (Hebrew fonts, images)
└── locales/             # Hebrew/English translations
```

### Component Design Patterns
- **Compound Components**: For complex vacation planning forms
- **Render Props**: For shared vacation logic across components
- **Custom Hooks**: For vacation plan state management
- **Context Providers**: For RTL direction and theme management

## Data Models

### Core Data Structures

```typescript
interface VacationPlan {
  id: string;
  title: string;
  description: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  participants: Participant[];
  dailyItineraries: DailyItinerary[];
  budget: Budget;
  settings: VacationSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface DailyItinerary {
  id: string;
  date: Date;
  activities: Activity[];
  notes: string;
  totalCost: number;
  estimatedDuration: number;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  location: Location;
  startTime: string;
  duration: number; // minutes
  cost: number; // NIS
  category: ActivityCategory;
  notes: string;
  isKosher?: boolean;
  isShabbatFriendly?: boolean;
}

interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  type: LocationType;
  amenities: string[];
}
```

## State Management Architecture

### Zustand Store Structure
```typescript
// Main vacation planning store
interface VacationStore {
  // State
  currentPlan: VacationPlan | null;
  plans: VacationPlan[];
  isLoading: boolean;
  
  // Actions
  createPlan: (plan: Partial<VacationPlan>) => void;
  updatePlan: (id: string, updates: Partial<VacationPlan>) => void;
  deletePlan: (id: string) => void;
  addActivity: (planId: string, dayId: string, activity: Activity) => void;
  updateActivity: (planId: string, dayId: string, activityId: string, updates: Partial<Activity>) => void;
}

// UI state store
interface UIStore {
  theme: 'light' | 'dark';
  direction: 'rtl' | 'ltr';
  sidebarOpen: boolean;
  activeDay: string | null;
  draggedActivity: Activity | null;
}
```

## Responsive Design Strategy

### Mobile-First Breakpoints
```css
/* Tailwind CSS breakpoints for Hebrew RTL */
sm: 640px   /* Small tablets and large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

### RTL Layout Patterns
- Right-aligned navigation and forms
- Mirrored icons and directional elements
- Hebrew-optimized font loading
- Touch-friendly mobile interactions

## GitHub Pages Deployment

### Build Configuration
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Deployment Optimization
- Static asset optimization for Hebrew fonts
- Service worker for offline vacation planning
- Gzip compression for faster loading
- CDN-friendly asset naming

## Development Environment Standards

### Code Quality Tools
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview", 
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

### Git Hooks & Standards
- Pre-commit: ESLint + Prettier + TypeScript check
- Commit messages: Conventional commits in English
- Branch naming: feature/checkpoint-x-y format
- Code review: Hebrew text content validation

## Performance Considerations

### Bundle Optimization
- Code splitting by route and feature
- Lazy loading for non-critical components
- Hebrew font subset loading
- Image optimization for vacation photos

### Runtime Performance
- Virtualization for long activity lists
- Debounced search and filtering
- Optimistic UI updates for planning actions
- Local storage backup for vacation plans

## Security & Data Privacy

### Client-Side Security
- Input validation for Hebrew text
- XSS prevention in user-generated content
- Secure local storage for sensitive data
- CSP headers for GitHub Pages

### Data Handling
- Local-first architecture (no server required)
- Export/import with encryption options
- GDPR-compliant data practices
- Hebrew privacy policy compliance

## Testing Strategy

### Unit Testing
- Jest + React Testing Library
- Hebrew text rendering tests
- RTL layout validation
- Vacation planning logic tests

### Integration Testing
- End-to-end user flows with Hebrew content
- Mobile device testing (iOS Safari, Chrome Android)
- Accessibility testing with screen readers
- Performance testing on slow networks

## Next Steps for Implementation

1. Initialize Vite + React + TypeScript project
2. Configure Tailwind CSS with RTL support
3. Set up Zustand stores and TypeScript types
4. Create base component structure
5. Implement Hebrew font loading
6. Set up GitHub Actions deployment
7. Create development environment documentation