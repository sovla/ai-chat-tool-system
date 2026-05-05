import { z } from 'zod';

export const recommend = {
  description: '조건에 맞는 거래처를 추천합니다. 읽기 전용 조회.',
  parameters: z.object({
    category: z.string().describe('찾고 싶은 품목 카테고리'),
    country: z.string().optional().describe('선호 국가'),
    minScore: z.number().default(60).describe('최소 신뢰 점수 (0-100)'),
  }),
  execute: async (params: { category: string; country?: string; minScore: number }) => {
    const { category, country, minScore } = params;

    return {
      recommendations: [
        { name: 'Sample Corp', score: 76.08, country: country || 'KR', categories: [category] },
      ],
      criteria: { category, country, minScore },
    };
  },
};
