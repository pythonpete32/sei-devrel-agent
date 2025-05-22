# Advanced Sei Protocol Debugging Agent Specification

## Overview

Create an advanced TypeScript agent using the latest Anthropic SDK features that helps debug blockchain-related issues for Sei Protocol. The agent leverages Claude Opus 4 or Sonnet 4's native capabilities including web search, code execution, and automatic citations while maintaining human-in-the-loop interaction.

## Key Architecture Changes with Latest Anthropic Features

### 1. Direct Anthropic SDK Integration

Instead of using generic MCP, we now use Anthropic's SDK directly with its powerful built-in tools:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { logger, createSpinner } from "@reliverse/relinka";

// Initialize with model selection
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model selection based on complexity
const selectModel = (complexity: "high" | "medium") => {
  return complexity === "high"
    ? "claude-opus-4-20250514"
    : "claude-sonnet-4-20250514";
};
```

### 2. Native Web Search with Citations

No need for external search tools - Claude now has built-in web search:

```typescript
async function debugWithWebSearch(issue: string) {
  const message = await anthropic.messages.create({
    model: selectModel("high"),
    max_tokens: 4096,
    tools: [
      {
        type: "web_search",
        name: "web_search",
        max_uses: 5, // Limit searches for cost control
        allowed_domains: [
          "docs.sei.io",
          "github.com/sei-protocol",
          "etherscan.io",
          "stackoverflow.com",
        ],
      },
    ],
    messages: [
      {
        role: "user",
        content: `Debug this Sei EVM issue: ${issue}. Search for relevant documentation and similar issues.`,
      },
    ],
  });

  // Response includes automatic citations
  return message;
}
```

### 3. Code Execution for Log Analysis

Use Claude's sandboxed Python environment for complex debugging:

```typescript
async function analyzeTransactionLogs(txHash: string, logs: string) {
  const message = await anthropic.beta.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 4096,
    betas: ["code-execution-2025-05-22"],
    tools: [
      {
        type: "code_execution",
      },
    ],
    messages: [
      {
        role: "user",
        content: `Analyze these transaction logs for ${txHash}:
      
\`\`\`
${logs}
\`\`\`

Use Python to:
1. Parse the logs for errors
2. Identify patterns related to Sei's parallel execution
3. Create a visualization of gas usage
4. Check for state conflicts`,
      },
    ],
  });

  return message;
}
```

## Sei Protocol Context

The agent must be aware of Sei's unique characteristics:

### Sei EVM Specifics

- **Parallel EVM**: First parallelized EVM with optimistic parallelization
- **Performance**: 400ms block time, 100 MGas/s throughput, 390ms finality
- **Architecture**: Layer 1 blockchain with full EVM compatibility
- **Special Features**: SeiDB for optimized state storage, interoperability between EVM and Cosmwasm

### Common Sei Debugging Scenarios

Based on typical issues encountered:

1. **Parallel Execution Conflicts**

   - State conflicts between parallel transactions
   - Nonce management issues
   - Race conditions in contract interactions

2. **Fast Block Timing Issues**

   - Transactions appearing pending due to 400ms blocks
   - Finality confusion with rapid block production
   - MEV-related ordering issues

3. **Gas Optimization**

   - High throughput doesn't mean infinite gas per tx
   - Optimizing for Sei's parallel execution model
   - Understanding gas costs in parallel context

4. **Cross-Environment Issues**
   - EVM to Cosmwasm interoperability
   - Contract deployment compatibility
   - Tool compatibility (Metamask, Hardhat, etc.)

### Official Sei Resources

The agent should reference:

- Sei Docs: https://docs.sei.io/evm/
- RPC Endpoints:
  - Official: https://evm-rpc.sei-apis.com
  - Alternatives: Listed in Sei documentation
- Block Explorer: Seiscan or Seitrace

## Core Requirements

### 1. Framework & Setup

- **Runtime**: Bun (latest version)
- **Language**: TypeScript
- **UI Library**: @reliverse/relinka for terminal interface
- **Key Dependencies**:
  ```json
  {
    "dependencies": {
      "@anthropic-ai/sdk": "latest",
      "@reliverse/relinka": "latest",
      "zod": "latest" // for validation
    },
    "devDependencies": {
      "bun-types": "latest",
      "@types/node": "latest"
    }
  }
  ```

### 2. Human-in-the-Loop with Anthropic SDK

Using the SDK's streaming capabilities for interactive debugging:

```typescript
class InteractiveDebugger {
  private anthropic: Anthropic;
  private log: Logger;

