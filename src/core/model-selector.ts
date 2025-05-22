import { consola } from 'consola'
import type { CostEstimate, DebugTask } from '../types/index.js'
import { ModelType } from '../types/index.js'

export class ModelSelector {
  private log = consola.withTag('model-selector')

  selectModel(task: DebugTask): string {
    // Use Opus 4 for complex analysis
    if (task.requiresDeepAnalysis || task.requiresCodeExecution || task.complexity === 'high') {
      this.log.info('Selected Claude Opus 4 for complex task')
      return ModelType.OPUS_4
    }

    // Use Sonnet 4 for simpler tasks
    if (task.isSimpleQuery || task.isStatusCheck || task.complexity === 'low') {
      this.log.info('Selected Claude Sonnet 4 for simple task')
      return ModelType.SONNET_4
    }

    // Default to Sonnet for cost efficiency
    this.log.info('Selected Claude Sonnet 4 (default for cost efficiency)')
    return ModelType.SONNET_4
  }

  estimateCost(task: DebugTask): CostEstimate {
    const searches = task.estimatedSearches || 0
    const tokens = task.estimatedTokens || 1000
    const model = this.selectModel(task)

    const searchCost = searches * 0.01 // $10 per 1000 searches
    const tokenCost = this.calculateTokenCost(tokens, model)

    return {
      searchCost,
      tokenCost,
      total: searchCost + tokenCost,
    }
  }

  private calculateTokenCost(tokens: number, model: string): number {
    // Simplified cost calculation - adjust based on actual Anthropic pricing
    const costPerKToken = model === ModelType.OPUS_4 ? 0.075 : 0.015 // Example rates
    return (tokens / 1000) * costPerKToken
  }

  logCostEstimate(task: DebugTask): void {
    const estimate = this.estimateCost(task)
    this.log.info('Cost estimate', {
      model: this.selectModel(task),
      searchCost: `$${estimate.searchCost.toFixed(4)}`,
      tokenCost: `$${estimate.tokenCost.toFixed(4)}`,
      total: `$${estimate.total.toFixed(4)}`,
    })
  }
}
