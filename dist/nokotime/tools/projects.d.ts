import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { NokoApi } from '../noko-api.js';
export declare const PROJECT_TOOL_PATHS: {
    noko_list_projects: string;
};
export declare const PROJECT_TOOL_METHODS: {
    noko_list_projects: string;
};
/**
 * Register project-related tools
 *
 * @param server - The MCP server instance
 * @param nokoApi - The Noko API client
 */
export declare function registerProjectTools(server: McpServer, nokoApi: NokoApi): void;