  constructor() {
    this.anthropic = new Anthropic();
    this.log = logger({ name: "sei-debugger" });
  }

  async debugInteractive(issue: string) {
    const spinner = createSpinner("Analyzing issue...");

    const stream = await this.anthropic.messages.stream({
      model: "claude-opus-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: issue,
        },
      ],
      tools: [
        { type: "web_search", name: "web_search" },
        { type: "code_execution" },
      ],
    });

    // Handle streaming events
    stream.on("text", (text) => {
      this.log.info(text);
    });

    stream.on("tool_use", async (tool) => {
      if (tool.name === "web_search") {
        spinner.update(`Searching: ${tool.input.query}`);
      }
    });

    const finalMessage = await stream.finalMessage();
    spinner.success("Analysis complete");

    return finalMessage;
  }
}
```

### 3. Implementation Plan Structure

```typescript
class DebugAgentPlan {
  async createPlan(): Promise<ImplementationPlan> {
    return {
      phase1: {
        name: "Anthropic SDK Integration",
        tasks: [
          "Set up Bun project with TypeScript",
          "Install @anthropic-ai/sdk and @reliverse/relinka",
          "Configure API keys and model selection",
          "Implement basic message creation",
        ],
      },
      phase2: {
        name: "Tool Integration",
        tasks: [
          "Implement web search for Sei documentation",
          "Set up code execution for log analysis",
          "Create citation tracking system",
          "Add streaming response handling",
        ],
      },
      phase3: {
        name: "Sei-Specific Logic",
        tasks: [
          "Build parallel execution debugger",
          "Add fast block timing handlers",
          "Implement gas optimization analyzer",
          "Create EVM-Cosmwasm interop checker",
        ],
      },
      phase4: {
        name: "Testing & Polish",
        tasks: [
          "Unit tests for each component",
          "Integration tests with real Sei transactions",
          "Performance optimization",
          "Documentation and examples",
        ],
      },
    };
  }
}
```

### 4. Agent Behavior with Native Tools

#### Advanced Debugging Flow

```typescript
class SeiDebugAgent {
  private anthropic: Anthropic;
  private config: Config;
  private log: Logger;

  async debugTransaction(txHash: string, userContext?: string) {
    // 1. Initial web search for transaction
    const searchResponse = await this.anthropic.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 4096,
      tools: [
        {
          type: "web_search",
          name: "web_search",
          max_uses: 3,
          blocked_domains: ["reddit.com", "discord.com"], // Focus on official sources
        },
      ],
      messages: [
        {
          role: "user",
          content: `Search for Sei EVM transaction ${txHash} and any related errors. ${
            userContext || ""
          }`,
        },
      ],
    });

    // 2. If logs are found, analyze with code execution
    if (searchResponse.content.some((c) => c.text?.includes("revert"))) {
      const analysisResponse = await this.anthropic.beta.messages.create({
        model: "claude-opus-4-20250514",
        max_tokens: 4096,
        betas: ["code-execution-2025-05-22"],
        tools: [{ type: "code_execution" }],
        messages: [
          ...searchResponse.messages,
          {
            role: "user",
            content:
              "Analyze the revert reason using Python. Check for parallel execution patterns.",
          },
        ],
      });

      return this.formatDebugReport(analysisResponse);
    }

    return this.formatDebugReport(searchResponse);
  }

  private formatDebugReport(response: Message) {
    // Extract citations and format report
    const citations = response.content
      .filter((c) => c.type === "text" && c.citations)
      .flatMap((c) => c.citations);

    return {
      analysis: response.content,
      sources: citations,
      model: response.model,
      toolsUsed: response.server_tool_use,
    };
  }
}
```

### 5. Shell Execution via MCP (Still Needed)

While Anthropic provides web search and code execution, we still need MCP for shell commands:

```typescript
interface MCPServerConfig {
  shell: {
    transport: "stdio";
    command: "mcp-server-shell";
    args: ["--allow-exec", "cast,curl,seid"];
  };
  humanInLoop: {
    transport: "stdio";
    command: "mcp-server-hil";
    args: ["--interactive"];
  };
}

