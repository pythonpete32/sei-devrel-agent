#!/usr/bin/env bun

import { consola } from "consola";
import { SeiDebugCommands } from "./commands/debug-commands.js";
import { CliHelpers } from "./utils/cli-helpers.js";

const log = consola.withTag("sei-debug-cli");
const debugCommands = new SeiDebugCommands();
const cli = new CliHelpers();

async function main() {
  const args = process.argv.slice(2);
  
  try {
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      log.error("Missing ANTHROPIC_API_KEY environment variable");
      log.info("Please set your Anthropic API key:");
      log.info("export ANTHROPIC_API_KEY=your_api_key_here");
      process.exit(1);
    }

    // Parse command
    const { command, data } = cli.parseCommand(args);

    // Handle commands
    switch (command) {
      case "help":
      case "-h":
      case "--help":
        cli.displayHelp();
        break;

      case "welcome":
        cli.displayWelcome();
        break;

      case "info":
        cli.displaySeiInfo();
        break;

      case "cost":
        cli.displayCostInfo();
        break;

      case "debug":
        if (!data) {
          log.error("Please provide an issue to debug");
          log.info("Example: bun dev debug 'transaction failed with revert'");
          process.exit(1);
        }
        await handleDebug(data);
        break;

      case "tx":
        if (!data) {
          log.error("Please provide a transaction hash");
          log.info("Example: bun dev tx 0x1234567890abcdef...");
          process.exit(1);
        }
        await handleTransaction(data);
        break;

      case "parallel":
        if (!data) {
          log.error("Please provide a transaction hash for parallel execution debugging");
          process.exit(1);
        }
        await handleParallelExecution(data);
        break;

      case "gas":
        if (!data) {
          log.error("Please provide transaction hash or gas usage data");
          log.info("Example: bun dev gas 0x1234... or bun dev gas 'high gas usage logs'");
          process.exit(1);
        }
        await handleGasAnalysis(data);
        break;

      case "contract":
        if (!data) {
          log.error("Please provide contract deployment data or issue");
          process.exit(1);
        }
        await handleContractDebug(data);
        break;

      case "interop":
        if (!data) {
          log.error("Please provide EVM-Cosmwasm interoperability issue data");
          process.exit(1);
        }
        await handleInteropDebug(data);
        break;

      case "timing":
        if (!data) {
          log.error("Please provide block timing issue data");
          process.exit(1);
        }
        await handleTimingDebug(data);
        break;

      case "explain":
        await handleExplain(data);
        break;

      case "performance":
        if (!data) {
          log.error("Please provide performance data to analyze");
          process.exit(1);
        }
        await handlePerformanceAnalysis(data);
        break;

      case "interactive":
      default:
        await handleInteractiveMode();
        break;
    }
  } catch (error) {
    cli.displayError(error);
    process.exit(1);
  }
}

async function handleDebug(issue: string) {
  try {
    log.info("Starting general debug session...");
    const report = await debugCommands.debugGeneralIssue(issue);
    debugCommands.displayReport(report);
  } catch (error) {
    cli.displayError(error);
  }
}

async function handleTransaction(txHash: string) {
  try {
    if (!cli.validateTxHash(txHash)) {
      // Try to extract tx hash from the input
      const extractedHash = cli.extractTxHash(txHash);
      if (extractedHash) {
        txHash = extractedHash;
      } else {
        log.error("Invalid transaction hash format");
        log.info("Transaction hash must be in format: 0x followed by 64 hex characters");
        return;
      }
    }

    log.info("Starting transaction debug session...");
    const report = await debugCommands.debugTransaction(txHash);
    debugCommands.displayReport(report);
  } catch (error) {
    cli.displayError(error);
  }
}

async function handleParallelExecution(txHash: string) {
  try {
    if (!cli.validateTxHash(txHash)) {
      const extractedHash = cli.extractTxHash(txHash);
      if (extractedHash) {
        txHash = extractedHash;
      } else {
        log.error("Invalid transaction hash format");
        return;
      }
    }

    log.info("Starting parallel execution debug session...");
    const report = await debugCommands.debugParallelExecution(txHash);
    debugCommands.displayReport(report);
  } catch (error) {
    cli.displayError(error);
  }
}

async function handleGasAnalysis(data: string) {
  try {
    log.info("Starting gas analysis...");
    const report = await debugCommands.debugGasIssues(data);
    debugCommands.displayReport(report);
  } catch (error) {
    cli.displayError(error);
  }
}

async function handleContractDebug(data: string) {
  try {
    log.info("Starting contract deployment debug...");
    const report = await debugCommands.debugContractDeployment(data);
    debugCommands.displayReport(report);
  } catch (error) {
    cli.displayError(error);
  }
}

async function handleInteropDebug(data: string) {
  try {
    log.info("Starting EVM-Cosmwasm interop debug...");
    const report = await debugCommands.debugEvmCosmwasmInterop(data);
    debugCommands.displayReport(report);
  } catch (error) {
    cli.displayError(error);
  }
}

async function handleTimingDebug(data: string) {
  try {
    log.info("Starting block timing debug...");
    const report = await debugCommands.debugBlockTiming(data);
    debugCommands.displayReport(report);
  } catch (error) {
    cli.displayError(error);
  }
}

async function handleExplain(feature?: string) {
  try {
    log.info("Explaining Sei features...");
    const report = await debugCommands.explainSeiFeatures(feature);
    debugCommands.displayReport(report);
  } catch (error) {
    cli.displayError(error);
  }
}

async function handlePerformanceAnalysis(data: string) {
  try {
    log.info("Starting performance analysis...");
    const report = await debugCommands.analyzePerformance(data);
    debugCommands.displayReport(report);
  } catch (error) {
    cli.displayError(error);
  }
}

async function handleInteractiveMode() {
  cli.displayWelcome();
  
  log.info("Entering interactive mode. Type 'help' for commands or 'exit' to quit.");
  
  process.stdin.setRawMode(false);
  process.stdin.setEncoding('utf8');

  while (true) {
    try {
      const input = await cli.promptForInput("\nsei-debug>");
      
      if (input === "exit" || input === "quit") {
        log.info("Goodbye!");
        break;
      }
      
      if (input === "help") {
        cli.displayHelp();
        continue;
      }

      if (input === "info") {
        cli.displaySeiInfo();
        continue;
      }

      if (input === "cost") {
        cli.displayCostInfo();
        continue;
      }

      if (input.trim() === "") {
        continue;
      }

      // Parse and execute the command
      const args = input.split(" ");
      const { command, data } = cli.parseCommand(args);

      switch (command) {
        case "debug":
          await handleDebug(data);
          break;
        case "tx":
          await handleTransaction(data);
          break;
        case "parallel":
          await handleParallelExecution(data);
          break;
        case "gas":
          await handleGasAnalysis(data);
          break;
        case "contract":
          await handleContractDebug(data);
          break;
        case "interop":
          await handleInteropDebug(data);
          break;
        case "timing":
          await handleTimingDebug(data);
          break;
        case "explain":
          await handleExplain(data);
          break;
        case "performance":
          await handlePerformanceAnalysis(data);
          break;
        default:
          // Treat unknown commands as general debug issues
          await handleDebug(input);
          break;
      }
    } catch (error) {
      cli.displayError(error);
    }
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  log.info("\nReceived SIGINT. Exiting gracefully...");
  process.exit(0);
});

process.on('SIGTERM', () => {
  log.info("\nReceived SIGTERM. Exiting gracefully...");
  process.exit(0);
});

// Start the application
main().catch((error) => {
  cli.displayError(error);
  process.exit(1);
});