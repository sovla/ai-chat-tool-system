jest.mock('../providers/provider-factory', () => ({
  createProvider: () => ({
    provider: {},
    model: 'mock-model',
  }),
}));

jest.mock('ai', () => ({
  generateText: jest.fn(),
  stepCountIs: jest.fn(() => () => false),
}));

import { chat } from '../chat';
import { generateText } from 'ai';

describe('chat()', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    jest.clearAllMocks();
  });

  describe('input validation', () => {
    it('should reject empty input', async () => {
      const result = await chat('');
      expect(result).toHaveProperty('error');
    });

    it('should reject overly long input', async () => {
      const longInput = 'a'.repeat(2001);
      const result = await chat(longInput);
      expect(result).toHaveProperty('error');
      expect((result as any).error).toContain('1-2000');
    });
  });

  describe('error handling', () => {
    it('should handle provider errors gracefully', async () => {
      (generateText as jest.Mock).mockRejectedValue(new Error('Network timeout'));
      const result = await chat('hello');
      expect(result).toHaveProperty('error');
      expect((result as any).error).toBe('Service temporarily unavailable');
    });
  });
});