// Hybrid approach: Anthropic SDK + MCP for shell
class HybridDebugger {
  private anthropic: Anthropic;
  private shellMCP: MCPClient;

  async runCastCommand(command: string) {
    // Use MCP for shell execution
    return await this.shellMCP.execute(command);
  }

  async analyzeWithClaude(data: any) {
    // Use Anthropic SDK for analysis
    return await this.anthropic.messages.create({
      model: "claude-opus-4-20250514",
      messages: [{ role: "user", content: `Analyze: ${JSON.stringify(data)}` }],
    });
  }
}
```

### 6. Cost-Optimized Model Selection

```typescript
class ModelSelector {
  selectModel(task: DebugTask): string {
    // Use Opus 4 for complex analysis
    if (task.requiresDeepAnalysis || task.requiresCodeExecution) {
      return "claude-opus-4-20250514";
    }

    // Use Sonnet 4 for simpler tasks
    if (task.isSimpleQuery || task.isStatusCheck) {
      return "claude-sonnet-4-20250514";
    }

    // Default to Sonnet for cost efficiency
    return "claude-sonnet-4-20250514";
  }

  estimateCost(task: DebugTask): CostEstimate {
    const searches = task.estimatedSearches || 0;
    const tokens = task.estimatedTokens || 1000;

    return {
      searchCost: searches * 0.01, // $10 per 1000 searches
      tokenCost: this.calculateTokenCost(tokens, task.model),
      total: searches * 0.01 + this.calculateTokenCost(tokens, task.model),
    };
  }
}
```

### 7. Sei-Specific Debug Commands with Citations

```typescript
class SeiDebugCommands {
  private anthropic: Anthropic;
  private log: Logger;

  async debugParallelExecution(txHash: string) {
    const response = await this.anthropic.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 4096,
      tools: [
        {
          type: "web_search",
          name: "web_search",
          allowed_domains: ["docs.sei.io", "github.com/sei-protocol"],
        },
      ],
      messages: [
        {
          role: "user",
          content: `Search for Sei parallel execution issues related to transaction ${txHash}. 
                  Look for state conflicts, nonce issues, and optimistic parallelization problems.`,
        },
      ],
    });

    // Citations are automatically included in response
    return this.extractInsights(response);
  }

  async analyzeGasPatterns(logs: string) {
    const response = await this.anthropic.beta.messages.create({
      model: "claude-opus-4-20250514",
      betas: ["code-execution-2025-05-22"],
      tools: [{ type: "code_execution" }],
      messages: [
        {
          role: "user",
          content: `Analyze these Sei transaction logs with Python:
        
${logs}

Create a visualization showing:
1. Gas usage over time
2. Parallel execution patterns
3. Any anomalies in the 400ms block times`,
        },
      ],
    });

    return response;
  }
}
```

### 8. Example Complete Flow with Latest Features

```typescript
// Complete debugging session with all new features
const debugSession = async (issue: string) => {
  const agent = new SeiDebugAgent();
  const log = logger({ name: "sei-debug" });
  const spinner = createSpinner("Initializing Claude Opus 4...");

  try {
    // 1. Start with web search
    spinner.update("Searching Sei documentation and known issues...");
    const searchResults = await agent.searchSeiDocs(issue);

    if (searchResults.citations.length > 0) {
      log.info("Found relevant documentation:", {
        sources: searchResults.citations.map((c) => c.title),
      });
    }

    // 2. If transaction hash found, analyze with code execution
    const txMatch = issue.match(/0x[a-fA-F0-9]{64}/);
    if (txMatch) {
      spinner.update("Analyzing transaction with Python...");
      const analysis = await agent.analyzeTransaction(txMatch[0]);

      // Show code execution results
      if (analysis.codeOutput) {
        log.info("Analysis Results:", {
          stdout: analysis.codeOutput.stdout,
          visualizations: analysis.codeOutput.images,
        });
      }
    }

    // 3. Generate comprehensive report with citations
    spinner.update("Generating debug report...");
    const report = await agent.generateReport({
      issue,
      searchResults,
      analysis,
      seiContext: {
        blockTime: "400ms",
        parallelExecution: true,
        network: "Sei EVM",
      },
    });

    spinner.success("Debug complete!");

    // Display with ReLinka formatting
    log.success("Debug Summary", {
      rootCause: report.rootCause,
      suggestions: report.suggestions,
      citations: report.citations.map((c) => ({
        source: c.title,
        url: c.url,
        relevance: c.cited_text,
      })),
    });
  } catch (error) {
    spinner.error("Debug failed");
    log.error("Error during debug session", error);
  }
};
```

### 9. Testing Strategy with Bun

#### Unit Tests for Anthropic Integration

```typescript
import { describe, it, expect, mock } from "bun:test";
import { SeiDebugAgent } from "./agent";

