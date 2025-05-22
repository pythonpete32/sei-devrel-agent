# Sei Debug Agent

An advanced TypeScript debugging agent for Sei Protocol using Anthropic's Claude with native web search, code execution, and Sei-specific blockchain knowledge.

## Features

- 🤖 **Claude Opus 4 & Sonnet 4** integration with intelligent model selection
- 🔍 **Native web search** with automatic citations from Sei documentation
- 🐍 **Code execution** for complex log analysis and visualizations
- ⚡ **Sei-specific knowledge** about parallel EVM, 400ms blocks, and gas optimization
- 💰 **Cost optimization** through smart model selection based on task complexity
- 🎯 **Specialized debugging** for parallel execution conflicts, gas issues, and EVM-Cosmwasm interop
- 🖥️ **Beautiful CLI** with streaming responses and interactive mode

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sei-devrel-agent

# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### Basic Usage

```bash
# Interactive mode
bun dev

# Debug a specific issue
bun dev debug "transaction failed with revert"

# Debug a transaction
bun dev tx 0x1234567890abcdef...

# Debug parallel execution issues
bun dev parallel 0x1234567890abcdef...

# Analyze gas usage
bun dev gas 0x1234567890abcdef...

# Explain Sei features
bun dev explain "parallel execution"
```

## Commands

### General Debugging

```bash
bun dev debug "issue description"              # General issue debugging
bun dev tx <transaction_hash>                  # Debug specific transaction
bun dev explain [feature]                      # Explain Sei EVM features
```

### Specialized Debugging

```bash
bun dev parallel <transaction_hash>            # Debug parallel execution conflicts
bun dev gas <transaction_hash|data>            # Analyze gas usage patterns
bun dev contract <data>                        # Debug contract deployment
bun dev interop <data>                         # Debug EVM-Cosmwasm issues
bun dev timing <data>                          # Debug 400ms block timing
bun dev performance <data>                     # Analyze performance metrics
```

### Utility Commands

```bash
bun dev help                                   # Show help
bun dev info                                   # Show Sei network info
bun dev cost                                   # Show cost information
```

## Examples

### Debug a Failed Transaction

```bash
bun dev tx 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### Debug Parallel Execution Issues

```bash
bun dev parallel 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### Analyze Gas Usage

```bash
bun dev gas "contract call consuming too much gas on Sei"
```

### Explain Sei Features

```bash
bun dev explain                                # Explain all features
bun dev explain "parallel execution"           # Explain specific feature
```

### Interactive Mode

```bash
bun dev
# Then use commands like:
# > debug transaction 0x123... shows pending status
# > gas analyze high usage in my contract
# > explain optimistic parallelization
# > exit
```

## Sei Protocol Knowledge

The agent has deep knowledge of Sei's unique characteristics:

### Parallel EVM

- **Optimistic Parallelization**: Understanding state conflicts and dependencies
- **Performance**: 100 MGas/s throughput with 400ms block times
- **Debugging**: Specialized tools for parallel execution conflicts

### Network Specifications

- **Block Time**: 400ms (fastest EVM)
- **Finality**: 390ms
- **RPC Endpoint**: https://evm-rpc.sei-apis.com
- **Block Explorer**: https://seitrace.com

### Common Issues

- State conflicts between parallel transactions
- Nonce management in high-frequency trading
- Gas optimization for parallel execution
- EVM-Cosmwasm interoperability debugging

## Architecture

### Core Components

- **`SeiDebugAgent`**: Main orchestrator for debugging sessions
- **`AnthropicClient`**: Direct integration with Anthropic SDK
- **`ModelSelector`**: Cost-optimized model selection (Opus 4 vs Sonnet 4)
- **`SeiDebugCommands`**: Specialized debugging commands for Sei
- **`CliHelpers`**: Terminal interface and user interaction

### Model Selection

The agent automatically selects the appropriate Claude model based on task complexity:

- **Claude Opus 4**: Complex analysis, code execution, deep debugging
- **Claude Sonnet 4**: Simple queries, status checks, cost-efficient operations

### Tools Integration

- **Web Search**: Native Claude search with automatic citations
- **Code Execution**: Sandboxed Python environment for log analysis
- **Streaming**: Real-time response updates for better UX

## Development

### Running Tests

```bash
bun test
```

### Project Structure

```
src/
├── core/              # Core agent logic
│   ├── anthropic-client.ts
│   ├── model-selector.ts
│   └── sei-debug-agent.ts
├── commands/          # CLI commands
│   └── debug-commands.ts
├── types/             # TypeScript types
│   └── index.ts
├── utils/             # Utilities
│   └── cli-helpers.ts
└── index.ts           # Main entry point
```

### Adding New Features

1. **New Debug Command**: Add to `SeiDebugCommands` class
2. **New Model Logic**: Extend `ModelSelector` for specific use cases
3. **New CLI Command**: Add to the main switch statement in `index.ts`
4. **New Types**: Define in `src/types/index.ts`

## Cost Management

The agent optimizes costs through:

- **Smart Model Selection**: Opus 4 only for complex tasks
- **Search Limiting**: Maximum searches per task (configurable)
- **Token Estimation**: Predict costs before execution
- **Efficient Prompting**: Structured prompts for better results

Example cost breakdown:

- Simple query: ~$0.002 (Sonnet 4)
- Transaction debug: ~$0.015 (Opus 4 + searches)
- Complex analysis: ~$0.040 (Opus 4 + code execution)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `bun test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please open an issue on GitHub.

## Acknowledgments

- Built with [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- Logging powered by [Consola](https://github.com/unjs/consola)
- Spinners powered by [Ora](https://github.com/sindresorhus/ora)
- Optimized for [Sei Protocol](https://sei.io) debugging
