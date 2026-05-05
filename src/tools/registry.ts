import { searchItems } from './search-items';
import { getStats } from './get-stats';
import { recommend } from './recommend';

export const toolRegistry = {
  searchItems,
  getStats,
  recommend,
} as const;

export type ToolName = keyof typeof toolRegistry;

export function isAllowedTool(name: string): name is ToolName {
  return name in toolRegistry;
}
