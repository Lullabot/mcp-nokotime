import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Paths and methods for project-related endpoints
export const PROJECT_TOOL_PATHS = {
  "noko_list_projects": "/projects",
};

export const PROJECT_TOOL_METHODS = {
  "noko_list_projects": "GET",
};

/**
 * Register project-related tools
 */
export function registerProjectTools(server: McpServer, handleToolCall: (name: string, args: Record<string, any>) => Promise<any>): void {
  // Register list_projects tool
  server.tool(
    "noko_list_projects",
    "List all available projects",
    {
      name: z.string().optional(),
      state: z.enum(["active", "archived", "all"]).optional(),
      billing_increment: z.number().optional(),
      enabled_for_tracking: z.boolean().optional(),
      per_page: z.number().optional(),
      page: z.number().optional(),
    },
    async (args) => {
      return handleToolCall("noko_list_projects", args);
    }
  );
} 