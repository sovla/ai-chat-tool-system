/**
 * SQL Guard — SQL Injection 패턴 탐지 및 차단
 *
 * Tool 파라미터에 포함된 악의적 SQL 패턴을 런타임에서 차단.
 * ORM(Drizzle)이 1차 방어선이지만, LLM이 생성한 입력은 추가 검증 필요.
 */

const DANGEROUS_PATTERNS = [
  /\b(DROP|DELETE|TRUNCATE|ALTER|CREATE|INSERT|UPDATE)\b/i,
  /\b(UNION\s+SELECT|INTO\s+OUTFILE|LOAD_FILE)\b/i,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,   // OR 1=1
  /(--|#|\/\*)/,                          // SQL 주석
  /(\bEXEC\b|\bEXECUTE\b)/i,
  /\b(xp_|sp_)\w+/i,                     // SQL Server procedures
  /(;|\|\||&&)/,                          // Statement termination / chaining
];

class SqlGuard {
  validateInput(input: string): void {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(input)) {
        throw new SqlGuardError(
          `Blocked: dangerous SQL pattern detected in input "${input.substring(0, 50)}..."`,
          pattern.source,
        );
      }
    }
  }

  validateQuery(query: string, allowedOperations: string[] = ['SELECT']): void {
    const trimmed = query.trim().toUpperCase();
    const operation = trimmed.split(/\s+/)[0];

    if (!allowedOperations.includes(operation)) {
      throw new SqlGuardError(
        `Blocked: operation "${operation}" not in whitelist [${allowedOperations.join(', ')}]`,
        operation,
      );
    }

    this.validateInput(query);
  }
}

class SqlGuardError extends Error {
  constructor(
    message: string,
    public readonly pattern: string,
  ) {
    super(message);
    this.name = 'SqlGuardError';
  }
}

export const sqlGuard = new SqlGuard();
export { SqlGuardError };
