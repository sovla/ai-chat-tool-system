/**
 * Rate Limiter — LLM Tool 호출 횟수 제한
 *
 * 목적:
 * 1. LLM 비용 폭주 방지 (무한 tool 호출 루프)
 * 2. 데이터베이스 부하 제한
 * 3. 외부 API 호출 제한 준수
 */

interface RateLimitConfig {
  maxCallsPerMinute: number;
  maxCallsPerHour: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxCallsPerMinute: 20,
  maxCallsPerHour: 200,
};

class ToolRateLimiter {
  private minuteWindow: number[] = [];
  private hourWindow: number[] = [];
  private readonly config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  check(): { allowed: boolean; reason?: string; retryAfterMs?: number } {
    const now = Date.now();
    this.cleanup(now);

    if (this.minuteWindow.length >= this.config.maxCallsPerMinute) {
      const oldest = this.minuteWindow[0];
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${this.config.maxCallsPerMinute}/min`,
        retryAfterMs: 60_000 - (now - oldest),
      };
    }

    if (this.hourWindow.length >= this.config.maxCallsPerHour) {
      const oldest = this.hourWindow[0];
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${this.config.maxCallsPerHour}/hour`,
        retryAfterMs: 3_600_000 - (now - oldest),
      };
    }

    this.minuteWindow.push(now);
    this.hourWindow.push(now);
    return { allowed: true };
  }

  private cleanup(now: number): void {
    this.minuteWindow = this.minuteWindow.filter((t) => now - t < 60_000);
    this.hourWindow = this.hourWindow.filter((t) => now - t < 3_600_000);
  }

  getUsage(): { minute: number; hour: number } {
    this.cleanup(Date.now());
    return {
      minute: this.minuteWindow.length,
      hour: this.hourWindow.length,
    };
  }
}

export const toolRateLimiter = new ToolRateLimiter();
export { ToolRateLimiter, RateLimitConfig };
