import { describe, expect, it } from 'bun:test'
import { ModelSelector } from '../../src/core/model-selector.js'
import { ModelType } from '../../src/types/index.js'
import type { DebugTask } from '../../src/types/index.js'

describe('ModelSelector', () => {
  const modelSelector = new ModelSelector()

  // Helper to create a complete DebugTask with default values
  const createTask = (overrides: Partial<DebugTask>): DebugTask => ({
    type: 'general',
    complexity: 'medium',
    data: 'test',
    requiresDeepAnalysis: false,
    requiresCodeExecution: false,
    isSimpleQuery: false,
    isStatusCheck: false,
    ...overrides,
  })

  describe('selectModel', () => {
    it('should select Opus 4 for complex tasks', () => {
      const task = createTask({
        type: 'transaction',
        complexity: 'high',
        requiresDeepAnalysis: true,
      })

      const model = modelSelector.selectModel(task)
      expect(model).toBe(ModelType.OPUS_4)
    })

    it('should select Opus 4 for code execution tasks', () => {
      const task = createTask({
        type: 'gas',
        requiresCodeExecution: true,
      })

      const model = modelSelector.selectModel(task)
      expect(model).toBe(ModelType.OPUS_4)
    })

    it('should select Sonnet 4 for simple queries', () => {
      const task = createTask({
        complexity: 'low',
        isSimpleQuery: true,
      })

      const model = modelSelector.selectModel(task)
      expect(model).toBe(ModelType.SONNET_4)
    })

    it('should select Sonnet 4 for status checks', () => {
      const task = createTask({
        isStatusCheck: true,
      })

      const model = modelSelector.selectModel(task)
      expect(model).toBe(ModelType.SONNET_4)
    })

    it('should default to Sonnet 4 for cost efficiency', () => {
      const task = createTask({})

      const model = modelSelector.selectModel(task)
      expect(model).toBe(ModelType.SONNET_4)
    })
  })

  describe('estimateCost', () => {
    it('should calculate cost for task with searches', () => {
      const task = createTask({
        type: 'transaction',
        complexity: 'high',
        estimatedSearches: 3,
        estimatedTokens: 2000,
      })

      const cost = modelSelector.estimateCost(task)

      expect(cost.searchCost).toBe(0.03) // 3 * 0.01
      expect(cost.tokenCost).toBeGreaterThan(0)
      expect(cost.total).toBe(cost.searchCost + cost.tokenCost)
    })

    it('should handle tasks with no searches', () => {
      const task = createTask({
        complexity: 'low',
        estimatedTokens: 1000,
      })

      const cost = modelSelector.estimateCost(task)

      expect(cost.searchCost).toBe(0)
      expect(cost.tokenCost).toBeGreaterThan(0)
      expect(cost.total).toBe(cost.tokenCost)
    })

    it('should use default token count when not specified', () => {
      const task = createTask({})

      const cost = modelSelector.estimateCost(task)

      expect(cost.tokenCost).toBeGreaterThan(0)
      expect(cost.total).toBeGreaterThan(0)
    })
  })
})
