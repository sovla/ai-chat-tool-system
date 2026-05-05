# AI Chat Tool System

> LLM 챗봇에 Tool 화이트리스트 + SQL 차단 + Rate Limit을 적용한 안전한 AI 시스템

## 배경

LLM에게 데이터베이스 접근 권한을 줄 때 가장 위험한 것은 **자유 SQL 생성**입니다.
이 프로젝트는 실제 프로덕션에서 **PostgreSQL 217MB / 95만 행** 데이터를 LLM이 안전하게 조회하도록 설계한 Tool 시스템 패턴을 범용 도메인으로 재구성한 것입니다.

## 핵심 설계 철학

**"LLM이 아니라 Tool 시스템이 보안을 결정한다"**

```
사용자 질문 → LLM → Tool 선택 → [화이트리스트 검증] → [SQL Guard] → [Rate Limit] → 실행 → 응답
                                        ↓ 차단                ↓ 차단         ↓ 차단
                                   "허용되지 않은 도구"    "위험한 쿼리"    "요청 초과"
```

## 아키텍처

### Tool 화이트리스트

LLM이 호출할 수 있는 도구를 **명시적으로 등록된 것만** 허용합니다.

```typescript
// ✅ 허용: 등록된 tool만 실행 가능
const tools = {
  searchItems: { ... },      // 상품 검색 (SELECT만)
  getTradeStats: { ... },    // 통계 조회 (집계 쿼리만)
  recommendCompanies: { ... }, // 추천 (읽기 전용)
};

// ❌ 차단: 등록되지 않은 tool 호출 시도
// LLM: "runQuery('DROP TABLE users')" → 즉시 거부
```

### SQL Guard (자유 SQL 차단)

Tool 내부에서도 SQL Injection 패턴을 이중 검증합니다.

### Provider 추상화

```typescript
// 환경 변수 하나로 LLM 제공자 무중단 전환
// AI_PROVIDER=anthropic → Claude
// AI_PROVIDER=openai    → GPT
// 장애 시 즉시 전환, 비용 최적화 시 A/B 가능
```

## 기술 스택

- **Vercel AI SDK v6** — 스트리밍, Tool 정의, Provider 추상화
- **Zod** — Tool 입출력 스키마 런타임 검증
- **TypeScript** — Strict 모드

## 프로젝트 구조

```
src/
├── chat.ts                    # 메인 챗 로직 (스트리밍)
├── tools/
│   ├── registry.ts            # Tool 화이트리스트 (허용 목록)
│   ├── search-items.ts        # 상품 검색 tool
│   ├── get-stats.ts           # 통계 조회 tool
│   └── recommend.ts           # 추천 tool
├── middleware/
│   ├── sql-guard.ts           # SQL Injection 차단
│   └── rate-limit.ts          # 분당 호출 제한
└── providers/
    └── provider-factory.ts    # Anthropic ↔ OpenAI 전환
```

## 보안 레이어 (3중)

| 레이어 | 역할 | 차단 대상 |
|--------|------|----------|
| **Tool 화이트리스트** | 허용된 tool만 실행 | 미등록 함수 호출 |
| **SQL Guard** | DML/DDL 패턴 탐지 | DROP, DELETE, UPDATE, UNION |
| **Rate Limit** | 분당 호출 수 제한 | DoS, 비용 폭주 |

## 프로덕션 적용 결과

- **0건** SQL Injection 사고 (6개월 운영)
- Provider 전환 시 **무중단** (평균 전환 시간 0초)
- Tool 호출 평균 응답 시간 **< 2초** (95만 행 기준)
- 월 LLM 비용 **$50 이하** (Rate Limit + 캐시)
