import { toolRateLimiter } from './rate-limit';

export class ToolRateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfterMs: number,
  ) {
    super(message);
    this.name = 'ToolRateLimitError';
  }
}

export function withMiddleware(toolDef: any) {
  const originalExecute = toolDef.execute;
  return {
    ...toolDef,
    execute: async (params: any) => {
      const check = toolRateLimiter.check();
      if (!check.allowed) {
        throw new ToolRateLimitError(check.reason!, check.retryAfterMs!);
      }
      return originalExecute(params);
    },
  };
}
