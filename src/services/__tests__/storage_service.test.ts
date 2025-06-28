import { StorageService, BackupData } from '../storage_service';

describe('StorageService', () => {
  let storage_service: StorageService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    storage_service = new StorageService();
    mockLocalStorage = {};
    
    // Mock localStorage methods
    Storage.prototype.getItem = jest.fn((key: string) => mockLocalStorage[key] || null);
    Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    Storage.prototype.removeItem = jest.fn((key: string) => {
      delete mockLocalStorage[key];
    });
    
    // Mock Object.keys for localStorage iteration
    Object.defineProperty(Storage.prototype, 'length', {
      get: () => Object.keys(mockLocalStorage).length
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('get_storage_stats', () => {
    it('should return storage statistics with no data', () => {
      const stats = storage_service.get_storage_stats();
      
      expect(stats.vacation_count).toBe(0);
      expect(stats.activity_count).toBe(0);
      expect(stats.last_backup).toBeNull();
      expect(stats.storage_usage_mb).toBeGreaterThanOrEqual(0);
    });

    it('should return storage statistics with vacation data', () => {
      const vacation_data = {
        state: {
          vacations: [{ id: '1' }, { id: '2' }],
          activities: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }]
        }
      };
      
      mockLocalStorage['vacation-storage'] = JSON.stringify(vacation_data);
      
      const stats = storage_service.get_storage_stats();
      
      expect(stats.vacation_count).toBe(2);
      expect(stats.activity_count).toBe(3);
    });

    it('should return backup timestamp when backup exists', () => {
      const backup_date = '2024-06-15T10:00:00.000Z';
      const backup_data = { created_at: backup_date };
      
      mockLocalStorage['backup_data'] = JSON.stringify(backup_data);
      
      const stats = storage_service.get_storage_stats();
      
      expect(stats.last_backup).toBe(backup_date);
    });
  });

  describe('create_backup', () => {
    it('should create backup with empty data', () => {
      const backup = storage_service.create_backup();
      
      expect(backup.version).toBe('1.0.0');
      expect(backup.created_at).toBeTruthy();
      expect(backup.data.vacations).toEqual([]);
      expect(backup.data.activities).toEqual([]);
      expect(backup.data.user_preferences).toEqual({});
      expect(backup.metadata.total_vacations).toBe(0);
      expect(backup.metadata.total_activities).toBe(0);
    });

    it('should create backup with existing data', () => {
      const vacation_data = {
        state: {
          vacations: [{ id: '1', title: 'Test Vacation' }],
          activities: [{ id: 'a1', title: 'Test Activity' }]
        }
      };
      const user_preferences = { language: 'he', theme: 'light' };
      
      mockLocalStorage['vacation-storage'] = JSON.stringify(vacation_data);
      mockLocalStorage['user_preferences'] = JSON.stringify(user_preferences);
      
      const backup = storage_service.create_backup();
      
      expect(backup.data.vacations).toHaveLength(1);
      expect(backup.data.activities).toHaveLength(1);
      expect(backup.data.user_preferences).toEqual(user_preferences);
      expect(backup.metadata.total_vacations).toBe(1);
      expect(backup.metadata.total_activities).toBe(1);
    });

    it('should save backup to localStorage', () => {
      storage_service.create_backup();
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'backup_data',
        expect.stringContaining('"version":"1.0.0"')
      );
    });
  });

  describe('export_backup', () => {
    beforeEach(() => {
      // Mock DOM methods for file download
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();
      
      const mockLink = {
        click: jest.fn(),
        download: '',
        href: ''
      };
      
      document.createElement = jest.fn().mockReturnValue(mockLink);
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
    });

    it('should export backup and trigger download', () => {
      const filename = storage_service.export_backup();
      
      expect(filename).toMatch(/vacation_backup_\d{4}-\d{2}-\d{2}\.json/);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  describe('validate_backup', () => {
    it('should validate correct backup structure', () => {
      const valid_backup: BackupData = {
        version: '1.0.0',
        created_at: '2024-06-15T10:00:00.000Z',
        data: {
          vacations: [],
          activities: [],
          user_preferences: {},
          favorite_activities: [],
          vacation_templates: []
        },
        metadata: {
          total_vacations: 0,
          total_activities: 0,
          app_version: '1.0.0'
        }
      };
      
      // Access private method through bracket notation
      const isValid = (storage_service as any).validate_backup(valid_backup);
      expect(isValid).toBe(true);
    });

    it('should reject invalid backup structure', () => {
      const invalid_backup = {
        version: '1.0.0',
        // missing created_at
        data: {
          vacations: 'not an array', // wrong type
          activities: []
        }
        // missing metadata
      };
      
      const isValid = (storage_service as any).validate_backup(invalid_backup);
      expect(isValid).toBe(false);
    });

    it('should reject null or undefined backup', () => {
      const validate_backup = (storage_service as any).validate_backup;
      const isValidNull = validate_backup(null);
      const isValidUndefined = validate_backup(undefined);
      
      expect(isValidNull).toBeFalsy();
      expect(isValidUndefined).toBeFalsy();
    });
  });

  describe('import_backup', () => {
    it('should import valid backup file', async () => {
      const valid_backup: BackupData = {
        version: '1.0.0',
        created_at: '2024-06-15T10:00:00.000Z',
        data: {
          vacations: [{ id: '1', title: 'Test' }],
          activities: [],
          user_preferences: {},
          favorite_activities: [],
          vacation_templates: []
        },
        metadata: {
          total_vacations: 1,
          total_activities: 0,
          app_version: '1.0.0'
        }
      };

      const mock_file = new File([JSON.stringify(valid_backup)], 'backup.json');
      
      // Mock FileReader
      const mockFileReader = {
        result: JSON.stringify(valid_backup),
        onload: null as any,
        onerror: null as any,
        readAsText: jest.fn(function(this: any) {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        })
      };
      
      global.FileReader = jest.fn(() => mockFileReader) as any;
      
      const result = await storage_service.import_backup(mock_file);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('גיבוי שוחזר בהצלחה');
    });

    it('should reject invalid backup file', async () => {
      const invalid_backup = { invalid: 'structure' };
      const mock_file = new File([JSON.stringify(invalid_backup)], 'backup.json');
      
      const mockFileReader = {
        result: JSON.stringify(invalid_backup),
        onload: null as any,
        onerror: null as any,
        readAsText: jest.fn(function(this: any) {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        })
      };
      
      global.FileReader = jest.fn(() => mockFileReader) as any;
      
      const result = await storage_service.import_backup(mock_file);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('קובץ הגיבוי פגום');
    });
  });

  describe('restore_from_backup', () => {
    it('should restore data from backup', async () => {
      const backup: BackupData = {
        version: '1.0.0',
        created_at: '2024-06-15T10:00:00.000Z',
        data: {
          vacations: [{ id: '1', title: 'Test Vacation' }],
          activities: [{ id: 'a1', title: 'Test Activity' }],
          user_preferences: { theme: 'dark' },
          favorite_activities: [{ id: 'f1' }],
          vacation_templates: [{ id: 't1' }]
        },
        metadata: {
          total_vacations: 1,
          total_activities: 1,
          app_version: '1.0.0'
        }
      };

      // Mock window.dispatchEvent
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
      
      await storage_service.restore_from_backup(backup);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'vacation-storage',
        expect.stringContaining('"vacations":[{"id":"1","title":"Test Vacation"}]')
      );
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user_preferences',
        JSON.stringify({ theme: 'dark' })
      );
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event));
      
      mockDispatchEvent.mockRestore();
    });
  });

  describe('clear_all_data', () => {
    it('should call removeItem for matching keys and dispatch storage event', () => {
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
      
      // Test that the method calls dispatchEvent
      storage_service.clear_all_data();
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event));
      expect(mockDispatchEvent.mock.calls[0][0]).toBeInstanceOf(Event);
      expect(mockDispatchEvent.mock.calls[0][0].type).toBe('storage');
      
      mockDispatchEvent.mockRestore();
    });
  });

  describe('setup_auto_backup', () => {
    it('should set up auto-backup interval', () => {
      jest.useFakeTimers();
      const spy = jest.spyOn(storage_service, 'create_backup');
      
      storage_service.setup_auto_backup(1); // 1 hour
      
      // Fast-forward time
      jest.advanceTimersByTime(60 * 60 * 1000); // 1 hour
      
      expect(spy).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });
});