import { generateText, stepCountIs } from 'ai';
import { createProvider } from './providers/provider-factory';
import { toolRegistry, isAllowedTool } from './tools/registry';
import { toolRateLimiter } from './middleware/rate-limit';
import { ToolRateLimitError } from './middleware/tool-wrapper';
import { SqlGuardError } from './middleware/sql-guard';

export async function chat(userMessage: string) {
  if (!userMessage || userMessage.length > 2000) {
    return { error: 'Invalid input: message must be 1-2000 characters' };
  }

  const { model } = createProvider();

  try {
    const result = await generateText({
      model,
      tools: toolRegistry,
      stopWhen: stepCountIs(5),
      system: `당신은 데이터 분석 도우미입니다. 사용자의 질문에 도구를 활용해 답변하세요.
사용 가능한 도구: searchItems (상품 검색), getStats (통계 조회), recommend (추천).
절대로 직접 SQL을 작성하거나 데이터를 추측하지 마세요. 반드시 도구를 통해 조회하세요.`,
      messages: [{ role: 'user', content: userMessage }],
    });

    return {
      text: result.text,
      toolCalls: result.steps.flatMap((step) =>
        step.toolCalls.map((tc) => ({
          tool: tc.toolName,
          allowed: isAllowedTool(tc.toolName),
        })),
      ),
      usage: toolRateLimiter.getUsage(),
    };
  } catch (error) {
    if (error instanceof ToolRateLimitError) {
      return { error: error.message, retryAfterMs: error.retryAfterMs };
    }
    if (error instanceof SqlGuardError) {
      return { error: 'Input blocked by security policy', blocked: true };
    }
    return {
      error: 'Service temporarily unavailable',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
