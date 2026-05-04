import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { NokoApi } from '../noko-api.js';
export declare const ENTRY_TOOL_PATHS: {
    noko_list_entries: string;
    noko_create_entry: string;
    noko_edit_entry: string;
    noko_delete_entry: string;
    noko_get_project_entries_past_week: string;
    noko_get_project_entries_past_month: string;
    noko_get_project_entries_current_week: string;
    noko_get_project_entries_date_range: string;
};
export declare const ENTRY_TOOL_METHODS: {
    noko_list_entries: string;
    noko_create_entry: string;
    noko_edit_entry: string;
    noko_delete_entry: string;
    noko_get_project_entries_past_week: string;
    noko_get_project_entries_past_month: string;
    noko_get_project_entries_current_week: string;
    noko_get_project_entries_date_range: string;
};
/**
 * Register entry-related tools
 *
 * @param server - The MCP server instance
 * @param nokoApi - The Noko API client
 */
export declare function registerEntryTools(server: McpServer, nokoApi: NokoApi): void;
