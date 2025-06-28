import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VacationCreateModal from '../../components/vacation/VacationCreateModal';
import VacationGrid from '../../components/vacation/VacationGrid';
import VacationCard from '../../components/vacation/VacationCard';
import { use_vacation_store, Vacation } from '../../stores/vacation_store';

// Mock hooks
jest.mock('../../hooks/use_translation', () => ({
  use_translation: () => ({
    t: (key: string) => key,
    direction: 'rtl',
    isHebrew: true
  })
}));

jest.mock('../../hooks/use_rtl', () => ({
  use_rtl: () => ({
    direction: 'rtl',
    isRTL: true
  })
}));

describe('Vacation Management Integration Tests', () => {
  const sample_vacation: Vacation = {
    id: 'test-1',
    title: 'טיול בירושלים',
    destination: 'ירושלים, ישראל',
    start_date: '2024-07-15',
    end_date: '2024-07-22',
    participants: 4,
    budget: 5000,
    status: 'planning',
    created_at: '2024-06-28T10:00:00.000Z',
    updated_at: '2024-06-28T10:00:00.000Z',
    description: 'טיול משפחתי בירושלים הקדושה'
  };

  beforeEach(() => {
    // Reset store state
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

  describe('Vacation Creation Modal Integration', () => {
    const mockOnClose = jest.fn();
    const mockOnSuccess = jest.fn();

    beforeEach(() => {
      mockOnClose.mockClear();
      mockOnSuccess.mockClear();
    });

    it('should render vacation creation form with Hebrew labels', () => {
      render(
        <VacationCreateModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSuccess={mockOnSuccess} 
        />
      );

      expect(screen.getByText('יצירת חופשה חדשה')).toBeInTheDocument();
      expect(screen.getByLabelText(/כותרת החופשה/)).toBeInTheDocument();
      expect(screen.getByLabelText(/יעד החופשה/)).toBeInTheDocument();
      expect(screen.getByLabelText(/תאריך התחלה/)).toBeInTheDocument();
      expect(screen.getByLabelText(/תאריך סיום/)).toBeInTheDocument();
      expect(screen.getByLabelText(/מספר משתתפים/)).toBeInTheDocument();
    });

    it('should validate form fields and show Hebrew error messages', async () => {
      const user = userEvent.setup();
      
      render(
        <VacationCreateModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSuccess={mockOnSuccess} 
        />
      );

      // Try to submit empty form
      const submitButton = screen.getByText('צור חופשה');
      await user.click(submitButton);

      // Should show validation errors
      expect(screen.getByText(/שדה זה הוא חובה/)).toBeInTheDocument();
    });

    it('should create vacation successfully with valid data', async () => {
      const user = userEvent.setup();
      
      render(
        <VacationCreateModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSuccess={mockOnSuccess} 
        />
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/כותרת החופשה/), 'טיול בפריז');
      await user.type(screen.getByLabelText(/יעד החופשה/), 'פריז, צרפת');
      await user.type(screen.getByLabelText(/תאריך התחלה/), '2024-08-15');
      await user.type(screen.getByLabelText(/תאריך סיום/), '2024-08-22');
      await user.clear(screen.getByLabelText(/מספר משתתפים/));
      await user.type(screen.getByLabelText(/מספר משתתפים/), '2');
      await user.type(screen.getByLabelText(/תקציב משוער/), '8000');

      // Submit form
      const submitButton = screen.getByText('צור חופשה');
      await user.click(submitButton);

      // Verify vacation was added to store
      await waitFor(() => {
        const vacations = use_vacation_store.getState().vacations;
        expect(vacations).toHaveLength(1);
        expect(vacations[0].title).toBe('טיול בפריז');
        expect(vacations[0].destination).toBe('פריז, צרפת');
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('should handle destination suggestions', async () => {
      const user = userEvent.setup();
      
      render(
        <VacationCreateModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSuccess={mockOnSuccess} 
        />
      );

      const destinationInput = screen.getByLabelText(/יעד החופשה/);
      
      // Type partial destination
      await user.type(destinationInput, 'תל');

      // Should show suggestions
      await waitFor(() => {
        expect(screen.getByText('תל אביב')).toBeInTheDocument();
      });

      // Click on suggestion
      await user.click(screen.getByText('תל אביב'));

      // Should fill the input
      expect(destinationInput).toHaveValue('תל אביב, ישראל');
    });

    it('should validate date range correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <VacationCreateModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSuccess={mockOnSuccess} 
        />
      );

      // Set end date before start date
      await user.type(screen.getByLabelText(/תאריך התחלה/), '2024-08-22');
      await user.type(screen.getByLabelText(/תאריך סיום/), '2024-08-15');

      // Try to submit
      const submitButton = screen.getByText('צור חופשה');
      await user.click(submitButton);

      // Should show date validation error
      expect(screen.getByText(/תאריך הסיום צריך להיות אחרי תאריך ההתחלה/)).toBeInTheDocument();
    });
  });

  describe('Vacation Grid Integration', () => {
    beforeEach(() => {
      // Add sample vacations to store
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

    it('should display all vacations in grid format', () => {
      render(<VacationGrid />);

      expect(screen.getByText('טיול בפריז')).toBeInTheDocument();
      expect(screen.getByText('חופשה בתאילנד')).toBeInTheDocument();
      expect(screen.getByText('פריז, צרפת')).toBeInTheDocument();
      expect(screen.getByText('בנגקוק, תאילנד')).toBeInTheDocument();
    });

    it('should handle empty state correctly', () => {
      // Clear vacations
      act(() => {
        use_vacation_store.setState({ vacations: [] });
      });

      render(<VacationGrid />);

      expect(screen.getByText(/עדיין אין לכם חופשות/)).toBeInTheDocument();
      expect(screen.getByText(/צרו את החופשה הראשונה שלכם/)).toBeInTheDocument();
    });

    it('should handle vacation card interactions', async () => {
      const user = userEvent.setup();
      
      render(<VacationGrid />);

      // Find first vacation card
      const vacationCard = screen.getByText('טיול בפריז').closest('[data-testid="vacation-card"]');
      expect(vacationCard).toBeInTheDocument();

      // Click on vacation card
      await user.click(vacationCard!);

      // Should set as current vacation
      const currentVacation = use_vacation_store.getState().current_vacation;
      expect(currentVacation?.title).toBe('טיול בפריז');
    });
  });

  describe('Vacation Card Component Integration', () => {
    it('should display vacation information correctly', () => {
      render(<VacationCard vacation={sample_vacation} />);

      expect(screen.getByText('טיול בירושלים')).toBeInTheDocument();
      expect(screen.getByText('ירושלים, ישראל')).toBeInTheDocument();
      expect(screen.getByText('4 משתתפים')).toBeInTheDocument();
      expect(screen.getByText('5,000₪')).toBeInTheDocument();
    });

    it('should show correct status badge with Hebrew text', () => {
      render(<VacationCard vacation={sample_vacation} />);

      expect(screen.getByText('בתכנון')).toBeInTheDocument(); // "planning" status in Hebrew
    });

    it('should display vacation dates in Hebrew format', () => {
      render(<VacationCard vacation={sample_vacation} />);

      // Should show Hebrew date format
      expect(screen.getByText(/15\/7\/2024 - 22\/7\/2024/)).toBeInTheDocument();
    });

    it('should handle vacation actions menu', async () => {
      const user = userEvent.setup();
      
      render(<VacationCard vacation={sample_vacation} />);

      // Find and click actions menu
      const actionsButton = screen.getByRole('button', { name: /פעולות/ });
      await user.click(actionsButton);

      // Should show menu options
      expect(screen.getByText('עריכה')).toBeInTheDocument();
      expect(screen.getByText('שיתוף')).toBeInTheDocument();
      expect(screen.getByText('מחיקה')).toBeInTheDocument();
    });

    it('should handle vacation deletion with confirmation', async () => {
      const user = userEvent.setup();
      
      render(<VacationCard vacation={sample_vacation} />);

      // Open actions menu
      const actionsButton = screen.getByRole('button', { name: /פעולות/ });
      await user.click(actionsButton);

      // Click delete
      const deleteButton = screen.getByText('מחיקה');
      await user.click(deleteButton);

      // Should show confirmation dialog
      expect(screen.getByText(/האם אתם בטוחים שאתם רוצים למחוק/)).toBeInTheDocument();

      // Confirm deletion
      const confirmButton = screen.getByText('מחק');
      await user.click(confirmButton);

      // Vacation should be removed from store
      await waitFor(() => {
        const vacations = use_vacation_store.getState().vacations;
        expect(vacations.find(v => v.id === sample_vacation.id)).toBeUndefined();
      });
    });
  });

  describe('Vacation Update Integration', () => {
    beforeEach(() => {
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
      });
    });

    it('should update vacation details successfully', async () => {
      const user = userEvent.setup();
      const vacation = use_vacation_store.getState().vacations[0];
      
      render(<VacationCard vacation={vacation} />);

      // Open edit modal
      const actionsButton = screen.getByRole('button', { name: /פעולות/ });
      await user.click(actionsButton);
      
      const editButton = screen.getByText('עריכה');
      await user.click(editButton);

      // Update vacation title
      const titleInput = screen.getByDisplayValue('טיול בפריז');
      await user.clear(titleInput);
      await user.type(titleInput, 'טיול רומנטי בפריז');

      // Save changes
      const saveButton = screen.getByText('שמור שינויים');
      await user.click(saveButton);

      // Verify vacation was updated
      await waitFor(() => {
        const updatedVacation = use_vacation_store.getState().vacations[0];
        expect(updatedVacation.title).toBe('טיול רומנטי בפריז');
      });
    });

    it('should handle status changes', async () => {
      const user = userEvent.setup();
      const vacation = use_vacation_store.getState().vacations[0];
      
      render(<VacationCard vacation={vacation} />);

      // Change status to confirmed
      const statusButton = screen.getByText('בתכנון');
      await user.click(statusButton);

      const confirmedOption = screen.getByText('מאושר');
      await user.click(confirmedOption);

      // Verify status change
      await waitFor(() => {
        const updatedVacation = use_vacation_store.getState().vacations[0];
        expect(updatedVacation.status).toBe('confirmed');
      });
    });
  });

  describe('Vacation Search and Filter Integration', () => {
    beforeEach(() => {
      // Add multiple vacations with different properties
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

        use_vacation_store.getState().add_vacation({
          title: 'סוף שבוע ברומא',
          destination: 'רומא, איטליה',
          start_date: '2024-09-05',
          end_date: '2024-09-08',
          participants: 2,
          budget: 3000,
          status: 'confirmed'
        });
      });
    });

    it('should filter vacations by search query', () => {
      const searchQuery = 'פריז';
      const vacations = use_vacation_store.getState().vacations;
      
      const filteredVacations = vacations.filter(vacation =>
        vacation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vacation.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filteredVacations).toHaveLength(1);
      expect(filteredVacations[0].title).toBe('טיול בפריז');
    });

    it('should filter vacations by status', () => {
      const vacations = use_vacation_store.getState().vacations;
      
      const draftVacations = vacations.filter(v => v.status === 'draft');
      const planningVacations = vacations.filter(v => v.status === 'planning');
      const confirmedVacations = vacations.filter(v => v.status === 'confirmed');

      expect(draftVacations).toHaveLength(1);
      expect(planningVacations).toHaveLength(1);
      expect(confirmedVacations).toHaveLength(1);
    });

    it('should filter vacations by budget range', () => {
      const vacations = use_vacation_store.getState().vacations;
      
      const budgetFilter = (min: number, max: number) =>
        vacations.filter(v => v.budget && v.budget >= min && v.budget <= max);

      const lowBudgetVacations = budgetFilter(0, 5000);
      const midBudgetVacations = budgetFilter(5000, 10000);

      expect(lowBudgetVacations).toHaveLength(1); // Rome vacation
      expect(midBudgetVacations).toHaveLength(2); // Paris and Thailand
    });
  });

  describe('Error Handling in Vacation Management', () => {
    it('should handle validation errors gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <VacationCreateModal 
          isOpen={true} 
          onClose={jest.fn()} 
          onSuccess={jest.fn()} 
        />
      );

      // Set invalid date range
      await user.type(screen.getByLabelText(/תאריך התחלה/), '2024-08-22');
      await user.type(screen.getByLabelText(/תאריך סיום/), '2024-08-15');

      const submitButton = screen.getByText('צור חופשה');
      await user.click(submitButton);

      // Should show error message
      expect(screen.getByText(/תאריך הסיום צריך להיות אחרי תאריך ההתחלה/)).toBeInTheDocument();
    });

    it('should handle store errors', () => {
      // Set error state
      act(() => {
        use_vacation_store.getState().set_error('שגיאה בשמירת החופשה');
      });

      render(<VacationGrid />);

      expect(screen.getByText(/שגיאה בשמירת החופשה/)).toBeInTheDocument();
    });

    it('should show loading states during operations', () => {
      // Set loading state
      act(() => {
        use_vacation_store.getState().set_loading(true);
      });

      render(<VacationGrid />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });
});