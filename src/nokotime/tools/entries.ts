import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Paths and methods for entry-related endpoints
export const ENTRY_TOOL_PATHS = {
  "noko_list_entries": "/entries",
  "noko_create_entry": "/entries",
};

export const ENTRY_TOOL_METHODS = {
  "noko_list_entries": "GET",
  "noko_create_entry": "POST",
};

/**
 * Register entry-related tools
 */
export function registerEntryTools(server: McpServer, handleToolCall: (name: string, args: Record<string, any>) => Promise<any>): void {
  // Register list_entries tool
  server.tool(
    "noko_list_entries",
    "List time entries with optional filters",
    {
      "user_ids[]": z.array(z.number()).optional(),
      "project_ids[]": z.array(z.number()).optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      invoiced: z.boolean().optional(),
      updated_from: z.string().optional(),
      updated_to: z.string().optional(),
      per_page: z.number().optional(),
      page: z.number().optional(),
    },
    async (args) => {
      return handleToolCall("noko_list_entries", args);
    }
  );

  // Register create_entry tool
  server.tool(
    "noko_create_entry",
    "Create a new time entry",
    {
      date: z.string(),
      minutes: z.number(),
      description: z.string(),
      project_id: z.number().optional(),
      user_id: z.number().optional(),
      billable: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      invoice_id: z.number().optional(),
    },
    async (args) => {
      return handleToolCall("noko_create_entry", args);
    }
  );
} 