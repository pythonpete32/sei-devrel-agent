import { z } from 'zod'

export const DebugTaskSchema = z.object({
  type: z.enum(['transaction', 'contract', 'gas', 'parallel', 'general']),
  complexity: z.enum(['high', 'medium', 'low']),
  data: z.string(),
  userContext: z.string().optional(),
  requiresDeepAnalysis: z.boolean().default(false),
  requiresCodeExecution: z.boolean().default(false),
  isSimpleQuery: z.boolean().default(false),
  isStatusCheck: z.boolean().default(false),
  estimatedSearches: z.number().optional(),
  estimatedTokens: z.number().optional(),
})

export type DebugTask = z.infer<typeof DebugTaskSchema>

export const SeiConfigSchema = z.object({
  rpcEndpoint: z.string().default('https://evm-rpc.sei-apis.com'),
  blockExplorer: z.string().default('https://seitrace.com'),
  blockTime: z.string().default('400ms'),
  parallelExecution: z.boolean().default(true),
  network: z.string().default('Sei EVM'),
})

export type SeiConfig = z.infer<typeof SeiConfigSchema>

export const CostEstimateSchema = z.object({
  searchCost: z.number(),
  tokenCost: z.number(),
  total: z.number(),
})

export type CostEstimate = z.infer<typeof CostEstimateSchema>

export const ImplementationPlanSchema = z.object({
  phase1: z.object({
    name: z.string(),
    tasks: z.array(z.string()),
  }),
  phase2: z.object({
    name: z.string(),
    tasks: z.array(z.string()),
  }),
  phase3: z.object({
    name: z.string(),
    tasks: z.array(z.string()),
  }),
  phase4: z.object({
    name: z.string(),
    tasks: z.array(z.string()),
  }),
})

export type ImplementationPlan = z.infer<typeof ImplementationPlanSchema>

export interface Citation {
  url: string
  title: string
  cited_text?: string
}

export interface DebugReport {
  analysis: Array<{ type: string; text?: string; citations?: Citation[] }>
  sources: Citation[]
  model: string
  toolsUsed: string[]
  rootCause?: string
  suggestions?: string[]
  citations: Citation[]
}

export interface CodeExecutionResult {
  stdout?: string
  stderr?: string
  images?: string[]
  files?: string[]
}

export interface AnthropicMessage {
  content: Array<{
    type: string
    text?: string
    citations?: Citation[] | null
    [key: string]: unknown
  }>
  model: string
  server_tool_use?: string[]
  codeOutput?: CodeExecutionResult
  citations?: Citation[]
}

export const ModelType = {
  OPUS_4: 'claude-opus-4-20250514',
  SONNET_4: 'claude-sonnet-4-20250514',
} as const

export type ModelTypeKey = keyof typeof ModelType
export type ModelTypeValue = (typeof ModelType)[ModelTypeKey]
