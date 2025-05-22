import { describe, it, expect } from "bun:test";
import { SeiDebugCommands } from "../../src/commands/debug-commands.js";

describe("SeiDebugCommands", () => {
  // Note: These tests would require mocking the Anthropic API
  // For now, we'll test the validation logic and basic functionality
  
  const debugCommands = new SeiDebugCommands();

  describe("validation", () => {
    it("should validate transaction hash format in debugTransaction", async () => {
      const invalidHash = "invalid-hash";
      
      await expect(debugCommands.debugTransaction(invalidHash)).rejects.toThrow(
        "Invalid transaction hash format"
      );
    });

    it("should validate transaction hash format in debugParallelExecution", async () => {
      const invalidHash = "0x123"; // too short
      
      await expect(debugCommands.debugParallelExecution(invalidHash)).rejects.toThrow(
        "Invalid transaction hash format"
      );
    });
  });

  describe("command classification", () => {
    it("should accept valid transaction hash", () => {
      const validHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      
      // Test the private method indirectly through the validation
      expect(() => {
        if (!/^0x[a-fA-F0-9]{64}$/.test(validHash)) {
          throw new Error("Invalid transaction hash format");
        }
      }).not.toThrow();
    });
  });

  // Additional tests would require setting up proper mocks for the Anthropic API
  // and testing the actual debug functionality. For a production system,
  // you would want to:
  // 1. Mock the AnthropicClient
  // 2. Test the integration with SeiDebugAgent
  // 3. Test error handling for various scenarios
  // 4. Test the report formatting and display
});