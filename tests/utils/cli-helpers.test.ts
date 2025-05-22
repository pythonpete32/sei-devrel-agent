import { describe, it, expect } from "bun:test";
import { CliHelpers } from "../../src/utils/cli-helpers.js";

describe("CliHelpers", () => {
  const cli = new CliHelpers();

  describe("parseCommand", () => {
    it("should parse command with data", () => {
      const args = ["debug", "transaction", "failed"];
      const result = cli.parseCommand(args);
      
      expect(result.command).toBe("debug");
      expect(result.data).toBe("transaction failed");
    });

    it("should handle empty args as interactive mode", () => {
      const args: string[] = [];
      const result = cli.parseCommand(args);
      
      expect(result.command).toBe("interactive");
      expect(result.data).toBe("");
    });

    it("should handle single command without data", () => {
      const args = ["help"];
      const result = cli.parseCommand(args);
      
      expect(result.command).toBe("help");
      expect(result.data).toBe("");
    });
  });

  describe("validateTxHash", () => {
    it("should validate correct transaction hash", () => {
      const validHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      expect(cli.validateTxHash(validHash)).toBe(true);
    });

    it("should reject hash without 0x prefix", () => {
      const invalidHash = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      expect(cli.validateTxHash(invalidHash)).toBe(false);
    });

    it("should reject hash with wrong length", () => {
      const invalidHash = "0x1234567890abcdef";
      expect(cli.validateTxHash(invalidHash)).toBe(false);
    });

    it("should reject hash with invalid characters", () => {
      const invalidHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefg";
      expect(cli.validateTxHash(invalidHash)).toBe(false);
    });
  });

  describe("extractTxHash", () => {
    it("should extract transaction hash from text", () => {
      const text = "Debug transaction 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef failed";
      const extracted = cli.extractTxHash(text);
      
      expect(extracted).toBe("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
    });

    it("should return null when no hash is present", () => {
      const text = "Debug general issue";
      const extracted = cli.extractTxHash(text);
      
      expect(extracted).toBe(null);
    });

    it("should extract first hash when multiple are present", () => {
      const hash1 = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const hash2 = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
      const text = `First hash ${hash1} and second hash ${hash2}`;
      const extracted = cli.extractTxHash(text);
      
      expect(extracted).toBe(hash1);
    });
  });

  describe("formatError", () => {
    it("should format Error objects", () => {
      const error = new Error("Test error message");
      const formatted = cli.formatError(error);
      
      expect(formatted).toBe("Test error message");
    });

    it("should format string errors", () => {
      const error = "String error";
      const formatted = cli.formatError(error);
      
      expect(formatted).toBe("String error");
    });

    it("should format other types", () => {
      const error = { message: "Object error" };
      const formatted = cli.formatError(error);
      
      expect(formatted).toBe('[object Object]');
    });
  });
});