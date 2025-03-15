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
 * 
 * @param server - The MCP server instance
 * @param handleToolCall - Function to handle the actual API call
 */
export function registerProjectTools(server: McpServer, handleToolCall: (name: string, args: Record<string, any>, options?: { pathParams?: Record<string, any> }) => Promise<any>): void {
  // Register list_projects tool
  server.tool(
    "noko_list_projects",
    "List all available projects with optional filtering and pagination",
    {
      name: z.string().optional()
        .describe("Filter projects by name (partial matching)"),
      project_group_ids: z.string().optional()
        .describe("Comma-separated list of project group IDs to filter by (e.g., '1,2,3')"),
      billing_increment: z.enum(["1", "5", "6", "10", "15", "20", "30", "60"]).optional()
        .describe("Filter projects by billing increment in minutes. Default is 15."),
      enabled: z.boolean().optional()
        .describe("Filter by project status: true for enabled projects, false for archived projects"),
      billable: z.boolean().optional()
        .describe("Filter by billing status: true for billable projects, false for unbillable projects"),
      per_page: z.number().min(1).max(1000).optional()
        .describe("Number of results per page (1-1000, default: 30)"),
      page: z.number().min(1).optional()
        .describe("Page number (starts at 1)"),
    },
    async (args) => {
      return handleToolCall("noko_list_projects", args);
    }
  );
} 