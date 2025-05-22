import { consola } from "consola";
import { SeiDebugAgent } from "../core/sei-debug-agent.js";
import type { DebugReport, SeiConfig } from "../types/index.js";

export class SeiDebugCommands {
  private agent: SeiDebugAgent;
  private log = consola.withTag("sei-debug-commands");

  constructor(config?: Partial<SeiConfig>) {
    this.agent = new SeiDebugAgent(config);
  }

  async debugTransaction(txHash: string, userContext?: string): Promise<DebugReport> {
    this.log.info("Starting transaction debug", { txHash });
    
    if (!this.isValidTxHash(txHash)) {
      throw new Error("Invalid transaction hash format");
    }

    return await this.agent.debug(
      `Debug transaction ${txHash}${userContext ? ` - ${userContext}` : ""}`,
      userContext
    );
  }

  async debugParallelExecution(txHash: string, userContext?: string): Promise<DebugReport> {
    this.log.info("Starting parallel execution debug", { txHash });
    
    if (!this.isValidTxHash(txHash)) {
      throw new Error("Invalid transaction hash format");
    }

    return await this.agent.debugParallelExecution(txHash, userContext);
  }

  async debugGasIssues(dataOrTxHash: string, userContext?: string): Promise<DebugReport> {
    this.log.info("Starting gas issues debug");

    if (this.isValidTxHash(dataOrTxHash)) {
      // If it's a transaction hash, get the transaction data first
      return await this.agent.debug(
        `Analyze gas usage for transaction ${dataOrTxHash}`,
        userContext
      );
    } else {
      // If it's logs or other data, analyze directly
      return await this.agent.analyzeGasPatterns(dataOrTxHash);
    }
  }

  async debugContractDeployment(data: string, userContext?: string): Promise<DebugReport> {
    this.log.info("Starting contract deployment debug");

    return await this.agent.debug(
      `Debug contract deployment: ${data}`,
      userContext
    );
  }

  async debugEvmCosmwasmInterop(data: string, userContext?: string): Promise<DebugReport> {
    this.log.info("Starting EVM-Cosmwasm interop debug");

    return await this.agent.debug(
      `Debug EVM-Cosmwasm interoperability issue: ${data}`,
      userContext
    );
  }

  async debugBlockTiming(data: string, userContext?: string): Promise<DebugReport> {
    this.log.info("Starting block timing debug");

    return await this.agent.debug(
      `Debug block timing issue (400ms blocks): ${data}`,
      userContext
    );
  }

  async debugGeneralIssue(issue: string, userContext?: string): Promise<DebugReport> {
    this.log.info("Starting general issue debug");

    return await this.agent.debug(issue, userContext);
  }

  async explainSeiFeatures(feature?: string): Promise<DebugReport> {
    this.log.info("Explaining Sei features", { feature });

    const query = feature 
      ? `Explain Sei EVM feature: ${feature}`
      : "Explain Sei EVM key features: parallel execution, 400ms blocks, EVM-Cosmwasm interop";

    return await this.agent.debug(query);
  }

  async analyzePerformance(data: string, userContext?: string): Promise<DebugReport> {
    this.log.info("Starting performance analysis");

    return await this.agent.debug(
      `Analyze Sei EVM performance: ${data}. Focus on parallel execution efficiency and block timing.`,
      userContext
    );
  }

  private isValidTxHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }

  // Utility method to format and display results
  displayReport(report: DebugReport): void {
    this.log.success("Debug Report", {
      model: report.model,
      toolsUsed: report.toolsUsed,
    });

    if (report.rootCause) {
      this.log.info("Root Cause", { cause: report.rootCause });
    }

    if (report.suggestions && report.suggestions.length > 0) {
      this.log.info("Suggestions", { suggestions: report.suggestions });
    }

    if (report.citations && report.citations.length > 0) {
      this.log.info("Sources", {
        citations: report.citations.map(c => ({
          title: c.title,
          url: c.url,
          excerpt: c.cited_text?.substring(0, 100) + "...",
        })),
      });
    }

    // Display the main analysis
    const textContent = report.analysis
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text)
      .join("\n");

    if (textContent) {
      this.log.info("Analysis", { content: textContent });
    }
  }
}