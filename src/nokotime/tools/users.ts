import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Paths and methods for user-related endpoints
export const USER_TOOL_PATHS = {
  "noko_list_users": "/users",
};

export const USER_TOOL_METHODS = {
  "noko_list_users": "GET",
};

/**
 * Register user-related tools
 */
export function registerUserTools(server: McpServer, handleToolCall: (name: string, args: Record<string, any>) => Promise<any>): void {
  // Register list_users tool
  server.tool(
    "noko_list_users",
    "List all users",
    {
      name: z.string().optional(),
      email: z.string().optional(),
      state: z.enum(["active", "suspended", "archived", "all"]).optional(),
      role: z.enum(["coworker", "supervisor", "administrator"]).optional(),
      per_page: z.number().optional(),
      page: z.number().optional(),
    },
    async (args) => {
      return handleToolCall("noko_list_users", args);
    }
  );
} 