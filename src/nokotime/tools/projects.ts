import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { NokoApi } from '../noko-api.js';

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
 * @param nokoApi - The Noko API client
 */
export function registerProjectTools(server: McpServer, nokoApi: NokoApi): void {
  // Register list_projects tool
  server.tool(
    "noko_list_projects",
    "List all available projects with optional filtering and pagination. By default, only returns active projects.",
    {
      name: z.string().optional()
        .describe("Filter projects by name. Performs a keyword-based search (e.g., 'API search')"),
      project_group_ids: z.array(z.number()).optional()
        .describe("List of project group IDs to filter by (e.g., [1,2,3])"),
      billing_increment: z.enum(["1", "5", "6", "10", "15", "20", "30", "60"]).optional()
        .describe("Filter projects by billing increment in minutes. Default is 15."),
      enabled: z.boolean().optional()
        .describe("Filter by project status: true for enabled projects (default), false for archived projects"),
      billable: z.boolean().optional()
        .describe("Filter by billing status: true for billable projects, false for unbillable projects"),
      per_page: z.number().min(1).max(1000).optional()
        .describe("Number of results per page (1-1000, default: 30)"),
      page: z.number().min(1).optional()
        .describe("Page number (starts at 1)"),
    },
    async (args: any) => {
      // If a name is provided, perform a smart search
      if (args.name) {
        return nokoApi.searchProjects(args.name);
      }

      // Otherwise, perform a standard API call
      const apiArgs = { ...args };
      if (apiArgs.enabled === undefined) {
        apiArgs.enabled = true;
      }
      return nokoApi.request('GET', '/projects', apiArgs);
    }
  );
} 