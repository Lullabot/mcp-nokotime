import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { NokoApi } from '../noko-api.js';
export declare const USER_TOOL_PATHS: {
    noko_list_users: string;
};
export declare const USER_TOOL_METHODS: {
    noko_list_users: string;
};
/**
 * Register user-related tools
 *
 * @param server - The MCP server instance
 * @param nokoApi - The Noko API client
 */
export declare function registerUserTools(server: McpServer, nokoApi: NokoApi): void;
