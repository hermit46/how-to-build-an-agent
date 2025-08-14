# How to Build An Agent

My TypeScript implementation of an AI agent powered by Claude, inspired by Thorsten Ball's [Amp blog post](https://ampcode.com/how-to-build-an-agent).

## Features

- **File Operations**: Read, list, edit, and create files in your working directory
- **Interactive Chat**: Natural language interface with Claude (Aura)
- **Tool System**: Extensible architecture for adding new capabilities
- **Type Safety**: Full TypeScript support with runtime validation

## Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime & package manager)
- [Anthropic API key](https://console.anthropic.com/settings/keys)

## Installation

```bash
bun install
```

## Setup

Set your Anthropic API key as an environment variable:

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

## Usage

### Development Mode (with hot reload)

```bash
bun run dev
```

### Production Mode

```bash
bun start
```

### Build for Distribution

```bash
bun run build
```

## Available Tools

The agent comes with four core tools:

### `read_file`

Read the contents of any file in the working directory.

### `list_directory`

List files and directories at a given path.

### `edit_file`

Make edits to text files by replacing specific text strings.

### `create_file`

Create new files with specified content.

## Example Session

```
You: what files are in this directory?

tool: list_directory({"dir_path":"."})

Aura: I can see several files in the current directory:
- README.md
- package.json
- tsconfig.json
- agent.ts - Main agent implementation
- toolRegistry.ts - Tool definitions
- fileUtils.ts - File operation utilities

You: create a hello.js file that prints hello world

tool: create_file({"file_path":"hello.js","content":"console.log('Hello, World!');"})

Aura: I've created a hello.js file that prints "Hello, World!" when run with Node.js.

You:
```

## Architecture

- **agent.ts** - Main agent implementation with conversation loop
- **toolRegistry.ts** - Tool definitions and registry
- **fileUtils.ts** - File system utility functions

## Adding New Tools

1. Add your tool definition to `toolRegistry.ts`:

```typescript
{
  name: "my_tool",
  description: "Description of what the tool does",
  args: z.object({
    param: z.string(),
  }),
  execute: myToolFunction,
}
```

2. Implement the tool function in `fileUtils.ts` or create a new utility file
