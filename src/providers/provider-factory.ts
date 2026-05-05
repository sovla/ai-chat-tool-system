import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

type ProviderType = 'openai' | 'anthropic';

const PROVIDER_CONFIGS: Record<ProviderType, { model: string; envKey: string }> = {
  openai: { model: 'gpt-4o', envKey: 'OPENAI_API_KEY' },
  anthropic: { model: 'claude-sonnet-4-6', envKey: 'ANTHROPIC_API_KEY' },
};

/**
 * Provider Factory — Anthropic ↔ OpenAI 무중단 전환
 *
 * 환경 변수 AI_PROVIDER로 제어:
 * - 장애 시 즉시 전환 (재배포 불필요, env만 변경)
 * - 비용 최적화 시 A/B 테스트 가능
 * - 새 Provider 추가 시 config만 확장
 */
export function createProvider(): { provider: any; model: any } {
  const providerType = (process.env.AI_PROVIDER || 'anthropic') as ProviderType;
  const config = PROVIDER_CONFIGS[providerType];

  if (!config) {
    throw new Error(`Unknown AI provider: ${providerType}. Supported: ${Object.keys(PROVIDER_CONFIGS).join(', ')}`);
  }

  const apiKey = process.env[config.envKey];
  if (!apiKey && process.env.NODE_ENV !== 'test') {
    throw new Error(
      `Missing required env: ${config.envKey}. Set the API key or use NODE_ENV=test for testing.`
    );
  }

  if (providerType === 'anthropic') {
    const anthropic = createAnthropic({ apiKey: apiKey || 'test-key' });
    return { provider: anthropic, model: anthropic(config.model) };
  }

  const openai = createOpenAI({ apiKey: apiKey || 'test-key' });
  return { provider: openai, model: openai(config.model) };
}

export function getProviderInfo() {
  const type = (process.env.AI_PROVIDER || 'anthropic') as ProviderType;
  const config = PROVIDER_CONFIGS[type];
  const rawKey = process.env[config.envKey];
  return {
    type,
    model: config.model,
    apiKey: rawKey ? `${rawKey.substring(0, 8)}...` : 'not-set',
  };
}
