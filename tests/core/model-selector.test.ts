import { describe, it, expect } from "bun:test";
import { ModelSelector } from "../../src/core/model-selector.js";
import { ModelType } from "../../src/types/index.js";
import type { DebugTask } from "../../src/types/index.js";

describe("ModelSelector", () => {
  const modelSelector = new ModelSelector();

  describe("selectModel", () => {
    it("should select Opus 4 for complex tasks", () => {
      const task: DebugTask = {
        type: "transaction",
        complexity: "high",
        data: "test",
        requiresDeepAnalysis: true,
      };

      const model = modelSelector.selectModel(task);
      expect(model).toBe(ModelType.OPUS_4);
    });

    it("should select Opus 4 for code execution tasks", () => {
      const task: DebugTask = {
        type: "gas",
        complexity: "medium",
        data: "test",
        requiresCodeExecution: true,
      };

      const model = modelSelector.selectModel(task);
      expect(model).toBe(ModelType.OPUS_4);
    });

    it("should select Sonnet 4 for simple queries", () => {
      const task: DebugTask = {
        type: "general",
        complexity: "low",
        data: "test",
        isSimpleQuery: true,
      };

      const model = modelSelector.selectModel(task);
      expect(model).toBe(ModelType.SONNET_4);
    });

    it("should select Sonnet 4 for status checks", () => {
      const task: DebugTask = {
        type: "general",
        complexity: "medium",
        data: "test",
        isStatusCheck: true,
      };

      const model = modelSelector.selectModel(task);
      expect(model).toBe(ModelType.SONNET_4);
    });

    it("should default to Sonnet 4 for cost efficiency", () => {
      const task: DebugTask = {
        type: "general",
        complexity: "medium",
        data: "test",
      };

      const model = modelSelector.selectModel(task);
      expect(model).toBe(ModelType.SONNET_4);
    });
  });

  describe("estimateCost", () => {
    it("should calculate cost for task with searches", () => {
      const task: DebugTask = {
        type: "transaction",
        complexity: "high",
        data: "test",
        estimatedSearches: 3,
        estimatedTokens: 2000,
      };

      const cost = modelSelector.estimateCost(task);
      
      expect(cost.searchCost).toBe(0.03); // 3 * 0.01
      expect(cost.tokenCost).toBeGreaterThan(0);
      expect(cost.total).toBe(cost.searchCost + cost.tokenCost);
    });

    it("should handle tasks with no searches", () => {
      const task: DebugTask = {
        type: "general",
        complexity: "low",
        data: "test",
        estimatedTokens: 1000,
      };

      const cost = modelSelector.estimateCost(task);
      
      expect(cost.searchCost).toBe(0);
      expect(cost.tokenCost).toBeGreaterThan(0);
      expect(cost.total).toBe(cost.tokenCost);
    });

    it("should use default token count when not specified", () => {
      const task: DebugTask = {
        type: "general",
        complexity: "medium",
        data: "test",
      };

      const cost = modelSelector.estimateCost(task);
      
      expect(cost.tokenCost).toBeGreaterThan(0);
      expect(cost.total).toBeGreaterThan(0);
    });
  });
});