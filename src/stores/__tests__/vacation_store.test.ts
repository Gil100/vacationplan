import { act, renderHook } from '@testing-library/react';
import { use_vacation_store, Vacation, VacationActivity } from '../vacation_store';

// Mock zustand persist middleware
jest.mock('zustand/middleware', () => ({
  devtools: (fn: any) => fn,
  persist: (fn: any) => fn,
}));

describe('Vacation Store', () => {
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

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => use_vacation_store());
      
      expect(result.current.vacations).toEqual([]);
      expect(result.current.activities).toEqual([]);
      expect(result.current.current_vacation).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Vacation CRUD Operations', () => {
    const sample_vacation = {
      title: 'טיול בירושלים',
      destination: 'ירושלים',
      start_date: '2024-07-01',
      end_date: '2024-07-05',
      participants: 4,
      budget: 5000,
      description: 'טיול משפחתי בירושלים',
      status: 'draft' as const,
    };

    describe('add_vacation', () => {
      it('should add new vacation with generated ID and timestamps', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        act(() => {
          result.current.add_vacation(sample_vacation);
        });
        
        expect(result.current.vacations).toHaveLength(1);
        
        const added_vacation = result.current.vacations[0];
        expect(added_vacation.title).toBe(sample_vacation.title);
        expect(added_vacation.destination).toBe(sample_vacation.destination);
        expect(added_vacation.id).toBeTruthy();
        expect(added_vacation.created_at).toBeTruthy();
        expect(added_vacation.updated_at).toBeTruthy();
      });

      it('should add multiple vacations', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        act(() => {
          result.current.add_vacation(sample_vacation);
          result.current.add_vacation({
            ...sample_vacation,
            title: 'טיול בתל אביב',
            destination: 'תל אביב',
          });
        });
        
        expect(result.current.vacations).toHaveLength(2);
        expect(result.current.vacations[0].title).toBe('טיול בירושלים');
        expect(result.current.vacations[1].title).toBe('טיול בתל אביב');
      });
    });

    describe('update_vacation', () => {
      it('should update existing vacation', async () => {
        const { result } = renderHook(() => use_vacation_store());
        
        // Add vacation first
        act(() => {
          result.current.add_vacation(sample_vacation);
        });
        
        const vacation_id = result.current.vacations[0].id;
        const original_updated_at = result.current.vacations[0].updated_at;
        
        // Wait a bit to ensure timestamp difference
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Update vacation
        act(() => {
          result.current.update_vacation(vacation_id, {
            title: 'טיול מעודכן בירושלים',
            budget: 6000,
          });
        });
        
        const updated_vacation = result.current.vacations[0];
        expect(updated_vacation.title).toBe('טיול מעודכן בירושלים');
        expect(updated_vacation.budget).toBe(6000);
        expect(updated_vacation.destination).toBe('ירושלים'); // unchanged
        expect(updated_vacation.updated_at).not.toBe(original_updated_at);
      });

      it('should update current_vacation if it matches', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        // Add and set current vacation
        act(() => {
          result.current.add_vacation(sample_vacation);
        });
        
        const vacation = result.current.vacations[0];
        
        act(() => {
          result.current.set_current_vacation(vacation);
        });
        
        // Update vacation
        act(() => {
          result.current.update_vacation(vacation.id, {
            title: 'טיול מעודכן',
          });
        });
        
        expect(result.current.current_vacation?.title).toBe('טיול מעודכן');
      });

      it('should not update non-existent vacation', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        act(() => {
          result.current.add_vacation(sample_vacation);
        });
        
        const original_count = result.current.vacations.length;
        
        act(() => {
          result.current.update_vacation('non-existent-id', {
            title: 'Updated',
          });
        });
        
        expect(result.current.vacations).toHaveLength(original_count);
        expect(result.current.vacations[0].title).toBe(sample_vacation.title);
      });
    });

    describe('delete_vacation', () => {
      it('should delete vacation and its activities', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        // Add vacation and activity
        act(() => {
          result.current.add_vacation(sample_vacation);
        });
        
        const vacation_id = result.current.vacations[0].id;
        
        act(() => {
          result.current.add_activity({
            vacation_id,
            day: 1,
            title: 'פעילות ראשונה',
            category: 'activity',
          });
        });
        
        expect(result.current.vacations).toHaveLength(1);
        expect(result.current.activities).toHaveLength(1);
        
        // Delete vacation
        act(() => {
          result.current.delete_vacation(vacation_id);
        });
        
        expect(result.current.vacations).toHaveLength(0);
        expect(result.current.activities).toHaveLength(0); // Activities should also be deleted
      });

      it('should clear current_vacation if deleted', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        // Add and set current vacation
        act(() => {
          result.current.add_vacation(sample_vacation);
        });
        
        const vacation = result.current.vacations[0];
        
        act(() => {
          result.current.set_current_vacation(vacation);
        });
        
        expect(result.current.current_vacation).not.toBeNull();
        
        // Delete vacation
        act(() => {
          result.current.delete_vacation(vacation.id);
        });
        
        expect(result.current.current_vacation).toBeNull();
      });
    });

    describe('set_current_vacation', () => {
      it('should set current vacation', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        act(() => {
          result.current.add_vacation(sample_vacation);
        });
        
        const vacation = result.current.vacations[0];
        
        act(() => {
          result.current.set_current_vacation(vacation);
        });
        
        expect(result.current.current_vacation).toEqual(vacation);
      });

      it('should clear current vacation when set to null', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        act(() => {
          result.current.add_vacation(sample_vacation);
          result.current.set_current_vacation(result.current.vacations[0]);
        });
        
        expect(result.current.current_vacation).not.toBeNull();
        
        act(() => {
          result.current.set_current_vacation(null);
        });
        
        expect(result.current.current_vacation).toBeNull();
      });
    });
  });

  describe('Activity CRUD Operations', () => {
    let vacation_id: string;

    beforeEach(() => {
      const { result } = renderHook(() => use_vacation_store());
      
      act(() => {
        result.current.add_vacation({
          title: 'Test Vacation',
          destination: 'Test Destination',
          start_date: '2024-07-01',
          end_date: '2024-07-05',
          participants: 2,
          status: 'draft',
        });
      });
      
      vacation_id = result.current.vacations[0].id;
    });

    const sample_activity = {
      day: 1,
      title: 'ביקור במוזיאון',
      description: 'ביקור במוזיאון ישראל',
      location: 'מוזיאון ישראל',
      start_time: '10:00',
      end_time: '12:00',
      cost: 50,
      category: 'activity' as const,
      notes: 'להזמין כרטיסים מראש',
    };

    describe('add_activity', () => {
      it('should add new activity with generated ID', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        act(() => {
          result.current.add_activity({
            ...sample_activity,
            vacation_id,
          });
        });
        
        expect(result.current.activities).toHaveLength(1);
        
        const added_activity = result.current.activities[0];
        expect(added_activity.title).toBe(sample_activity.title);
        expect(added_activity.vacation_id).toBe(vacation_id);
        expect(added_activity.id).toBeTruthy();
      });

      it('should add multiple activities', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        act(() => {
          result.current.add_activity({
            ...sample_activity,
            vacation_id,
          });
          result.current.add_activity({
            ...sample_activity,
            vacation_id,
            title: 'ארוחת צהריים',
            category: 'food',
          });
        });
        
        expect(result.current.activities).toHaveLength(2);
      });
    });

    describe('update_activity', () => {
      it('should update existing activity', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        // Add activity first
        act(() => {
          result.current.add_activity({
            ...sample_activity,
            vacation_id,
          });
        });
        
        const activity_id = result.current.activities[0].id;
        
        // Update activity
        act(() => {
          result.current.update_activity(activity_id, {
            title: 'ביקור מעודכן במוזיאון',
            cost: 60,
          });
        });
        
        const updated_activity = result.current.activities[0];
        expect(updated_activity.title).toBe('ביקור מעודכן במוזיאון');
        expect(updated_activity.cost).toBe(60);
        expect(updated_activity.location).toBe('מוזיאון ישראל'); // unchanged
      });
    });

    describe('delete_activity', () => {
      it('should delete activity', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        // Add activity first
        act(() => {
          result.current.add_activity({
            ...sample_activity,
            vacation_id,
          });
        });
        
        expect(result.current.activities).toHaveLength(1);
        
        const activity_id = result.current.activities[0].id;
        
        // Delete activity
        act(() => {
          result.current.delete_activity(activity_id);
        });
        
        expect(result.current.activities).toHaveLength(0);
      });
    });

    describe('get_vacation_activities', () => {
      it('should return activities for specific vacation', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        // Add second vacation
        act(() => {
          result.current.add_vacation({
            title: 'Second Vacation',
            destination: 'Test 2',
            start_date: '2024-08-01',
            end_date: '2024-08-05',
            participants: 2,
            status: 'draft',
          });
        });
        
        const vacation2_id = result.current.vacations[1].id;
        
        // Add activities to both vacations
        act(() => {
          result.current.add_activity({
            ...sample_activity,
            vacation_id,
            title: 'Activity 1 for Vacation 1',
          });
          result.current.add_activity({
            ...sample_activity,
            vacation_id,
            title: 'Activity 2 for Vacation 1',
          });
          result.current.add_activity({
            ...sample_activity,
            vacation_id: vacation2_id,
            title: 'Activity 1 for Vacation 2',
          });
        });
        
        const vacation1_activities = result.current.get_vacation_activities(vacation_id);
        const vacation2_activities = result.current.get_vacation_activities(vacation2_id);
        
        expect(vacation1_activities).toHaveLength(2);
        expect(vacation2_activities).toHaveLength(1);
        expect(vacation1_activities[0].title).toContain('Vacation 1');
        expect(vacation2_activities[0].title).toContain('Vacation 2');
      });
    });
  });

  describe('Utility Actions', () => {
    describe('loading state', () => {
      it('should set loading state', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        act(() => {
          result.current.set_loading(true);
        });
        
        expect(result.current.loading).toBe(true);
        
        act(() => {
          result.current.set_loading(false);
        });
        
        expect(result.current.loading).toBe(false);
      });
    });

    describe('error state', () => {
      it('should set error message', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        const error_message = 'שגיאה בטעינת הנתונים';
        
        act(() => {
          result.current.set_error(error_message);
        });
        
        expect(result.current.error).toBe(error_message);
      });

      it('should clear error', () => {
        const { result } = renderHook(() => use_vacation_store());
        
        // Set error first
        act(() => {
          result.current.set_error('Test error');
        });
        
        expect(result.current.error).toBe('Test error');
        
        // Clear error
        act(() => {
          result.current.clear_error();
        });
        
        expect(result.current.error).toBeNull();
      });
    });
  });
});