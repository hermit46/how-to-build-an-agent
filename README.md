# Code Editing Agent

My TypeScript implementation of a code-editing AI agent powered by Claude, inspired by Thorsten Ball's [Amp blog post](https://ampcode.com/how-to-build-an-agent).

## Features

- **File Operations**: Read, list, and edit files in your working directory
- **Interactive Chat**: Natural language interface with Claude
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

The agent comes with three core tools:

### `read_file`

Read the contents of any file in the working directory.

### `list_files`

List files and directories at a given path.

### `edit_file`

Make edits to text files by replacing specific text strings.

## Example Session

```
You: what files are in this directory?

tool: list_files({})

Claude: I can see several files in the current directory:
- README.md
- package.json
- tsconfig.json
- src/ directory with your TypeScript source code
- dist/ directory with compiled JavaScript

You: create a hello.js file that prints hello world

tool: edit_file({"path":"hello.js","old_str":"","new_str":"console.log('Hello, World!');"})

Claude: I've created a hello.js file that prints "Hello, World!" when run with Node.js.

You:
```

## Architecture

- **src/index.ts** - CLI entry point
- **src/agent/** - Core agent logic and conversation management
- **src/llm/** - Anthropic API wrapper
- **src/tools/** - Individual tool implementations
- **src/schema/** - Zod schemas for type validation
- **src/utils/** - File system utilities

## Adding New Tools

1. Create a new tool file in `src/tools/`
2. Define the Zod schema in `src/schema/toolSchemas.ts`
3. Register the tool in `src/index.ts`

Example:

```typescript
export const myTool: Tool<MyArgs, string> = {
  name: "my_tool",
  description: "Description of what the tool does",
  schema: myToolSchema,
  async execute(args: MyArgs): Promise<string> {
    // Implementation here
    return "result";
  },
};
```
