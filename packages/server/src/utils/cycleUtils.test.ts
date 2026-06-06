import { describe, it, expect } from 'vitest';
import { getCycleDates, getCurrentCycleMonth } from './cycleUtils';

describe('cycleUtils', () => {
  describe('getCycleDates', () => {
    it('should return same month cycle dates', () => {
      const referenceDate = new Date(2026, 5, 15); // June 15, 2026
      const { startDate, endDate } = getCycleDates(1, 30, referenceDate);

      expect(startDate.getMonth()).toBe(5); // June
      expect(startDate.getDate()).toBe(1);
      expect(endDate.getMonth()).toBe(5); // June
      expect(endDate.getDate()).toBe(30);
    });

    it('should return cross-month cycle dates when current date is after start day', () => {
      const referenceDate = new Date(2026, 5, 26); // June 26, 2026
      const { startDate, endDate } = getCycleDates(25, 5, referenceDate);

      expect(startDate.getMonth()).toBe(5); // June
      expect(startDate.getDate()).toBe(25);
      expect(endDate.getMonth()).toBe(6); // July
      expect(endDate.getDate()).toBe(5);
    });

    it('should return cross-month cycle dates when current date is before start day', () => {
      const referenceDate = new Date(2026, 5, 3); // June 3, 2026
      const { startDate, endDate } = getCycleDates(25, 5, referenceDate);

      expect(startDate.getMonth()).toBe(4); // May
      expect(startDate.getDate()).toBe(25);
      expect(endDate.getMonth()).toBe(5); // June
      expect(endDate.getDate()).toBe(5);
    });
  });

  describe('getCurrentCycleMonth', () => {
    it('should return current month when date is after cycle start day', () => {
      const referenceDate = new Date(2026, 5, 15); // June 15, 2026
      const { month, year } = getCurrentCycleMonth(1, referenceDate);

      expect(month).toBe(6);
      expect(year).toBe(2026);
    });

    it('should return previous month when date is before cycle start day', () => {
      const referenceDate = new Date(2026, 5, 3); // June 3, 2026
      const { month, year } = getCurrentCycleMonth(5, referenceDate);

      expect(month).toBe(5);
      expect(year).toBe(2026);
    });

    it('should handle January correctly', () => {
      const referenceDate = new Date(2026, 0, 3); // January 3, 2026
      const { month, year } = getCurrentCycleMonth(5, referenceDate);

      expect(month).toBe(12);
      expect(year).toBe(2025);
    });
  });
});
