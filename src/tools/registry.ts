import { ToolSet } from 'ai';
import { searchItems } from './search-items';
import { getStats } from './get-stats';
import { recommend } from './recommend';
import { withMiddleware } from '../middleware/tool-wrapper';

// AI SDK v6 런타임은 {description, parameters(zod), execute} 형태를 수용함
// 타입 시스템과 런타임의 차이를 명시적으로 선언
export const toolRegistry: ToolSet = {
  searchItems: withMiddleware(searchItems) as unknown as ToolSet[string],
  getStats: withMiddleware(getStats) as unknown as ToolSet[string],
  recommend: withMiddleware(recommend) as unknown as ToolSet[string],
};

export type ToolName = 'searchItems' | 'getStats' | 'recommend';

export function isAllowedTool(name: string): name is ToolName {
  return Object.prototype.hasOwnProperty.call(toolRegistry, name);
}
