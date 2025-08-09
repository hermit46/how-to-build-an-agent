import z from "zod";
import { readFile, editFile, createFile, listDirectory } from "./fileUtils.ts";

export const tool_defs = [
  {
    name: "read_file",
    description: "Read the contents of a file at a given path.",
    args: z.object({
      file_path: z.string(),
    }),
    execute: readFile,
  },
  {
    name: "edit_file",
    description: "Edit a file by replacing old_str with new_str.",
    args: z.object({
      file_path: z.string(),
      old_string: z.string(),
      new_string: z.string(),
    }),
    execute: editFile,
  },
  {
    name: "create_file",
    description: "Create a file at a given path.",
    args: z.object({
      file_path: z.string(),
      content: z.string(),
    }),
    execute: createFile,
  },
  {
    name: "list_directory",
    description: "List files and directories at a given path.",
    args: z.object({
      dir_path: z.string(),
    }),
    execute: listDirectory,
  },
];
