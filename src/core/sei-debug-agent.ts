import { consola } from "consola";
import ora from "ora";
import type { 
  DebugTask, 
  SeiConfig, 
  DebugReport, 
  AnthropicMessage,
  Citation 
} from "../types/index.js";
import { SeiConfigSchema } from "../types/index.js";
import { AnthropicClient } from "./anthropic-client.js";
import { ModelSelector } from "./model-selector.js";

export class SeiDebugAgent {
  private anthropicClient: AnthropicClient;
  private modelSelector: ModelSelector;
  private config: SeiConfig;
  private log = consola.withTag("sei-debug-agent");

  constructor(config?: Partial<SeiConfig>) {
    this.config = SeiConfigSchema.parse(config || {});
    this.anthropicClient = new AnthropicClient();
    this.modelSelector = new ModelSelector();
    
    this.log.info("Sei Debug Agent initialized", {
      rpcEndpoint: this.config.rpcEndpoint,
      network: this.config.network,
      blockTime: this.config.blockTime,
    });
  }

  async debug(issue: string, userContext?: string): Promise<DebugReport> {
    const task = this.classifyIssue(issue, userContext);
    this.modelSelector.logCostEstimate(task);

    const spinner = ora("Starting debug session...").start();

    try {
      // Start with interactive debugging that can use both search and code execution
      const initialAnalysis = await this.anthropicClient.debugInteractive(issue, task);

      // Extract transaction hash if present for detailed analysis
      const txMatch = issue.match(/0x[a-fA-F0-9]{64}/);
      let transactionAnalysis: AnthropicMessage | undefined;

      if (txMatch) {
        spinner.text = "Analyzing transaction details...";
        transactionAnalysis = await this.analyzeTransaction(txMatch[0], task);
      }

      // Generate comprehensive report
      spinner.text = "Generating final report...";
      const report = await this.anthropicClient.generateReport({
        issue,
        searchResults: initialAnalysis,
        analysis: transactionAnalysis,
        seiContext: this.config,
      });

      spinner.succeed("Debug session completed");

      return this.formatDebugReport(report, initialAnalysis, transactionAnalysis);
    } catch (error) {
      spinner.fail("Debug session failed");
      this.log.error("Debug session error", error);
      throw error;
    }
  }

  async debugParallelExecution(txHash: string, userContext?: string): Promise<DebugReport> {
    const task: DebugTask = {
      type: "parallel",
      complexity: "high",
      data: txHash,
      userContext,
      requiresDeepAnalysis: true,
      requiresCodeExecution: true,
    };

    const spinner = ora("Debugging parallel execution...").start();

    try {
      // Search for parallel execution documentation and issues
      const searchResults = await this.anthropicClient.searchSeiDocs(
        `parallel execution state conflicts nonce issues transaction ${txHash}`,
        task
      );

      // If we have logs or error data, analyze with code execution
      let codeAnalysis: AnthropicMessage | undefined;
      if (searchResults.content.some((c: any) => 
        c.text?.includes("revert") || c.text?.includes("state") || c.text?.includes("nonce")
      )) {
        codeAnalysis = await this.anthropicClient.analyzeWithCodeExecution(
          `Transaction ${txHash} - Search Results: ${JSON.stringify(searchResults.content)}`,
          task
        );
      }

      const report = await this.anthropicClient.generateReport({
        issue: `Parallel execution debug for transaction ${txHash}`,
        searchResults,
        analysis: codeAnalysis,
        seiContext: this.config,
      });

      spinner.succeed("Parallel execution analysis completed");
      return this.formatDebugReport(report, searchResults, codeAnalysis);
    } catch (error) {
      spinner.fail("Parallel execution debug failed");
      this.log.error("Parallel execution debug error", error);
      throw error;
    }
  }

  async analyzeGasPatterns(logs: string): Promise<DebugReport> {
    const task: DebugTask = {
      type: "gas",
      complexity: "medium",
      data: logs,
      requiresCodeExecution: true,
    };

    const analysis = await this.anthropicClient.analyzeWithCodeExecution(
      `Analyze these Sei gas usage logs:

${logs}

Focus on:
1. Gas usage patterns over time
2. Parallel execution efficiency
3. 400ms block time impacts
4. Optimization opportunities`,
      task
    );

    const report = await this.anthropicClient.generateReport({
      issue: "Gas usage analysis",
      analysis,
      seiContext: this.config,
    });

    return this.formatDebugReport(report, undefined, analysis);
  }