describe("SeiDebugAgent with Anthropic SDK", () => {
  it("should select appropriate model based on complexity", () => {
    const agent = new SeiDebugAgent();

    expect(agent.selectModel({ complex: true })).toBe("claude-opus-4-20250514");
    expect(agent.selectModel({ complex: false })).toBe(
      "claude-sonnet-4-20250514"
    );
  });

  it("should handle web search with citations", async () => {
    const mockAnthropic = {
      messages: {
        create: mock(async () => ({
          content: [
            {
              type: "text",
              text: "Found issue",
              citations: [
                {
                  url: "https://docs.sei.io/evm",
                  title: "Sei EVM Docs",
                },
              ],
            },
          ],
        })),
      },
    };

    const agent = new SeiDebugAgent(mockAnthropic);
    const result = await agent.searchSeiDocs("parallel execution error");

    expect(result.citations).toHaveLength(1);
    expect(result.citations[0].url).toContain("sei.io");
  });

  it("should use code execution for log analysis", async () => {
    const agent = new SeiDebugAgent();
    const mockLogs = "Error: state conflict in parallel execution";

    const result = await agent.analyzeLogs(mockLogs);

    expect(result.toolsUsed).toContain("code_execution");
    expect(result.analysis).toBeDefined();
  });
});
```

### 10. Real-World Debugging Scenarios

Based on common Sei debugging situations:

```typescript
// scenario-tests/sei-specific.test.ts
describe("Sei-Specific Debugging with Anthropic Tools", () => {
  it("should debug parallel execution with web search", async () => {
    const agent = new SeiDebugAgent();

    const issue = "Transaction 0xabc... failed with 'state modified' on Sei";
    const result = await agent.debug(issue);

    // Should search Sei docs
    expect(result.toolsUsed).toContain("web_search");
    // Should find parallel execution docs
    expect(
      result.citations.some(
        (c) => c.url.includes("sei.io") && c.text.includes("parallel")
      )
    ).toBe(true);
  });

  it("should analyze gas patterns with code execution", async () => {
    const agent = new SeiDebugAgent();

    const logs = getMockSeiLogs(); // Complex logs
    const result = await agent.analyzeGasUsage(logs);

    // Should use Python for analysis
    expect(result.toolsUsed).toContain("code_execution");
    // Should generate visualization
    expect(result.codeOutput.images).toBeDefined();
  });
});
```

### 11. Success Metrics

- **Direct Anthropic SDK integration** with latest features
- **Native web search** with automatic citations
- **Code execution** for complex log analysis
- **Model selection** between Opus 4 and Sonnet 4
- **Cost optimization** through smart model selection
- **Beautiful terminal UI** with ReLinka
- **Deep Sei knowledge** with parallel EVM understanding
- **80%+ test coverage** with Bun tests
- **Streaming responses** for better UX
- **Citation tracking** for debugging accuracy
