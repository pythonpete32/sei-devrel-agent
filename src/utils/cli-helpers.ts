import { consola } from "consola";

export class CliHelpers {
  private log = consola.withTag("cli-helpers");

  displayWelcome(): void {
    this.log.info(`
╔═══════════════════════════════════════════════════════════════╗
║                    Sei Debug Agent v1.0.0                    ║
║             Advanced Blockchain Debugging with Claude        ║
╠═══════════════════════════════════════════════════════════════╣
║ Commands:                                                     ║
║   debug <issue>              - Debug any Sei EVM issue       ║
║   tx <hash>                  - Debug specific transaction    ║
║   parallel <hash>            - Debug parallel execution      ║
║   gas <data>                 - Analyze gas usage             ║
║   contract <data>            - Debug contract deployment     ║
║   interop <data>             - Debug EVM-Cosmwasm issues     ║
║   timing <data>              - Debug block timing issues     ║
║   explain [feature]          - Explain Sei features          ║
║   performance <data>         - Analyze performance           ║
║                                                               ║
║ Sei Network Info:                                            ║
║   • Block Time: 400ms                                        ║
║   • Parallel EVM execution                                   ║
║   • RPC: https://evm-rpc.sei-apis.com                       ║
║   • Explorer: https://seitrace.com                          ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }

  displayHelp(): void {
    this.log.info(`
Sei Debug Agent - Command Reference

BASIC USAGE:
  bun dev                               Start interactive mode
  bun dev debug "transaction failed"    Debug general issue
  bun dev tx 0xabc123...               Debug specific transaction

SPECIALIZED COMMANDS:
  parallel <tx_hash>                   Debug parallel execution conflicts
  gas <tx_hash|logs>                   Analyze gas usage patterns  
  contract <data>                      Debug contract deployment issues
  interop <data>                       Debug EVM-Cosmwasm interoperability
  timing <data>                        Debug 400ms block timing issues
  explain [feature]                    Explain Sei EVM features
  performance <data>                   Analyze performance metrics

EXAMPLES:
  # Debug a failed transaction
  bun dev tx 0x1234567890abcdef...

  # Debug parallel execution issue
  bun dev parallel 0x1234567890abcdef...

  # Analyze gas usage
  bun dev gas "high gas usage in contract call"

  # Explain Sei features
  bun dev explain "parallel execution"
  bun dev explain

  # General debugging
  bun dev debug "MetaMask shows pending transaction"

ENVIRONMENT:
  ANTHROPIC_API_KEY                    Required: Your Anthropic API key
  
FEATURES:
  • Claude Opus 4 & Sonnet 4 integration
  • Native web search with citations
  • Code execution for log analysis
  • Sei-specific debugging knowledge
  • Cost-optimized model selection
  • Real-time streaming responses
    `);
  }

  parseCommand(args: string[]): { command: string; data: string; context?: string } {
    if (args.length === 0) {
      return { command: "interactive", data: "" };
    }

    const command = args[0];
    const data = args.slice(1).join(" ");

    return { command, data };
  }

  validateTxHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }

  extractTxHash(text: string): string | null {
    const match = text.match(/0x[a-fA-F0-9]{64}/);
    return match ? match[0] : null;
  }

  formatError(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  displayError(error: any): void {
    this.log.error("Error occurred", {
      message: this.formatError(error),
      timestamp: new Date().toISOString(),
    });
  }

  displaySuccess(message: string, data?: any): void {
    this.log.success(message, data);
  }

  async promptForInput(message: string): Promise<string> {
    // Simple stdin reading for interactive mode
    process.stdout.write(`${message}: `);
    
    return new Promise((resolve) => {
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim());
      });
    });
  }

  displaySeiInfo(): void {
    this.log.info("Sei Network Information", {
      network: "Sei EVM",
      blockTime: "400ms",
      finality: "390ms", 
      throughput: "100 MGas/s",
      rpc: "https://evm-rpc.sei-apis.com",
      explorer: "https://seitrace.com",
      docs: "https://docs.sei.io/evm/",
      features: [
        "Parallel EVM execution",
        "Optimistic parallelization", 
        "EVM-Cosmwasm interoperability",
        "SeiDB optimized state storage"
      ]
    });
  }

  displayCostInfo(): void {
    this.log.info("Cost Information", {
      "Claude Opus 4": "Used for complex analysis and code execution",
      "Claude Sonnet 4": "Used for simple queries and cost efficiency",
      "Web Search": "~$0.01 per search",
      "Auto Selection": "Model chosen based on task complexity"
    });
  }
}