  async analyzeTransaction(txHash: string, task?: DebugTask): Promise<AnthropicMessage> {
    const debugTask = task || {
      type: "transaction" as const,
      complexity: "medium" as const,
      data: txHash,
      requiresCodeExecution: true,
    };

    // First search for the transaction
    const searchResults = await this.anthropicClient.searchSeiDocs(
      `transaction ${txHash} sei evm error revert`,
      debugTask
    );

    // Then analyze with code execution if we found relevant data
    if (searchResults.content.length > 0) {
      return await this.anthropicClient.analyzeWithCodeExecution(
        `Transaction ${txHash} data: ${JSON.stringify(searchResults.content)}`,
        debugTask
      );
    }

    return searchResults;
  }

  private classifyIssue(issue: string, userContext?: string): DebugTask {
    const lowerIssue = issue.toLowerCase();
    const hasTransactionHash = /0x[a-fA-F0-9]{64}/.test(issue);
    
    // Determine type
    let type: DebugTask["type"] = "general";
    if (hasTransactionHash) type = "transaction";
    else if (lowerIssue.includes("gas")) type = "gas";
    else if (lowerIssue.includes("parallel") || lowerIssue.includes("state")) type = "parallel";
    else if (lowerIssue.includes("contract")) type = "contract";

    // Determine complexity
    let complexity: DebugTask["complexity"] = "medium";
    if (lowerIssue.includes("revert") || lowerIssue.includes("failed") || lowerIssue.includes("error")) {
      complexity = "high";
    } else if (lowerIssue.includes("how") || lowerIssue.includes("what") || lowerIssue.includes("status")) {
      complexity = "low";
    }

    return {
      type,
      complexity,
      data: issue,
      userContext,
      requiresDeepAnalysis: complexity === "high" || type === "parallel",
      requiresCodeExecution: hasTransactionHash || type === "gas" || lowerIssue.includes("analyze"),
      isSimpleQuery: complexity === "low" && !hasTransactionHash,
      isStatusCheck: lowerIssue.includes("status") || lowerIssue.includes("check"),
      estimatedSearches: hasTransactionHash ? 3 : 2,
      estimatedTokens: complexity === "high" ? 3000 : 1500,
    };
  }

  private formatDebugReport(
    report: AnthropicMessage,
    searchResults?: AnthropicMessage,
    analysis?: AnthropicMessage
  ): DebugReport {
    const allCitations: Citation[] = [
      ...(report.citations || []),
      ...(searchResults?.citations || []),
      ...(analysis?.citations || []),
    ];

    const toolsUsed = [
      ...(report.server_tool_use || []),
      ...(searchResults?.server_tool_use || []),
      ...(analysis?.server_tool_use || []),
    ];

    return {
      analysis: report.content,
      sources: allCitations,
      model: report.model,
      toolsUsed: [...new Set(toolsUsed)],
      citations: allCitations,
      rootCause: this.extractRootCause(report.content),
      suggestions: this.extractSuggestions(report.content),
    };
  }

  private extractRootCause(content: any[]): string | undefined {
    const textContent = content
      .filter(c => c.type === "text")
      .map(c => c.text)
      .join(" ");
    
    // Simple extraction - could be enhanced with better parsing
    const rootCauseMatch = textContent.match(/root cause[:\s]+([^.]+\.)/i);
    return rootCauseMatch?.[1];
  }

  private extractSuggestions(content: any[]): string[] | undefined {
    const textContent = content
      .filter(c => c.type === "text")
      .map(c => c.text)
      .join(" ");
    
    // Extract bullet points or numbered suggestions
    const suggestions = textContent.match(/(\d+\.|•|\*)\s*([^.\n]+\.)/g);
    return suggestions?.map(s => s.replace(/(\d+\.|•|\*)\s*/, ""));
  }
}