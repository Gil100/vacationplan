import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import DashboardPage from '../../pages/DashboardPage';
import PlannerPage from '../../pages/PlannerPage';
import { use_vacation_store } from '../../stores/vacation_store';

// Mock dependencies
jest.mock('../../hooks/use_translation', () => ({
  use_translation: () => ({
    t: (key: string) => key,
    direction: 'rtl',
    isHebrew: true
  })
}));

jest.mock('../../components/forms/HebrewTestForm', () => ({
  HebrewTestForm: () => <div data-testid="hebrew-test-form">Hebrew Test Form</div>
}));

// Test wrapper with router
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      use_vacation_store.setState({
        vacations: [],
        activities: [],
        current_vacation: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('Home Page User Flow', () => {
    it('should display landing page with Hebrew content', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check for Hebrew content
      expect(screen.getByText('הפכו כל חופשה')).toBeInTheDocument();
      expect(screen.getByText(/לזיכרון בלתי נשכח/)).toBeInTheDocument();
      expect(screen.getByText(/נמאס לכם לבזבז שעות על תכנון חופשה/)).toBeInTheDocument();
    });

    it('should show social proof and statistics', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check for statistics
      expect(screen.getByText('12,847')).toBeInTheDocument();
      expect(screen.getByText('משפחות מרוצות')).toBeInTheDocument();
      expect(screen.getByText('4.9')).toBeInTheDocument();
      expect(screen.getByText('דירוג ממוצע')).toBeInTheDocument();
    });

    it('should animate statistics on page load', async () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check that stats start hidden (with opacity-0 class)
      const statsElements = screen.getAllByText(/^\d+$/);
      expect(statsElements[0].parentElement).toHaveClass('opacity-0');

      // Wait for animation to complete
      await waitFor(() => {
        expect(statsElements[0].parentElement).toHaveClass('opacity-100');
      }, { timeout: 2000 });
    });

    it('should handle CTA button click with loading state', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const ctaButton = screen.getAllByText(/תכננו את החופשה שלכם/)[0];
      
      // Click the CTA button
      await user.click(ctaButton);

      // Should show loading state
      expect(screen.getByText(/יוצר עבורכם תוכנית/)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();

      // Wait for onboarding modal to appear
      await waitFor(() => {
        expect(screen.getByText('בואו נכיר! 👋')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should display and interact with onboarding modal', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Trigger onboarding
      const ctaButton = screen.getAllByText(/תכננו את החופשה שלכם/)[0];
      await user.click(ctaButton);

      await waitFor(() => {
        expect(screen.getByText('בואו נכיר! 👋')).toBeInTheDocument();
      });

      // Fill out form
      const nameInput = screen.getByPlaceholderText('השם שלכם');
      const emailInput = screen.getByPlaceholderText('האימייל שלכם');
      const destinationSelect = screen.getByDisplayValue('עדיין לא החלטנו');

      await user.type(nameInput, 'יוסי ישראלי');
      await user.type(emailInput, 'yossi@example.com');
      await user.selectOptions(destinationSelect, 'אירופה');

      // Submit form
      const continueButton = screen.getByText('המשיכו לתכנון');
      await user.click(continueButton);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('בואו נכיר! 👋')).not.toBeInTheDocument();
      });
    });

    it('should display testimonials and reviews', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check for testimonials
      expect(screen.getByText(/הילדים שלנו עדיין מדברים על החופשה הזאת/)).toBeInTheDocument();
      expect(screen.getByText('רחל כהן')).toBeInTheDocument();
      expect(screen.getByText('דני וגלית לוי')).toBeInTheDocument();
      expect(screen.getByText('משה ושרה אברהם')).toBeInTheDocument();

      // Check for star ratings
      const starElements = screen.getAllByRole('img', { hidden: true });
      expect(starElements.length).toBeGreaterThan(10); // Multiple 5-star ratings
    });

    it('should show features section with Hebrew descriptions', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      expect(screen.getByText('תכנון חכם ב-10 דקות')).toBeInTheDocument();
      expect(screen.getByText('יעדים מותאמים לישראלים')).toBeInTheDocument();
      expect(screen.getByText('תמיכה 24/7 בעברית')).toBeInTheDocument();
      
      // Check feature descriptions
      expect(screen.getByText(/האלגוריתם שלנו יוצר עבורכם תוכנית מושלמת/)).toBeInTheDocument();
      expect(screen.getByText(/מאגר של \+2,500 יעדים עם מידע על כשרות/)).toBeInTheDocument();
    });
  });

  describe('Dashboard User Flow', () => {
    beforeEach(() => {
      // Add some sample vacations to the store
      act(() => {
        use_vacation_store.getState().add_vacation({
          title: 'טיול בפריז',
          destination: 'פריז, צרפת',
          start_date: '2024-07-15',
          end_date: '2024-07-22',
          participants: 4,
          budget: 8000,
          status: 'planning'
        });

        use_vacation_store.getState().add_vacation({
          title: 'חופשה בתאילנד',
          destination: 'בנגקוק, תאילנד',
          start_date: '2024-08-10',
          end_date: '2024-08-20',
          participants: 2,
          budget: 6000,
          status: 'draft'
        });
      });
    });

    it('should display dashboard with vacation list', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Should show vacation cards
      expect(screen.getByText('טיול בפריז')).toBeInTheDocument();
      expect(screen.getByText('חופשה בתאילנד')).toBeInTheDocument();
      expect(screen.getByText('פריז, צרפת')).toBeInTheDocument();
      expect(screen.getByText('בנגקוק, תאילנד')).toBeInTheDocument();
    });

    it('should filter vacations by search query', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Find and use search input
      const searchInput = screen.getByRole('textbox', { name: /חיפוש/ });
      await user.type(searchInput, 'פריז');

      // Should show only Paris vacation
      expect(screen.getByText('טיול בפריז')).toBeInTheDocument();
      expect(screen.queryByText('חופשה בתאילנד')).not.toBeInTheDocument();
    });

    it('should filter vacations by status', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Find status filter
      const statusFilter = screen.getByRole('combobox', { name: /סטטוס/ });
      await user.selectOptions(statusFilter, 'planning');

      // Should show only planning vacation
      expect(screen.getByText('טיול בפריז')).toBeInTheDocument();
      expect(screen.queryByText('חופשה בתאילנד')).not.toBeInTheDocument();
    });

    it('should open vacation creation modal', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Find and click create vacation button
      const createButton = screen.getByText(/צור חופשה חדשה/);
      await user.click(createButton);

      // Should show create modal
      expect(screen.getByText(/יצירת חופשה חדשה/)).toBeInTheDocument();
    });

    it('should switch between grid and list view modes', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Find view toggle buttons
      const listViewButton = screen.getByRole('button', { name: /תצוגת רשימה/ });
      await user.click(listViewButton);

      // Should switch to list view (verify by checking for list-specific elements)
      const gridViewButton = screen.getByRole('button', { name: /תצוגת רשת/ });
      expect(gridViewButton).toBeInTheDocument();
      
      // Switch back to grid view
      await user.click(gridViewButton);
    });

    it('should show vacation statistics', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Should show dashboard stats
      expect(screen.getByText(/סך הכל חופשות/)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Total vacations
    });
  });

  describe('Vacation Creation Flow', () => {
    it('should create new vacation with complete flow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Open create modal
      const createButton = screen.getByText(/צור חופשה חדשה/);
      await user.click(createButton);

      // Fill out vacation details
      const titleInput = screen.getByPlaceholderText(/כותרת החופשה/);
      const destinationInput = screen.getByPlaceholderText(/יעד החופשה/);
      const startDateInput = screen.getByLabelText(/תאריך התחלה/);
      const endDateInput = screen.getByLabelText(/תאריך סיום/);
      const participantsInput = screen.getByLabelText(/מספר משתתפים/);
      const budgetInput = screen.getByPlaceholderText(/תקציב משוער/);

      await user.type(titleInput, 'טיול רומנטי ברומא');
      await user.type(destinationInput, 'רומא, איטליה');
      await user.type(startDateInput, '2024-09-15');
      await user.type(endDateInput, '2024-09-22');
      await user.type(participantsInput, '2');
      await user.type(budgetInput, '7500');

      // Submit form
      const submitButton = screen.getByText(/צור חופשה/);
      await user.click(submitButton);

      // Verify vacation was created
      await waitFor(() => {
        expect(screen.getByText('טיול רומנטי ברומא')).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Open create modal
      const createButton = screen.getByText(/צור חופשה חדשה/);
      await user.click(createButton);

      // Try to submit without filling required fields
      const submitButton = screen.getByText(/צור חופשה/);
      await user.click(submitButton);

      // Should show validation errors
      expect(screen.getByText(/שדה חובה/)).toBeInTheDocument();
    });
  });

  describe('Vacation Planning Flow', () => {
    beforeEach(() => {
      // Create a vacation and set it as current
      act(() => {
        use_vacation_store.getState().add_vacation({
          title: 'טיול בפריז',
          destination: 'פריז, צרפת',
          start_date: '2024-07-15',
          end_date: '2024-07-22',
          participants: 4,
          budget: 8000,
          status: 'planning'
        });
        
        const vacation = use_vacation_store.getState().vacations[0];
        use_vacation_store.getState().set_current_vacation(vacation);
      });
    });

    it('should display planner page with current vacation', () => {
      render(
        <TestWrapper>
          <PlannerPage />
        </TestWrapper>
      );

      expect(screen.getByText('מתכנן החופשה')).toBeInTheDocument();
      // The DailyItineraryPlanner component should be rendered
      expect(screen.getByTestId(/daily-planner/)).toBeInTheDocument();
    });

    it('should handle day navigation in planner', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <PlannerPage />
        </TestWrapper>
      );

      // Should show day selector
      const day1Button = screen.getByText('יום 1');
      const day2Button = screen.getByText('יום 2');

      expect(day1Button).toBeInTheDocument();
      expect(day2Button).toBeInTheDocument();

      // Click on day 2
      await user.click(day2Button);

      // Should switch to day 2 view
      expect(day2Button).toHaveClass('active'); // assuming active styling
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle and display API errors gracefully', () => {
      // Set error state
      act(() => {
        use_vacation_store.getState().set_error('שגיאה בטעינת הנתונים');
      });

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByText(/שגיאה בטעינת הנתונים/)).toBeInTheDocument();
    });

    it('should show loading states during operations', () => {
      // Set loading state
      act(() => {
        use_vacation_store.getState().set_loading(true);
      });

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByTestId(/loading/)).toBeInTheDocument();
    });

    it('should handle offline scenarios', () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Should show offline indicator or messaging
      expect(screen.getByText(/אין חיבור לאינטרנט/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design Integration', () => {
    it('should adapt layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check for mobile-specific elements or layout changes
      const heroSection = screen.getByText('הפכו כל חופשה').closest('div');
      expect(heroSection).toHaveClass(/text-4xl|md:text-7xl/); // Responsive text sizing
    });

    it('should show mobile navigation on small screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Should show mobile navigation elements
      const mobileMenu = screen.getByRole('button', { name: /תפריט/ });
      expect(mobileMenu).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check for proper button roles
      const ctaButtons = screen.getAllByRole('button');
      expect(ctaButtons.length).toBeGreaterThan(0);

      // Check for proper heading structure
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toHaveAttribute('role', 'button');

      await user.tab();
      expect(document.activeElement).toHaveAttribute('role', 'button');
    });

    it('should have proper color contrast for text', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check that important text has appropriate styling
      const mainHeading = screen.getByText('הפכו כל חופשה');
      expect(mainHeading).toHaveClass(/text-white|text-gray-900/);
    });
  });
});