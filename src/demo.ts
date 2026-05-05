import { chat } from './chat';

async function main() {
  console.log('AI Chat Tool System Demo');
  console.log('Provider:', process.env.AI_PROVIDER || 'anthropic');
  console.log('---');
  const response = await chat('가격이 5000원 이상인 전자제품을 검색해줘');
  console.log('Response:', JSON.stringify(response, null, 2));
}

main().catch(console.error);
