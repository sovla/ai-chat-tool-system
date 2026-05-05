import { toolRegistry, isAllowedTool } from '../registry';

describe('Tool Registry', () => {
  describe('isAllowedTool', () => {
    it('should return true for registered tools', () => {
      expect(isAllowedTool('searchItems')).toBe(true);
      expect(isAllowedTool('getStats')).toBe(true);
      expect(isAllowedTool('recommend')).toBe(true);
    });

    it('should return false for unknown tools', () => {
      expect(isAllowedTool('runQuery')).toBe(false);
      expect(isAllowedTool('deleteAll')).toBe(false);
      expect(isAllowedTool('')).toBe(false);
    });

    it('should prevent prototype pollution', () => {
      expect(isAllowedTool('__proto__')).toBe(false);
      expect(isAllowedTool('constructor')).toBe(false);
      expect(isAllowedTool('toString')).toBe(false);
    });
  });

  describe('registry completeness', () => {
    it('should have exactly 3 tools', () => {
      expect(Object.keys(toolRegistry)).toHaveLength(3);
    });

    it('each tool should have description, parameters, and execute', () => {
      for (const [, tool] of Object.entries(toolRegistry)) {
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('parameters');
        expect(tool).toHaveProperty('execute');
      }
    });
  });
});
