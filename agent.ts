import readline from "readline";
import chalk from "chalk";
import Anthropic from "@anthropic-ai/sdk";
import { toJSONSchema } from "zod";
import { tool_defs } from "./toolRegistry.ts";

const client = new Anthropic();

const tools = tool_defs.map((item) => ({
  name: item.name,
  description: item.description,
  input_schema: {
    ...toJSONSchema(item.args),
    type: "object" as const,
  },
}));

const getUserInput = (): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(chalk.green("You: "), (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

const executeTool = async (tool_name: string, args: any) => {
  const tool = tool_defs.find((tool) => tool.name === tool_name);
  if (!tool) {
    return "Tool not found";
  }
  // Execute and validate that we have the right tools
  try {
    const parsedArgs = tool.args.parse(args);
    const result = await tool.execute(parsedArgs as any);
    return result;
  } catch (e) {
    console.log(e);
    return "Error executing tool";
  }
};

const run = async () => {
  console.log(chalk.cyanBright("Welcome to Aura!"));
  const conversations: Anthropic.MessageParam[] = [];
  let processUserInput: boolean = true;

  conversations.push({
    role: "assistant",
    content: "You are Aura, a helpful AI Assistant",
  });

  // Main Agent Loop
  while (true) {
    if (processUserInput) {
      const userInput = await getUserInput();
      if (userInput === "q" || userInput === "quit") {
        break;
      }
      conversations.push({ role: "user", content: userInput });
    }

    // Reset processUserInput
    processUserInput = true;

    const completion = await client.messages.create({
      model: "claude-sonnet-4-0",
      messages: conversations,
      max_tokens: 4096,
      tools: tools,
    });

    for (const message of completion.content) {
      switch (message.type) {
        case "text": {
          conversations.push({ role: "assistant", content: message.text });
          console.log(chalk.blue(`Aura: ${message.text}`));
          break;
        }
        case "tool_use": {
          console.log(
            chalk.yellow(
              `tool : ${message.name}(${JSON.stringify(message.input)})`
            )
          );
          conversations.push({
            role: "assistant",
            content: [
              {
                id: message.id,
                input: message.input,
                name: message.name,
                type: "tool_use",
              },
            ],
          });

          const tool_execution_result = await executeTool(
            message.name,
            message.input
          );
          conversations.push({
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: message.id,
                content: tool_execution_result ?? "",
              },
            ],
          });
          processUserInput = false;
          break;
        }
        default: {
          console.log("Unknown message type:", JSON.stringify(message));
        }
      }
    }
  }

  console.log("Exiting...");
};

run();
