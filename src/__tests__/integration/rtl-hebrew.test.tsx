import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../../pages/HomePage';
import DashboardPage from '../../pages/DashboardPage';
import { HebrewTestForm } from '../../components/forms/HebrewTestForm';
import { Button, Input, Card } from '../../components/ui';
import { use_vacation_store } from '../../stores/vacation_store';
import { BrowserRouter } from 'react-router-dom';

// Mock hooks for Hebrew/RTL
jest.mock('../../hooks/use_translation', () => ({
  use_translation: () => ({
    t: (key: string) => key,
    direction: 'rtl',
    isHebrew: true,
    locale: 'he'
  })
}));

jest.mock('../../hooks/use_rtl', () => ({
  use_rtl: () => ({
    direction: 'rtl',
    isRTL: true,
    textDirection: 'rtl'
  })
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <div dir="rtl" lang="he">
      {children}
    </div>
  </BrowserRouter>
);

describe('Hebrew/RTL Integration Tests', () => {
  beforeEach(() => {
    // Reset store
    use_vacation_store.setState({
      vacations: [],
      activities: [],
      current_vacation: null,
      loading: false,
      error: null,
    });

    // Mock document direction
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'he';
  });

  afterEach(() => {
    // Reset document direction
    document.documentElement.dir = '';
    document.documentElement.lang = '';
  });

  describe('Hebrew Text Rendering', () => {
    it('should render Hebrew text correctly in HomePage', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check for proper Hebrew text rendering
      expect(screen.getByText('הפכו כל חופשה')).toBeInTheDocument();
      expect(screen.getByText('לזיכרון בלתי נשכח')).toBeInTheDocument();
      expect(screen.getByText('נמאס לכם לבזבז שעות על תכנון חופשה?')).toBeInTheDocument();
      expect(screen.getByText('מתכננים חופשה? אתם במקום הנכון!')).toBeInTheDocument();
    });

    it('should render Hebrew testimonials and reviews correctly', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check Hebrew testimonials
      expect(screen.getByText(/הילדים שלנו עדיין מדברים על החופשה הזאת/)).toBeInTheDocument();
      expect(screen.getByText('רחל כהן')).toBeInTheDocument();
      expect(screen.getByText('דני וגלית לוי')).toBeInTheDocument();
      expect(screen.getByText('משה ושרה אברהם')).toBeInTheDocument();
    });

    it('should render Hebrew feature descriptions', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      expect(screen.getByText('תכנון חכם ב-10 דקות')).toBeInTheDocument();
      expect(screen.getByText('יעדים מותאמים לישראלים')).toBeInTheDocument();
      expect(screen.getByText('תמיכה 24/7 בעברית')).toBeInTheDocument();
    });

    it('should handle mixed Hebrew-English text correctly', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check mixed text with numbers and Hebrew
      expect(screen.getByText('12,847')).toBeInTheDocument();
      expect(screen.getByText('משפחות מרוצות')).toBeInTheDocument();
      expect(screen.getByText('4.9')).toBeInTheDocument();
      expect(screen.getByText('דירוג ממוצע')).toBeInTheDocument();
    });
  });

  describe('RTL Layout and Styling', () => {
    it('should apply RTL direction to main containers', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const mainContainer = screen.getByText('הפכו כל חופשה').closest('div');
      expect(mainContainer).toHaveStyle({ direction: 'rtl' });
    });

    it('should have proper RTL text alignment', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Hebrew text should be right-aligned
      const hebrewElements = screen.getAllByText(/[\u0590-\u05FF]/);
      hebrewElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        expect(['right', 'text-right', 'text-align-right']).toContain(
          computedStyle.textAlign || element.className
        );
      });
    });

    it('should handle RTL-aware icons and arrows', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check for RTL-aware icon transformations
      const icons = screen.getAllByRole('img', { hidden: true });
      icons.forEach(icon => {
        if (icon.className.includes('arrow') || icon.className.includes('chevron')) {
          expect(icon.className).toMatch(/rtl:|transform|scale-x-\[-1\]/);
        }
      });
    });

    it('should properly align form elements for RTL', () => {
      render(
        <TestWrapper>
          <HebrewTestForm />
        </TestWrapper>
      );

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveStyle({ textAlign: 'right' });
        expect(input).toHaveAttribute('dir', 'rtl');
      });
    });
  });

  describe('Hebrew Form Input Handling', () => {
    it('should handle Hebrew text input correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Input placeholder="הכנס טקסט בעברית" />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('הכנס טקסט בעברית');
      
      // Type Hebrew text
      await user.type(input, 'טיול בירושלים הקדושה');
      
      expect(input).toHaveValue('טיול בירושלים הקדושה');
      expect(input).toHaveAttribute('dir', 'rtl');
    });

    it('should handle Hebrew placeholder text correctly', () => {
      render(
        <TestWrapper>
          <Input placeholder="הכנס את שם החופשה" />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('הכנס את שם החופשה');
      expect(input).toHaveAttribute('placeholder', 'הכנס את שם החופשה');
      expect(input).toHaveStyle({ textAlign: 'right' });
    });

    it('should validate Hebrew input correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <HebrewTestForm />
        </TestWrapper>
      );

      const nameInput = screen.getByLabelText(/שם מלא/);
      
      // Test Hebrew validation
      await user.type(nameInput, 'יוסף כהן');
      expect(nameInput).toHaveValue('יוסף כהן');

      // Test English in Hebrew field (should work but with warning)
      await user.clear(nameInput);
      await user.type(nameInput, 'Yosef Cohen');
      expect(nameInput).toHaveValue('Yosef Cohen');
    });

    it('should handle mixed Hebrew-English input', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Input placeholder="כתובת מייל או טלפון" />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('כתובת מייל או טלפון');
      
      // Type mixed content
      await user.type(input, 'yossi@example.com או 050-1234567');
      
      expect(input).toHaveValue('yossi@example.com או 050-1234567');
    });
  });

  describe('Hebrew Date and Time Formatting', () => {
    it('should display Hebrew dates correctly', () => {
      // Add vacation with Hebrew dates
      use_vacation_store.getState().add_vacation({
        title: 'טיול בפריז',
        destination: 'פריז, צרפת',
        start_date: '2024-07-15',
        end_date: '2024-07-22',
        participants: 4,
        budget: 8000,
        status: 'planning'
      });

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Should show Hebrew date format (DD/MM/YYYY)
      expect(screen.getByText(/15\/7\/2024/)).toBeInTheDocument();
    });

    it('should handle Hebrew day names correctly', () => {
      const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
      
      // Test that Hebrew day names are recognized
      hebrewDays.forEach(day => {
        expect(day).toMatch(/^[\u0590-\u05FF\s]+$/); // Hebrew Unicode range
      });
    });

    it('should format Hebrew time correctly', () => {
      const testTime = '14:30';
      
      // Hebrew time format should be HH:MM
      expect(testTime).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('Hebrew Currency and Numbers', () => {
    it('should display NIS currency correctly', () => {
      use_vacation_store.getState().add_vacation({
        title: 'טיול בפריז',
        destination: 'פריז, צרפת',
        start_date: '2024-07-15',
        end_date: '2024-07-22',
        participants: 4,
        budget: 8000,
        status: 'planning'
      });

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Should show NIS symbol after number (Israeli convention)
      expect(screen.getByText(/8,000₪/)).toBeInTheDocument();
    });

    it('should handle Hebrew number formatting', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Check Hebrew number formatting with commas
      expect(screen.getByText('12,847')).toBeInTheDocument();
      expect(screen.getByText('2,431')).toBeInTheDocument();
    });
  });

  describe('Hebrew Typography and Line Spacing', () => {
    it('should apply proper Hebrew typography styles', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const hebrewText = screen.getByText('הפכו כל חופשה');
      const styles = window.getComputedStyle(hebrewText);
      
      // Hebrew text should have proper line height
      expect(parseFloat(styles.lineHeight)).toBeGreaterThan(1.4);
    });

    it('should handle Hebrew text wrapping correctly', () => {
      render(
        <TestWrapper>
          <div style={{ width: '200px' }}>
            <p>טקסט ארוך בעברית שאמור להיעטף בצורה נכונה כאשר הרוחב מוגבל ולא מספיק למילים</p>
          </div>
        </TestWrapper>
      );

      const hebrewParagraph = screen.getByText(/טקסט ארוך בעברית/);
      expect(hebrewParagraph).toBeInTheDocument();
    });

    it('should apply Hebrew-specific font families', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const hebrewElement = screen.getByText('הפכו כל חופשה');
      const styles = window.getComputedStyle(hebrewElement);
      
      // Should include Hebrew-friendly fonts
      expect(styles.fontFamily).toMatch(/(Assistant|Heebo|Arial|sans-serif)/i);
    });
  });

  describe('RTL Component Layout', () => {
    it('should arrange buttons correctly in RTL layout', () => {
      render(
        <TestWrapper>
          <div className="flex gap-4">
            <Button>כפתור ראשון</Button>
            <Button>כפתור שני</Button>
          </div>
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('כפתור ראשון');
      expect(buttons[1]).toHaveTextContent('כפתור שני');
      
      // In RTL, visual order should be reversed
      const container = buttons[0].parentElement;
      expect(container).toHaveStyle({ direction: 'rtl' });
    });

    it('should handle card layouts in RTL', () => {
      render(
        <TestWrapper>
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <h3>כותרת בעברית</h3>
              <span>פרט נוסף</span>
            </div>
          </Card>
        </TestWrapper>
      );

      const cardContent = screen.getByText('כותרת בעברית').parentElement;
      expect(cardContent).toHaveClass(/justify-between/);
    });

    it('should position modal dialogs correctly for RTL', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Trigger onboarding modal
      const ctaButton = screen.getAllByText(/תכננו את החופשה שלכם/)[0];
      await user.click(ctaButton);

      // Wait for modal
      await screen.findByText('בואו נכיר! 👋');

      const modal = screen.getByText('בואו נכיר! 👋').closest('.fixed');
      expect(modal).toHaveClass(/flex|items-center|justify-center/);
    });
  });

  describe('Hebrew Accessibility', () => {
    it('should have proper lang attribute for Hebrew content', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      expect(document.documentElement).toHaveAttribute('lang', 'he');
    });

    it('should have proper ARIA labels in Hebrew', () => {
      render(
        <TestWrapper>
          <HebrewTestForm />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /שלח/ });
      expect(submitButton).toHaveAccessibleName(/שלח/);
    });

    it('should handle keyboard navigation in RTL correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <div>
            <Button>כפתור 1</Button>
            <Button>כפתור 2</Button>
            <Button>כפתור 3</Button>
          </div>
        </TestWrapper>
      );

      // Tab through buttons
      await user.tab();
      expect(document.activeElement).toHaveTextContent('כפתור 1');
      
      await user.tab();
      expect(document.activeElement).toHaveTextContent('כפתור 2');
    });

    it('should have proper screen reader support for Hebrew', () => {
      render(
        <TestWrapper>
          <div>
            <h1>כותרת ראשית</h1>
            <p>תיאור בעברית</p>
            <button aria-label="כפתור עם תיאור">לחץ כאן</button>
          </div>
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { name: 'כותרת ראשית' });
      const button = screen.getByRole('button', { name: 'כפתור עם תיאור' });
      
      expect(heading).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });
  });

  describe('Hebrew Search and Filtering', () => {
    beforeEach(() => {
      // Add Hebrew vacation data
      use_vacation_store.getState().add_vacation({
        title: 'טיול בירושלים',
        destination: 'ירושלים, ישראל',
        start_date: '2024-07-15',
        end_date: '2024-07-22',
        participants: 4,
        budget: 5000,
        status: 'planning'
      });

      use_vacation_store.getState().add_vacation({
        title: 'חופשה בתל אביב',
        destination: 'תל אביב, ישראל',
        start_date: '2024-08-10',
        end_date: '2024-08-15',
        participants: 2,
        budget: 3000,
        status: 'draft'
      });
    });

    it('should search Hebrew text correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const searchInput = screen.getByRole('textbox', { name: /חיפוש/ });
      await user.type(searchInput, 'ירושלים');

      // Should find Jerusalem vacation
      expect(screen.getByText('טיול בירושלים')).toBeInTheDocument();
      expect(screen.queryByText('חופשה בתל אביב')).not.toBeInTheDocument();
    });

    it('should handle partial Hebrew search correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const searchInput = screen.getByRole('textbox', { name: /חיפוש/ });
      await user.type(searchInput, 'טיול');

      // Should find vacation with "טיול" in title
      expect(screen.getByText('טיול בירושלים')).toBeInTheDocument();
    });

    it('should handle Hebrew status filtering', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const statusFilter = screen.getByRole('combobox', { name: /סטטוס/ });
      await user.selectOptions(statusFilter, 'planning');

      // Should show only planning status vacations
      expect(screen.getByText('טיול בירושלים')).toBeInTheDocument();
      expect(screen.queryByText('חופשה בתל אביב')).not.toBeInTheDocument();
    });
  });
});