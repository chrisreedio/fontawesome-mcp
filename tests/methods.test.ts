import { fuzzySearchMethod } from '../src/methods/fuzzySearch';
import { getIconMethod } from '../src/methods/getIcon';

describe('MCP Methods', () => {
  describe('fuzzySearch', () => {
    test('should search for icons by query', () => {
      const result = fuzzySearchMethod.handler({ query: 'home', limit: 5 });
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5);
      
      // Verify result structure
      const firstResult = result[0];
      expect(firstResult).toHaveProperty('name');
      expect(firstResult).toHaveProperty('style');
      expect(firstResult).toHaveProperty('label');
      expect(firstResult).toHaveProperty('search');
      expect(firstResult).toHaveProperty('unicode');
    });

    test('should filter by style', () => {
      const result = fuzzySearchMethod.handler({ 
        query: 'home', 
        limit: 10,
        style: 'solid' 
      });
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // All results should be solid style
      result.forEach(icon => {
        expect(icon.style).toBe('solid');
      });
    });

    test('should handle empty query', () => {
      const result = fuzzySearchMethod.handler({ query: '', limit: 5 });
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5); // Should return first 5 icons
    });

    test('should validate parameters', () => {
      expect(() => {
        fuzzySearchMethod.handler({ limit: 5 } as any); // Missing query
      }).toThrow();

      expect(() => {
        fuzzySearchMethod.handler({ query: 'home', limit: 20, style: 'invalid' as any });
      }).toThrow();
    });
  });

  describe('getIcon', () => {
    test('should get specific icon with SVG', () => {
      const result = getIconMethod.handler({ 
        name: 'house', 
        style: 'solid' 
      });
      
      expect(result).toHaveProperty('name', 'house');
      expect(result).toHaveProperty('style', 'solid');
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('svg');
      expect(result.svg).toContain('<svg');
      expect(result.svg).toContain('</svg>');
    });

    test('should handle different styles', () => {
      const solidResult = getIconMethod.handler({ 
        name: 'house', 
        style: 'solid' 
      });
      
      const regularResult = getIconMethod.handler({ 
        name: 'house', 
        style: 'regular' 
      });
      
      expect(solidResult.style).toBe('solid');
      expect(regularResult.style).toBe('regular');
      expect(solidResult.svg).not.toBe(regularResult.svg); // Different SVGs
    });

    test('should handle non-existent icon', () => {
      const result = getIconMethod.handler({ 
        name: 'nonexistent-icon-name', 
        style: 'solid' 
      });
      
      expect(typeof result).toBe('string');
      expect(result).toContain('not found');
    });

    test('should validate parameters', () => {
      expect(() => {
        getIconMethod.handler({ name: 'house' } as any); // Missing style
      }).toThrow();

      expect(() => {
        getIconMethod.handler({ style: 'solid' } as any); // Missing name
      }).toThrow();

      expect(() => {
        getIconMethod.handler({ name: 'house', style: 'invalid' as any });
      }).toThrow();
    });
  });
});