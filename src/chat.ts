import { generateText, stepCountIs } from 'ai';
import { createProvider } from './providers/provider-factory';
import { toolRegistry, isAllowedTool } from './tools/registry';
import { toolRateLimiter } from './middleware/rate-limit';

export async function chat(userMessage: string) {
  const { model } = createProvider();

  const rateLimitCheck = toolRateLimiter.check();
  if (!rateLimitCheck.allowed) {
    return {
      error: rateLimitCheck.reason,
      retryAfterMs: rateLimitCheck.retryAfterMs,
    };
  }

  const result = await generateText({
    model,
    tools: toolRegistry as any,
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
}

async function main() {
  console.log('AI Chat Tool System Demo');
  console.log('Provider:', process.env.AI_PROVIDER || 'anthropic');
  console.log('---');

  const response = await chat('가격이 5000원 이상인 전자제품을 검색해줘');
  console.log('Response:', JSON.stringify(response, null, 2));
}

main().catch(console.error);
