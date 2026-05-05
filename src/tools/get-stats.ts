import { z } from 'zod';

export const getStats = {
  description: '거래 통계를 조회합니다. 기간별, 국가별, 품목별 집계.',
  parameters: z.object({
    groupBy: z.enum(['country', 'category', 'month']).describe('집계 기준'),
    startDate: z.string().optional().describe('시작일 (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('종료일 (YYYY-MM-DD)'),
  }),
  execute: async (params: { groupBy: string; startDate?: string; endDate?: string }) => {
    const { groupBy, startDate, endDate } = params;

    return {
      groupBy,
      period: { start: startDate || '2024-01', end: endDate || '2025-12' },
      data: [
        { group: 'sample', count: 150, totalAmount: 1500000 },
      ],
    };
  },
};
