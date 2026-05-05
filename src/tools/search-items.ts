import { z } from 'zod';
import { sqlGuard } from '../middleware/sql-guard';

export const searchItems = {
  description: '상품을 키워드로 검색합니다. 이름, 카테고리, 가격 범위로 필터링 가능.',
  parameters: z.object({
    keyword: z.string().describe('검색 키워드'),
    category: z.string().optional().describe('카테고리 필터'),
    minPrice: z.number().optional().describe('최소 가격'),
    maxPrice: z.number().optional().describe('최대 가격'),
    limit: z.number().min(1).max(50).default(10).describe('결과 수 (최대 50)'),
  }),
  execute: async (params: { keyword: string; category?: string; minPrice?: number; maxPrice?: number; limit: number }) => {
    const { keyword, category, limit } = params;
    const safeLimit = Math.min(limit, 50);

    sqlGuard.validateInput(keyword);
    if (category) sqlGuard.validateInput(category);

    return {
      items: [
        { id: 1, name: `${keyword} 샘플`, category: category || 'general', price: 10000 },
      ],
      total: 1,
      limit: safeLimit,
    };
  },
};
