import { 
  getStatusForYear, 
  LegalDataset
} from '../lib/timelineTypes'

describe('getStatusForYear', () => {
  // Mock dataset for testing
  const mockDataset: LegalDataset = {
    factor: 'Test Factor',
    categories: {
      'Illegal': 0,
      'Legal with restrictions': 1,
      'Fully legal': 2,
    },
    states: {
      // State with no changes
      'AL': [],
      
      // State with one change
      'CA': [
        { year: 2000, status: 1 }
      ],
      
      // State with multiple changes
      'NY': [
        { year: 1990, status: 1 },
        { year: 2005, status: 2 },
        { year: 2015, status: 1 },
        { year: 2020, status: 2 }
      ]
    }
  }

  describe('state with no changes', () => {
    it('should return 0 for any year when state has no recorded changes', () => {
      expect(getStatusForYear('AL', 1990, mockDataset)).toBe(0)
      expect(getStatusForYear('AL', 2000, mockDataset)).toBe(0)
      expect(getStatusForYear('AL', 2025, mockDataset)).toBe(0)
    })

    it('should return 0 for non-existent state', () => {
      expect(getStatusForYear('XX', 2020, mockDataset)).toBe(0)
    })
  })

  describe('state with one change', () => {
    it('should return 0 before the change year', () => {
      expect(getStatusForYear('CA', 1999, mockDataset)).toBe(0)
      expect(getStatusForYear('CA', 1990, mockDataset)).toBe(0)
    })

    it('should return the status on the exact change year', () => {
      expect(getStatusForYear('CA', 2000, mockDataset)).toBe(1)
    })

    it('should return the status after the change year', () => {
      expect(getStatusForYear('CA', 2001, mockDataset)).toBe(1)
      expect(getStatusForYear('CA', 2025, mockDataset)).toBe(1)
    })
  })

  describe('state with multiple changes', () => {
    it('should return 0 before any changes', () => {
      expect(getStatusForYear('NY', 1989, mockDataset)).toBe(0)
      expect(getStatusForYear('NY', 1776, mockDataset)).toBe(0)
    })

    it('should return correct status after first change', () => {
      expect(getStatusForYear('NY', 1990, mockDataset)).toBe(1)
      expect(getStatusForYear('NY', 1995, mockDataset)).toBe(1)
      expect(getStatusForYear('NY', 2004, mockDataset)).toBe(1)
    })

    it('should return correct status after second change', () => {
      expect(getStatusForYear('NY', 2005, mockDataset)).toBe(2)
      expect(getStatusForYear('NY', 2010, mockDataset)).toBe(2)
      expect(getStatusForYear('NY', 2014, mockDataset)).toBe(2)
    })

    it('should return correct status after third change', () => {
      expect(getStatusForYear('NY', 2015, mockDataset)).toBe(1)
      expect(getStatusForYear('NY', 2018, mockDataset)).toBe(1)
      expect(getStatusForYear('NY', 2019, mockDataset)).toBe(1)
    })

    it('should return correct status after fourth change', () => {
      expect(getStatusForYear('NY', 2020, mockDataset)).toBe(2)
      expect(getStatusForYear('NY', 2025, mockDataset)).toBe(2)
    })

    it('should handle exact years of changes', () => {
      expect(getStatusForYear('NY', 1990, mockDataset)).toBe(1)
      expect(getStatusForYear('NY', 2005, mockDataset)).toBe(2)
      expect(getStatusForYear('NY', 2015, mockDataset)).toBe(1)
      expect(getStatusForYear('NY', 2020, mockDataset)).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle very early years', () => {
      expect(getStatusForYear('NY', 1776, mockDataset)).toBe(0)
    })

    it('should handle future years', () => {
      expect(getStatusForYear('NY', 2100, mockDataset)).toBe(2)
    })

    it('should handle empty states object', () => {
      const emptyDataset: LegalDataset = {
        factor: 'Empty',
        categories: {},
        states: {}
      }
      expect(getStatusForYear('CA', 2020, emptyDataset)).toBe(0)
    })
  })
})
