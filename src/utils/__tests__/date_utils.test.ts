import {
  format_date,
  format_date_hebrew,
  format_time,
  parse_date,
  get_vacation_duration,
  get_vacation_days,
  is_weekend,
  is_today,
  get_hebrew_month,
  get_hebrew_day,
  get_hebrew_day_short,
  format_hebrew_date_full,
  format_hebrew_date_short,
  format_hebrew_time,
  is_shabbat,
  is_friday_evening,
  format_vacation_range,
  get_relative_time_hebrew,
  format_hebrew_date,
  hebrew_months,
  hebrew_days,
  hebrew_days_short
} from '../date_utils';

describe('Date Utils', () => {
  describe('format_date', () => {
    it('should format date with default format', () => {
      const date = new Date('2024-06-15');
      const result = format_date(date);
      expect(result).toMatch(/15\/06\/2024/);
    });

    it('should format date with custom format', () => {
      const date = new Date('2024-06-15');
      const result = format_date(date, 'yyyy-MM-dd');
      expect(result).toBe('2024-06-15');
    });

    it('should handle string dates', () => {
      const result = format_date('2024-06-15');
      expect(result).toMatch(/15\/06\/2024/);
    });
  });

  describe('format_time', () => {
    it('should format valid time string', () => {
      expect(format_time('14:30')).toBe('14:30');
      expect(format_time('09:05')).toBe('09:05');
    });

    it('should return original string for invalid time', () => {
      expect(format_time('invalid')).toBe('invalid');
      expect(format_time('')).toBe('');
    });
  });

  describe('get_vacation_duration', () => {
    it('should calculate duration correctly', () => {
      const start = '2024-06-15';
      const end = '2024-06-20';
      expect(get_vacation_duration(start, end)).toBe(5);
    });

    it('should handle same day vacation', () => {
      const date = '2024-06-15';
      expect(get_vacation_duration(date, date)).toBe(0);
    });

    it('should handle reverse dates', () => {
      const start = '2024-06-20';
      const end = '2024-06-15';
      expect(get_vacation_duration(start, end)).toBe(5);
    });
  });

  describe('get_vacation_days', () => {
    it('should return array of vacation days', () => {
      const start = '2024-06-15';
      const end = '2024-06-17';
      const days = get_vacation_days(start, end);
      
      expect(days).toHaveLength(2);
      expect(days[0]).toEqual(new Date('2024-06-15'));
      expect(days[1]).toEqual(new Date('2024-06-16'));
    });

    it('should handle single day vacation', () => {
      const date = '2024-06-15';
      const days = get_vacation_days(date, date);
      expect(days).toHaveLength(0);
    });
  });

  describe('is_weekend', () => {
    it('should identify Friday as weekend', () => {
      const friday = new Date('2024-06-14'); // Friday
      expect(is_weekend(friday)).toBe(true);
    });

    it('should identify Saturday as weekend', () => {
      const saturday = new Date('2024-06-15'); // Saturday
      expect(is_weekend(saturday)).toBe(true);
    });

    it('should not identify weekdays as weekend', () => {
      const sunday = new Date('2024-06-16'); // Sunday
      const monday = new Date('2024-06-17'); // Monday
      expect(is_weekend(sunday)).toBe(false);
      expect(is_weekend(monday)).toBe(false);
    });
  });

  describe('is_today', () => {
    it('should identify today correctly', () => {
      const today = new Date();
      expect(is_today(today)).toBe(true);
    });

    it('should not identify yesterday as today', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(is_today(yesterday)).toBe(false);
    });
  });

  describe('Hebrew months and days', () => {
    it('should have correct number of Hebrew months', () => {
      expect(hebrew_months).toHaveLength(12);
      expect(hebrew_months[0]).toBe('ינואר');
      expect(hebrew_months[11]).toBe('דצמבר');
    });

    it('should have correct number of Hebrew days', () => {
      expect(hebrew_days).toHaveLength(7);
      expect(hebrew_days[0]).toBe('ראשון');
      expect(hebrew_days[6]).toBe('שבת');
    });

    it('should have correct Hebrew short days', () => {
      expect(hebrew_days_short).toHaveLength(7);
      expect(hebrew_days_short[0]).toBe('א׳');
      expect(hebrew_days_short[6]).toBe('ש׳');
    });
  });

  describe('get_hebrew_month', () => {
    it('should return correct Hebrew month', () => {
      const january = new Date('2024-01-15');
      const december = new Date('2024-12-15');
      
      expect(get_hebrew_month(january)).toBe('ינואר');
      expect(get_hebrew_month(december)).toBe('דצמבר');
    });
  });

  describe('get_hebrew_day', () => {
    it('should return correct Hebrew day', () => {
      const sunday = new Date('2024-06-16'); // Sunday
      const saturday = new Date('2024-06-15'); // Saturday
      
      expect(get_hebrew_day(sunday)).toBe('ראשון');
      expect(get_hebrew_day(saturday)).toBe('שבת');
    });
  });

  describe('format_hebrew_date_short', () => {
    it('should format Hebrew date in short format', () => {
      const date = new Date('2024-06-15');
      const result = format_hebrew_date_short(date);
      expect(result).toBe('15/6/2024');
    });

    it('should handle string dates', () => {
      const result = format_hebrew_date_short('2024-06-15');
      expect(result).toBe('15/6/2024');
    });
  });

  describe('format_hebrew_time', () => {
    it('should format time string correctly', () => {
      expect(format_hebrew_time('9:5')).toBe('09:05');
      expect(format_hebrew_time('14:30')).toBe('14:30');
    });

    it('should format Date object correctly', () => {
      const date = new Date('2024-06-15T14:30:00');
      expect(format_hebrew_time(date)).toBe('14:30');
    });
  });

  describe('is_shabbat', () => {
    it('should identify Saturday as Shabbat', () => {
      const saturday = new Date('2024-06-15'); // Saturday
      expect(is_shabbat(saturday)).toBe(true);
    });

    it('should not identify other days as Shabbat', () => {
      const friday = new Date('2024-06-14'); // Friday
      const sunday = new Date('2024-06-16'); // Sunday
      expect(is_shabbat(friday)).toBe(false);
      expect(is_shabbat(sunday)).toBe(false);
    });
  });

  describe('is_friday_evening', () => {
    it('should identify Friday evening correctly', () => {
      const fridayEvening = new Date('2024-06-14T19:00:00'); // Friday 7 PM
      expect(is_friday_evening(fridayEvening)).toBe(true);
    });

    it('should not identify Friday morning as evening', () => {
      const fridayMorning = new Date('2024-06-14T10:00:00'); // Friday 10 AM
      expect(is_friday_evening(fridayMorning)).toBe(false);
    });

    it('should respect custom hour parameter', () => {
      const fridayAfternoon = new Date('2024-06-14T16:00:00'); // Friday 4 PM
      expect(is_friday_evening(fridayAfternoon, 15)).toBe(true);
      expect(is_friday_evening(fridayAfternoon, 17)).toBe(false);
    });
  });

  describe('format_vacation_range', () => {
    it('should format date range correctly', () => {
      const start = '2024-06-15';
      const end = '2024-06-20';
      const result = format_vacation_range(start, end);
      expect(result).toBe('15/6/2024 - 20/6/2024');
    });

    it('should handle Date objects', () => {
      const start = new Date('2024-06-15');
      const end = new Date('2024-06-20');
      const result = format_vacation_range(start, end);
      expect(result).toBe('15/6/2024 - 20/6/2024');
    });
  });

  describe('get_relative_time_hebrew', () => {
    const now = new Date();
    
    it('should return "היום" for today', () => {
      expect(get_relative_time_hebrew(now)).toBe('היום');
    });

    it('should return "אתמול" for yesterday', () => {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      expect(get_relative_time_hebrew(yesterday)).toBe('אתמול');
    });

    it('should return "מחר" for tomorrow', () => {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(get_relative_time_hebrew(tomorrow)).toBe('מחר');
    });

    it('should return correct format for past days', () => {
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(get_relative_time_hebrew(threeDaysAgo)).toBe('לפני 3 ימים');
    });

    it('should return correct format for future days', () => {
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      expect(get_relative_time_hebrew(threeDaysFromNow)).toBe('בעוד 3 ימים');
    });
  });

  describe('format_hebrew_date', () => {
    const testDate = new Date('2024-06-15'); // Saturday

    it('should format full Hebrew date', () => {
      const result = format_hebrew_date(testDate, 'full');
      expect(result).toContain('יום שבת');
      expect(result).toContain('15');
      expect(result).toContain('יוני');
      expect(result).toContain('2024');
    });

    it('should format short Hebrew date', () => {
      const result = format_hebrew_date(testDate, 'short');
      expect(result).toBe('15/6/2024');
    });

    it('should format medium Hebrew date (default)', () => {
      const result = format_hebrew_date(testDate, 'medium');
      expect(result).toContain('ש׳');
      expect(result).toContain('15');
      expect(result).toContain('יוני');
    });

    it('should use medium format as default', () => {
      const result = format_hebrew_date(testDate);
      expect(result).toEqual(format_hebrew_date(testDate, 'medium'));
    });

    it('should handle string dates', () => {
      const result = format_hebrew_date('2024-06-15', 'short');
      expect(result).toBe('15/6/2024');
    });
  });

  describe('parse_date', () => {
    it('should parse date string correctly', () => {
      const result = parse_date('15/06/2024', 'dd/MM/yyyy');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(5); // June is month 5 (0-indexed)
      expect(result.getDate()).toBe(15);
    });

    it('should use default format', () => {
      const result = parse_date('15/06/2024');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(5);
      expect(result.getDate()).toBe(15);
    });
  });
});