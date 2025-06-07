import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk';
import { NokoApi } from '../noko-api.js';

// Paths and methods for entry-related endpoints
export const ENTRY_TOOL_PATHS = {
  "noko_list_entries": "/entries",
  "noko_create_entry": "/entries",
  "noko_edit_entry": "/entries/:id",
  "noko_delete_entry": "/entries/:id",
};

export const ENTRY_TOOL_METHODS = {
  "noko_list_entries": "GET",
  "noko_create_entry": "POST",
  "noko_edit_entry": "PUT",
  "noko_delete_entry": "DELETE",
};

/**
 * Register entry-related tools
 *
 * @param server - The MCP server instance
 * @param nokoApi - The Noko API client
 */
export function registerEntryTools(server: McpServer, nokoApi: NokoApi): void {
  // Register list_entries tool
  server.tool(
    "noko_list_entries",
    "List time entries with optional filters and pagination, or get a specific entry by ID",
    {
      id: z.number().optional()
        .describe("ID of a specific entry to get (if provided, other filters are ignored)"),
      user_ids: z.array(z.number()).optional()
        .describe("List of user IDs to filter by (e.g., [1,2,3])"),
      project_ids: z.array(z.number()).optional()
        .describe("List of project IDs to filter by (e.g., [4,5,6])"),
      description: z.string().optional()
        .describe("Filter entries containing this text in their description"),
      tag_ids: z.array(z.number()).optional()
        .describe("List of tag IDs to filter by (e.g., [7,8,9])"),
      tag_filter_type: z.enum(["and", "combination of"]).optional()
        .describe("How to filter by tags: 'and' (default) requires all tags, 'combination of' requires any tag"),
      invoice_ids: z.array(z.number()).optional()
        .describe("List of invoice IDs to filter by (e.g., [1,2,3])"),
      import_ids: z.array(z.number()).optional()
        .describe("List of import IDs to filter by (e.g., [4,5,6])"),
      from: z.string().optional()
        .describe("Only include entries from or after this date (YYYY-MM-DD)"),
      to: z.string().optional()
        .describe("Only include entries on or before this date (YYYY-MM-DD)"),
      invoiced: z.boolean().optional()
        .describe("Filter by invoice status: true for invoiced entries, false for uninvoiced entries"),
      invoiced_at_from: z.string().optional()
        .describe("Only include entries invoiced from or after this date (YYYY-MM-DD)"),
      invoiced_at_to: z.string().optional()
        .describe("Only include entries invoiced on or before this date (YYYY-MM-DD)"),
      updated_from: z.string().optional()
        .describe("Only include entries updated from or after this timestamp (YYYY-MM-DDTHH:MM:SSZ)"),
      updated_to: z.string().optional()
        .describe("Only include entries updated on or before this timestamp (YYYY-MM-DDTHH:MM:SSZ)"),
      billable: z.boolean().optional()
        .describe("Filter by billable status: true for billable entries, false for unbillable entries"),
      approved_at_from: z.string().optional()
        .describe("Only include entries approved from or after this date (YYYY-MM-DD)"),
      approved_at_to: z.string().optional()
        .describe("Only include entries approved on or before this date (YYYY-MM-DD)"),
      approved_by_ids: z.array(z.number()).optional()
        .describe("List of user IDs who approved entries (e.g., [1,2,3])"),
      per_page: z.number().min(1).max(1000).optional()
        .describe("Number of results per page (1-1000, default: 30)"),
      page: z.number().min(1).optional()
        .describe("Page number (starts at 1)"),
    },
    async (args: any) => {
      // If ID is provided, get specific entry
      if (args.id) {
        return nokoApi.request('GET', '/entries/:id', {}, { id: args.id });
      }
      
      // Otherwise, list entries with filters
      const { id: _id, ...listArgs } = args;
      return nokoApi.request('GET', '/entries', listArgs);
    }
  );

  // Register create_entry tool
  server.tool(
    "noko_create_entry",
    "Create a new time entry",
    {
      date: z.string()
        .describe("Date of the entry in YYYY-MM-DD format"),
      minutes: z.number()
        .describe("Duration of the entry in minutes"),
      description: z.string()
        .describe("Description of the work performed"),
      project_id: z.number().optional()
        .describe("ID of the project this entry belongs to"),
      user_id: z.number().optional()
        .describe("ID of the user this entry belongs to (defaults to the authenticated user)"),
      billable: z.boolean().optional()
        .describe("Whether this entry is billable (defaults to the project's billable setting)"),
      tags: z.array(z.string()).optional()
        .describe("Array of tags to associate with this entry"),
      invoice_id: z.number().optional()
        .describe("ID of an invoice to associate with this entry"),
    },
    async (args: any) => {
      return nokoApi.request('POST', '/entries', args);
    }
  );

  // Register edit_entry tool
  server.tool(
    "noko_edit_entry",
    "Edit an existing time entry",
    {
      id: z.number()
        .describe("ID of the entry to edit"),
      date: z.string().optional()
        .describe("Date of the entry in YYYY-MM-DD format"),
      minutes: z.number().optional()
        .describe("Duration of the entry in minutes"),
      description: z.string().optional()
        .describe("Description of the work performed"),
      project_id: z.number().optional()
        .describe("ID of the project this entry belongs to"),
      user_id: z.number().optional()
        .describe("ID of the user this entry belongs to"),
      billable: z.boolean().optional()
        .describe("Whether this entry is billable"),
      tags: z.array(z.string()).optional()
        .describe("Array of tags to associate with this entry"),
      invoice_id: z.number().optional()
        .describe("ID of an invoice to associate with this entry"),
    },
    async (args: any) => {
      const { id, ...apiArgs } = args;
      return nokoApi.request('PUT', '/entries/:id', apiArgs, { id });
    }
  );

  // Register delete_entry tool
  server.tool(
    "noko_delete_entry",
    "Delete a time entry permanently",
    {
      id: z.number()
        .describe("ID of the entry to delete"),
    },
    async (args: any) => {
      return nokoApi.request('DELETE', '/entries/:id', {}, { id: args.id });
    }
  );
} 