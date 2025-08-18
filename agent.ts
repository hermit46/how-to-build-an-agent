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

    const stream = client.messages.stream({
      model: "claude-sonnet-4-0",
      messages: conversations,
      max_tokens: 4096,
      tools: tools,
    });

    let currentTextContent = "";
    let isFirstText = true;

    await new Promise<void>((resolve) => {
      stream.on("text", (text) => {
        if (isFirstText) {
          process.stdout.write(chalk.blue("Aura: "));
          isFirstText = false;
        }
        process.stdout.write(chalk.blue(text));
        currentTextContent += text;
      });

      stream.on("finalMessage", async (message) => {
        if (currentTextContent) {
          console.log(); // New line after streaming
          conversations.push({
            role: "assistant",
            content: currentTextContent,
          });
        }

        // Handle tool calls from the final message
        for (const content of message.content) {
          if (content.type === "tool_use") {
            // Log the tool call
            console.log(
              chalk.yellow(
                `tool : ${content.name}(${JSON.stringify(content.input)})`
              )
            );

            // Add the tool call to the conversations
            conversations.push({
              role: "assistant",
              content: [
                {
                  id: content.id,
                  input: content.input,
                  name: content.name,
                  type: "tool_use",
                },
              ],
            });

            // Execute the tool
            const tool_execution_result = await executeTool(
              content.name,
              content.input
            );

            // Add the tool result to the conversations
            conversations.push({
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: content.id,
                  content: tool_execution_result ?? "",
                },
              ],
            });
            processUserInput = false;
          }
        }

        resolve();
      });

      stream.on("error", (error) => {
        console.error("Stream error:", error);
        resolve();
      });
    });
  }

  console.log("Exiting...");
};

run();
