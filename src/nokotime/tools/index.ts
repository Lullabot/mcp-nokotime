import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerEntryTools, ENTRY_TOOL_PATHS, ENTRY_TOOL_METHODS } from './entries.js';
import { registerProjectTools, PROJECT_TOOL_PATHS, PROJECT_TOOL_METHODS } from './projects.js';
import { registerUserTools, USER_TOOL_PATHS, USER_TOOL_METHODS } from './users.js';

// Export all tool paths
export const TOOL_PATHS = {
  ...ENTRY_TOOL_PATHS,
  ...PROJECT_TOOL_PATHS,
  ...USER_TOOL_PATHS,
};

// Export all tool methods
export const TOOL_METHODS = {
  ...ENTRY_TOOL_METHODS,
  ...PROJECT_TOOL_METHODS,
  ...USER_TOOL_METHODS,
};

/**
 * Register all tools
 */
export function registerAllTools(server: McpServer, handleToolCall: (name: string, args: Record<string, any>, options?: { pathParams?: Record<string, any> }) => Promise<any>): void {
  registerEntryTools(server, handleToolCall);
  registerProjectTools(server, handleToolCall);
  registerUserTools(server, handleToolCall);
} 