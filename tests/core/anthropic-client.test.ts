import { beforeAll, describe, expect, it, mock } from 'bun:test'
import { AnthropicClient } from '../../src/core/anthropic-client.js'
import type { DebugTask } from '../../src/types/index.js'

// Mock Anthropic SDK
const mockCreate = mock(() => ({
  content: [{ type: 'text', text: 'Mock response' }],
  model: 'claude-opus-4-20250514',
  usage: { tool_use: false },
}))

const mockStream = mock(() => ({
  on: mock(() => {}),
  finalMessage: mock(() => ({
    content: [{ type: 'text', text: 'Mock stream response' }],
    model: 'claude-opus-4-20250514',
    usage: { tool_use: true },
  })),
}))

mock.module('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      create: mockCreate,
      stream: mockStream,
    }
    beta = {
      messages: {
        create: mockCreate,
        stream: mockStream,
      },
    }
  },
}))

describe('AnthropicClient', () => {
  let client: AnthropicClient

  beforeAll(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key'
    client = new AnthropicClient()
  })

  describe('searchSeiDocs', () => {
    it('should use correct tool type for web search', async () => {
      const task: DebugTask = {
        type: 'general',
        complexity: 'medium',
        data: 'test query',
        estimatedSearches: 3,
        requiresDeepAnalysis: false,
        requiresCodeExecution: false,
        isSimpleQuery: false,
        isStatusCheck: false,
      }

      await client.searchSeiDocs('test query', task)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: [
            expect.objectContaining({
              type: 'web_search_20250305',
              name: 'web_search',
            }),
          ],
        }),
      )
    })

    it('should include allowed domains', async () => {
      const task: DebugTask = {
        type: 'general',
        complexity: 'medium',
        data: 'test query',
        requiresDeepAnalysis: false,
        requiresCodeExecution: false,
        isSimpleQuery: false,
        isStatusCheck: false,
      }

      await client.searchSeiDocs('test query', task)

      const calls = mockCreate.mock.calls as Array<[unknown]>
      if (calls.length > 0) {
        const callArgs = calls[calls.length - 1]?.[0] as {
          tools?: Array<{ allowed_domains?: string[] }>
        }
        expect(callArgs?.tools?.[0]?.allowed_domains).toContain('docs.sei.io')
        expect(callArgs?.tools?.[0]?.allowed_domains).toContain('github.com/sei-protocol')
      }
    })
  })

  describe('debugInteractive', () => {
    it('should use correct tool types for interactive debugging', async () => {
      const task: DebugTask = {
        type: 'transaction',
        complexity: 'high',
        data: 'test issue',
        requiresDeepAnalysis: true,
        requiresCodeExecution: false,
        isSimpleQuery: false,
        isStatusCheck: false,
      }

      await client.debugInteractive('test issue', task)

      expect(mockStream).toHaveBeenCalledWith(
        expect.objectContaining({
          betas: ['code-execution-2025-05-22'],
          tools: [
            expect.objectContaining({
              type: 'web_search_20250305',
              name: 'web_search',
            }),
          ],
        }),
      )
    })
  })

  describe('analyzeWithCodeExecution', () => {
    it('should use code execution beta and correct tool type', async () => {
      const task: DebugTask = {
        type: 'gas',
        complexity: 'medium',
        data: 'test data',
        requiresDeepAnalysis: false,
        requiresCodeExecution: true,
        isSimpleQuery: false,
        isStatusCheck: false,
      }

      await client.analyzeWithCodeExecution('test data', task)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          betas: ['code-execution-2025-05-22'],
          tools: [{ type: 'code_execution', name: 'code_execution' }],
        }),
      )
    })
  })

  describe('tool type validation', () => {
    it('should never use deprecated tool types', async () => {
      const task: DebugTask = {
        type: 'general',
        complexity: 'low',
        data: 'test',
        requiresDeepAnalysis: false,
        requiresCodeExecution: false,
        isSimpleQuery: false,
        isStatusCheck: false,
      }

      // Test all methods that use tools
      await client.searchSeiDocs('query', task)
      await client.debugInteractive('issue', task)
      await client.analyzeWithCodeExecution('data', task)

      // Check that no calls used the old tool type
      const allCalls = [...mockCreate.mock.calls, ...mockStream.mock.calls] as Array<[unknown]>

      for (const call of allCalls) {
        const callData = call?.[0] as { tools?: Array<{ type?: string; name?: string }> }
        if (callData && 'tools' in callData && callData.tools) {
          for (const tool of callData.tools) {
            // Ensure we never use the bare "web_search" type
            expect(tool.type).not.toBe('web_search')

            // If it's a web search tool, ensure it has the version suffix
            if (tool.name === 'web_search' || tool.type?.includes('web_search')) {
              expect(tool.type).toBe('web_search_20250305')
            }
          }
        }
      }
    })
  })
})
