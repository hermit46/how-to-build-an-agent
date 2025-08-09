import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const listDirectory = async (args: {
  dir_path: string;
}): Promise<string> => {
  try {
    const { stdout } = await execAsync(`npx tree-cli ${args.dir_path}`);
    return stdout;
  } catch {
    return `Directory not found: ${args.dir_path}`;
  }
};

export const readFile = (args: { file_path: string }): string => {
  const resolvedPath = path.resolve(args.file_path);

  if (!fs.existsSync(resolvedPath)) {
    return `File not found: ${args.file_path} (resolved to: ${resolvedPath})`;
  }

  return fs.readFileSync(resolvedPath, "utf-8");
};

export const editFile = (args: {
  file_path: string;
  old_string: string;
  new_string: string;
}): void => {
  const content = readFile({ file_path: args.file_path });
  const updatedContent = content.replace(args.old_string, args.new_string);
  fs.writeFileSync(args.file_path, updatedContent);
};

export const createFile = (args: {
  file_path: string;
  content: string;
}): string => {
  const resolvedPath = path.resolve(args.file_path);

  try {
    fs.writeFileSync(resolvedPath, args.content);
    return `File ${args.file_path} created successfully`;
  } catch (error) {
    throw new Error(
      `Failed to create file ${args.file_path}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
