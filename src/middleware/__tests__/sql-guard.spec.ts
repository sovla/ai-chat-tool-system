import { sqlGuard, SqlGuardError } from '../sql-guard';

describe('SqlGuard', () => {
  describe('validateInput — should BLOCK dangerous patterns', () => {
    const dangerousInputs = [
      ['DROP TABLE users', 'DDL'],
      ['DELETE FROM orders', 'DML'],
      ['TRUNCATE TABLE logs', 'DDL'],
      ['INSERT INTO admin', 'DML'],
      ['UPDATE users SET role', 'DML'],
      ['UNION SELECT * FROM passwords', 'UNION'],
      ["' OR 1=1 --", 'tautology + comment'],
      ["admin'--", 'comment injection'],
      ['SELECT * INTO OUTFILE', 'file write'],
      ['EXEC xp_cmdshell', 'stored procedure'],
      ['value; DROP TABLE', 'statement chaining'],
    ];

    test.each(dangerousInputs)('should block: %s (%s)', (input) => {
      expect(() => sqlGuard.validateInput(input)).toThrow(SqlGuardError);
    });

    it('should be case-insensitive', () => {
      expect(() => sqlGuard.validateInput('drop TABLE users')).toThrow();
      expect(() => sqlGuard.validateInput('Drop Table')).toThrow();
    });
  });

  describe('validateInput — should ALLOW legitimate inputs', () => {
    const safeInputs = [
      '전자제품',
      'electronic devices',
      'Android phone',
      '2024-01-15',
      'smartphone under $500',
      'https://example.com/path',
      'red blue green',
      '가격이 5000원 이상',
    ];

    test.each(safeInputs)('should allow: "%s"', (input) => {
      expect(() => sqlGuard.validateInput(input)).not.toThrow();
    });
  });

  describe('validateQuery', () => {
    it('should allow SELECT when whitelisted', () => {
      expect(() => sqlGuard.validateQuery('SELECT * FROM items', ['SELECT'])).not.toThrow();
    });

    it('should block INSERT when only SELECT whitelisted', () => {
      expect(() => sqlGuard.validateQuery('INSERT INTO items', ['SELECT'])).toThrow();
    });
  });

  describe('SqlGuardError', () => {
    it('should include pattern in error', () => {
      try {
        sqlGuard.validateInput('DROP TABLE x');
      } catch (e) {
        expect(e).toBeInstanceOf(SqlGuardError);
        expect((e as SqlGuardError).pattern).toBeDefined();
      }
    });
  });
});
