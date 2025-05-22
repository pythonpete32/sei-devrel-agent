import Anthropic from "@anthropic-ai/sdk";
import { consola } from "consola";
import ora from "ora";
import type { DebugTask, AnthropicMessage, Citation } from "../types/index.js";
import { ModelSelector } from "./model-selector.js";

export class AnthropicClient {
  private anthropic: Anthropic;
  private modelSelector: ModelSelector;
  private log = consola.withTag("anthropic-client");

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is required");
    }

    this.anthropic = new Anthropic({ apiKey });
    this.modelSelector = new ModelSelector();
    this.log.info("Anthropic client initialized");
  }

  async searchSeiDocs(
    query: string,
    task: DebugTask
  ): Promise<AnthropicMessage> {
    const model = this.modelSelector.selectModel(task);
    const spinner = ora("Searching Sei documentation...").start();

    try {
      const message = await this.anthropic.messages.create({
        model,
        max_tokens: 4096,
        tools: [
          {
            type: "web_search",
            name: "web_search",
            max_uses: Math.min(task.estimatedSearches || 3, 5),
            allowed_domains: [
              "docs.sei.io",
              "github.com/sei-protocol",
              "etherscan.io",
              "stackoverflow.com",
              "seitrace.com",
            ],
          },
        ],
        messages: [
          {
            role: "user",
            content: `Search for Sei EVM documentation and issues related to: ${query}. 
                     Focus on parallel execution, 400ms block times, and EVM compatibility.
                     ${task.userContext ? `Context: ${task.userContext}` : ""}`,
          },
        ],
      });

      spinner.succeed("Search completed");
      return this.formatMessage(message);
    } catch (error) {
      spinner.fail("Search failed");
      this.log.error("Web search error", error);
      throw error;
    }
  }

  async analyzeWithCodeExecution(
    data: string,
    task: DebugTask
  ): Promise<AnthropicMessage> {
    const model = this.modelSelector.selectModel(task);
    const spinner = ora("Analyzing with Python...").start();

    try {
      const message = await this.anthropic.beta.messages.create({
        model,
        max_tokens: 4096,
        betas: ["code-execution-2025-05-22"],
        tools: [{ type: "code_execution" }],
        messages: [
          {
            role: "user",
            content: `Analyze this Sei blockchain data with Python:

${data}

Tasks:
1. Parse any transaction logs or error messages
2. Identify patterns related to Sei's parallel execution
3. Check for gas usage anomalies
4. Look for state conflicts or nonce issues
5. Create visualizations if helpful

Focus on Sei's unique characteristics:
- 400ms block time
- Parallel EVM execution
- Optimistic parallelization`,
          },
        ],
      });

      spinner.succeed("Analysis completed");
      return this.formatMessage(message);
    } catch (error) {
      spinner.fail("Analysis failed");
      this.log.error("Code execution error", error);
      throw error;
    }
  }

  async debugInteractive(
    issue: string,
    task: DebugTask
  ): Promise<AnthropicMessage> {
    const model = this.modelSelector.selectModel(task);
    const spinner = ora("Analyzing issue...").start();

    try {
      const stream = await this.anthropic.messages.stream({
        model,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `Debug this Sei EVM issue: ${issue}
                     ${task.userContext ? `Context: ${task.userContext}` : ""}
                     
                     Consider Sei's unique characteristics:
                     - Parallel EVM with optimistic execution
                     - 400ms block time
                     - State conflicts between parallel transactions
                     - EVM-Cosmwasm interoperability`,
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
          spinner.text = `Searching: ${tool.input?.query}`;
        } else if (tool.name === "code_execution") {
          spinner.update("Executing Python analysis...");
        }
      });

      const finalMessage = await stream.finalMessage();
      spinner.succeed("Analysis complete");

      return this.formatMessage(finalMessage);
    } catch (error) {
      spinner.fail("Debug failed");
      this.log.error("Interactive debug error", error);
      throw error;
    }
  }

  async generateReport(data: {
    issue: string;
    searchResults?: AnthropicMessage;
    analysis?: AnthropicMessage;
    seiContext: any;
  }): Promise<AnthropicMessage> {
    const task: DebugTask = {
      type: "general",
      complexity: "medium",
      data: data.issue,
      requiresDeepAnalysis: true,
    };

    const model = this.modelSelector.selectModel(task);
    const spinner = ora("Generating comprehensive report...").start();

    try {
      const message = await this.anthropic.messages.create({
        model,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `Generate a comprehensive debugging report for this Sei EVM issue:

Issue: ${data.issue}

Search Results: ${
              data.searchResults
                ? JSON.stringify(data.searchResults.content)
                : "None"
            }
Analysis Results: ${
              data.analysis ? JSON.stringify(data.analysis.content) : "None"
            }

Sei Context:
- Block Time: ${data.seiContext.blockTime}
- Parallel Execution: ${data.seiContext.parallelExecution}
- Network: ${data.seiContext.network}

Provide:
1. Root cause analysis
2. Specific suggestions for Sei EVM
3. Code examples if applicable
4. Prevention strategies`,
          },
        ],
      });

      spinner.succeed("Report generated");
      return this.formatMessage(message);
    } catch (error) {
      spinner.fail("Report generation failed");
      this.log.error("Report generation error", error);
      throw error;
    }
  }

  private formatMessage(message: any): AnthropicMessage {
    // Extract citations from message content
    const citations: Citation[] = message.content
      .filter((c: any) => c.type === "text" && c.citations)
      .flatMap((c: any) => c.citations || []);

    return {
      content: message.content,
      model: message.model,
      server_tool_use: message.usage?.tool_use
        ? ["web_search", "code_execution"]
        : [],
      citations,
    };
  }
}
