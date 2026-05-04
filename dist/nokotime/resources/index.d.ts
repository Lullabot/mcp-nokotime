import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { NokoApi } from '../noko-api.js';
interface Logger {
    debug: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
}
/**
 * Register all resources with the MCP server
 */
export declare function registerResources(server: McpServer, nokoApi: NokoApi, logger?: Logger): void;
export {};
