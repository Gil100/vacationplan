import {
  format_currency,
  parse_currency,
  format_budget_range,
  calculate_budget_percentage,
  get_budget_status,
  format_cost_per_person,
  convert_currency
} from '../currency_utils';

describe('Currency Utils', () => {
  describe('format_currency', () => {
    it('should format NIS currency correctly', () => {
      expect(format_currency(1000, 'NIS')).toBe('1,000₪');
      expect(format_currency(1234.56, 'NIS')).toBe('1,234.56₪');
      expect(format_currency(100, 'NIS')).toBe('100₪');
    });

    it('should format USD currency correctly', () => {
      expect(format_currency(1000, 'USD')).toBe('$1,000');
      expect(format_currency(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('should format EUR currency correctly', () => {
      expect(format_currency(1000, 'EUR')).toBe('€1,000');
      expect(format_currency(1234.56, 'EUR')).toBe('€1,234.56');
    });

    it('should handle negative amounts', () => {
      expect(format_currency(-1000, 'NIS')).toBe('-1,000₪');
      expect(format_currency(-1000, 'USD')).toBe('-$1,000');
    });

    it('should handle zero amount', () => {
      expect(format_currency(0, 'NIS')).toBe('0₪');
    });

    it('should default to NIS when no currency specified', () => {
      expect(format_currency(1000)).toBe('1,000₪');
    });

    it('should not show decimals for whole numbers', () => {
      expect(format_currency(1000.00, 'NIS')).toBe('1,000₪');
    });

    it('should show decimals for non-whole numbers', () => {
      expect(format_currency(1000.50, 'NIS')).toBe('1,000.5₪');
      expect(format_currency(1000.12, 'NIS')).toBe('1,000.12₪');
    });
  });

  describe('parse_currency', () => {
    it('should parse currency strings correctly', () => {
      expect(parse_currency('1,000₪')).toBe(1000);
      expect(parse_currency('$1,234.56')).toBe(1234.56);
      expect(parse_currency('€500')).toBe(500);
    });

    it('should handle strings with spaces', () => {
      expect(parse_currency('1 000 ₪')).toBe(1000);
      expect(parse_currency(' $1,234 ')).toBe(1234);
    });

    it('should handle empty or invalid strings', () => {
      expect(parse_currency('')).toBe(0);
      expect(parse_currency('invalid')).toBe(0);
      expect(parse_currency('₪₪₪')).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(parse_currency('-1,000₪')).toBe(-1000);
    });

    it('should handle decimal numbers', () => {
      expect(parse_currency('1,234.56₪')).toBe(1234.56);
    });
  });

  describe('format_budget_range', () => {
    it('should format range with different amounts', () => {
      expect(format_budget_range(1000, 2000, 'NIS')).toBe('1,000₪ - 2,000₪');
      expect(format_budget_range(500, 1500, 'USD')).toBe('$500 - $1,500');
    });

    it('should format single amount when min equals max', () => {
      expect(format_budget_range(1000, 1000, 'NIS')).toBe('1,000₪');
      expect(format_budget_range(500, 500, 'USD')).toBe('$500');
    });

    it('should default to NIS currency', () => {
      expect(format_budget_range(1000, 2000)).toBe('1,000₪ - 2,000₪');
    });
  });

  describe('calculate_budget_percentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculate_budget_percentage(500, 1000)).toBe(50);
      expect(calculate_budget_percentage(1000, 1000)).toBe(100);
      expect(calculate_budget_percentage(1500, 1000)).toBe(150);
    });

    it('should handle zero total budget', () => {
      expect(calculate_budget_percentage(500, 0)).toBe(0);
    });

    it('should handle zero spent amount', () => {
      expect(calculate_budget_percentage(0, 1000)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(calculate_budget_percentage(333.33, 1000)).toBeCloseTo(33.33, 2);
    });
  });

  describe('get_budget_status', () => {
    it('should return "under" for low spending', () => {
      expect(get_budget_status(500, 1000)).toBe('under'); // 50%
      expect(get_budget_status(700, 1000)).toBe('under'); // 70%
    });

    it('should return "near" for high spending', () => {
      expect(get_budget_status(800, 1000)).toBe('near'); // 80%
      expect(get_budget_status(950, 1000)).toBe('near'); // 95%
    });

    it('should return "over" for exceeded budget', () => {
      expect(get_budget_status(1000, 1000)).toBe('over'); // 100%
      expect(get_budget_status(1200, 1000)).toBe('over'); // 120%
    });

    it('should handle edge cases', () => {
      expect(get_budget_status(799.99, 1000)).toBe('under'); // 79.99%
      expect(get_budget_status(800, 1000)).toBe('near'); // exactly 80%
      expect(get_budget_status(999.99, 1000)).toBe('near'); // 99.99%
      expect(get_budget_status(1000, 1000)).toBe('over'); // exactly 100%
    });

    it('should handle zero budget', () => {
      expect(get_budget_status(500, 0)).toBe('under'); // returns 0%
    });
  });

  describe('format_cost_per_person', () => {
    it('should calculate and format cost per person', () => {
      expect(format_cost_per_person(1000, 4)).toBe('250₪');
      expect(format_cost_per_person(1500, 3)).toBe('500₪');
    });

    it('should handle zero participants', () => {
      expect(format_cost_per_person(1000, 0)).toBe('0₪');
    });

    it('should handle decimal results', () => {
      expect(format_cost_per_person(1000, 3)).toBe('333.33₪');
    });

    it('should handle zero cost', () => {
      expect(format_cost_per_person(0, 4)).toBe('0₪');
    });
  });

  describe('convert_currency', () => {
    it('should convert NIS to USD', () => {
      const result = convert_currency(100, 'NIS', 'USD');
      expect(result).toBeCloseTo(27, 1); // 100 * 0.27
    });

    it('should convert USD to NIS', () => {
      const result = convert_currency(100, 'USD', 'NIS');
      expect(result).toBeCloseTo(370, 1); // 100 * 3.7
    });

    it('should convert NIS to EUR', () => {
      const result = convert_currency(100, 'NIS', 'EUR');
      expect(result).toBeCloseTo(25, 1); // 100 * 0.25
    });

    it('should convert USD to EUR', () => {
      const result = convert_currency(100, 'USD', 'EUR');
      expect(result).toBeCloseTo(92, 1); // 100 * 0.92
    });

    it('should handle same currency conversion', () => {
      expect(convert_currency(100, 'NIS', 'NIS')).toBe(100);
      expect(convert_currency(100, 'USD', 'USD')).toBe(100);
      expect(convert_currency(100, 'EUR', 'EUR')).toBe(100);
    });

    it('should handle zero amount', () => {
      expect(convert_currency(0, 'NIS', 'USD')).toBe(0);
    });

    it('should handle decimal amounts', () => {
      const result = convert_currency(50.5, 'NIS', 'USD');
      expect(result).toBeCloseTo(13.635, 3); // 50.5 * 0.27
    });
  });
});