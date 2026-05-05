import { ToolRateLimiter } from '../rate-limit';

describe('ToolRateLimiter', () => {
  describe('within limits', () => {
    it('should allow calls within per-minute limit', () => {
      const limiter = new ToolRateLimiter({ maxCallsPerMinute: 5, maxCallsPerHour: 100 });
      for (let i = 0; i < 5; i++) {
        expect(limiter.check().allowed).toBe(true);
      }
    });

    it('should reject when per-minute limit exceeded', () => {
      const limiter = new ToolRateLimiter({ maxCallsPerMinute: 2, maxCallsPerHour: 100 });
      limiter.check();
      limiter.check();
      const result = limiter.check();
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('2/min');
      expect(result.retryAfterMs).toBeGreaterThan(0);
    });
  });

  describe('sliding window', () => {
    it('should allow after oldest entry expires', () => {
      jest.useFakeTimers();
      const limiter = new ToolRateLimiter({ maxCallsPerMinute: 1, maxCallsPerHour: 100 });

      limiter.check(); // consume the 1 slot
      expect(limiter.check().allowed).toBe(false);

      jest.advanceTimersByTime(61_000); // 61 seconds later
      expect(limiter.check().allowed).toBe(true);

      jest.useRealTimers();
    });
  });

  describe('getUsage', () => {
    it('should return current counts', () => {
      const limiter = new ToolRateLimiter({ maxCallsPerMinute: 10, maxCallsPerHour: 100 });
      limiter.check();
      limiter.check();
      const usage = limiter.getUsage();
      expect(usage.minute).toBe(2);
      expect(usage.hour).toBe(2);
    });
  });

  describe('rejected calls', () => {
    it('should NOT increment counters on rejection', () => {
      const limiter = new ToolRateLimiter({ maxCallsPerMinute: 1, maxCallsPerHour: 100 });
      limiter.check(); // allowed
      limiter.check(); // rejected
      limiter.check(); // rejected
      expect(limiter.getUsage().minute).toBe(1);
    });
  });
});
