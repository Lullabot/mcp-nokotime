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
 * 
 * @param server - The MCP server instance
 * @param handleToolCall - Function to handle the actual API call
 */
export function registerUserTools(server: McpServer, handleToolCall: (name: string, args: Record<string, any>, options?: { pathParams?: Record<string, any> }) => Promise<any>): void {
  // Register list_users tool
  server.tool(
    "noko_list_users",
    "List all users with optional filtering and pagination",
    {
      name: z.string().optional().describe("Filter users by name (partial matching)"),
      email: z.string().optional().describe("Filter users by email (partial matching)"),
      state: z.enum(["disabled", "pending", "active", "suspended", "all"]).optional()
        .describe("Filter users by their account state. Use 'all' to not filter by state."),
      role: z.enum(["supervisor", "leader", "coworker", "contractor"]).optional()
        .describe("Filter users by their role in the organization"),
      per_page: z.number().min(1).max(1000).optional()
        .describe("Number of results per page (1-1000, default: 30)"),
      page: z.number().min(1).optional()
        .describe("Page number (starts at 1)"),
    },
    async (args) => {
      return handleToolCall("noko_list_users", args);
    }
  );
} 