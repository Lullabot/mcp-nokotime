import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import axios from 'axios';

// Logger interface
interface Logger {
  debug: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

/**
 * Register all resources with the MCP server
 */
export function registerResources(server: McpServer, apiToken: string, logger?: Logger) {
  const baseUrl = "https://api.nokotime.com/v2";
  
  // Use console as fallback if no logger provided
  const log = logger || {
    debug: console.debug,
    error: console.error
  };
  
  // Create API client for Noko
  const makeRequest = async (path: string) => {
    try {
      const response = await axios({
        method: 'GET',
        url: `${baseUrl}${path}`,
        headers: {
          'X-NokoToken': apiToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'NokoMCP/0.1.0'
        }
      });
      
      return response.data;
    } catch (error: any) {
      log.error('Error making API request', error);
      throw new Error(error.response?.data?.error || error.message || 'Unknown API error');
    }
  };
  
  // Register user resources
  registerUserResources(server, makeRequest, log);
  
  // Register project resources
  registerProjectResources(server, makeRequest, log);
  
  // Register entries resources
  registerEntryResources(server, makeRequest, log);
}

/**
 * Register user-related resources
 */
function registerUserResources(
  server: McpServer, 
  makeRequest: (path: string) => Promise<any>,
  logger: Logger
) {
  // List users resource
  server.resource(
    "users",
    new ResourceTemplate("noko://users", { list: undefined }),
    async (uri) => {
      logger.debug("Fetching users");
      try {
        const users = await makeRequest('/users');
        
        return {
          contents: [
            {
              uri: uri.href,
              metadata: {
                title: "Noko Users",
                description: "List of all Noko users"
              },
              text: JSON.stringify(users, null, 2)
            }
          ]
        };
      } catch (error: any) {
        logger.error("Error fetching users", error);
        
        return {
          contents: [
            {
              uri: uri.href,
              metadata: {
                title: "Noko Users Error",
                description: "Error fetching users"
              },
              text: `Error fetching users: ${error.message || 'Unknown error'}`
            }
          ]
        };
      }
    }
  );
}

/**
 * Register project-related resources
 */
function registerProjectResources(
  server: McpServer, 
  makeRequest: (path: string) => Promise<any>,
  logger: Logger
) {
  // List projects resource
  server.resource(
    "projects",
    new ResourceTemplate("noko://projects", { list: undefined }),
    async (uri) => {
      logger.debug("Fetching projects");
      try {
        const projects = await makeRequest('/projects');
        
        return {
          contents: [
            {
              uri: uri.href,
              metadata: {
                title: "Noko Projects",
                description: "List of all Noko projects"
              },
              text: JSON.stringify(projects, null, 2)
            }
          ]
        };
      } catch (error: any) {
        logger.error("Error fetching projects", error);
        
        return {
          contents: [
            {
              uri: uri.href,
              metadata: {
                title: "Noko Projects Error",
                description: "Error fetching projects"
              },
              text: `Error fetching projects: ${error.message || 'Unknown error'}`
            }
          ]
        };
      }
    }
  );
}

/**
 * Register entries-related resources
 */
function registerEntryResources(
  server: McpServer, 
  makeRequest: (path: string) => Promise<any>,
  logger: Logger
) {
  // List entries resource
  server.resource(
    "entries",
    new ResourceTemplate("noko://entries", { list: undefined }),
    async (uri) => {
      logger.debug("Fetching entries");
      try {
        const entries = await makeRequest('/entries');
        
        return {
          contents: [
            {
              uri: uri.href,
              metadata: {
                title: "Noko Entries",
                description: "List of time entries"
              },
              text: JSON.stringify(entries, null, 2)
            }
          ]
        };
      } catch (error: any) {
        logger.error("Error fetching entries", error);
        
        return {
          contents: [
            {
              uri: uri.href,
              metadata: {
                title: "Noko Entries Error",
                description: "Error fetching entries"
              },
              text: `Error fetching entries: ${error.message || 'Unknown error'}`
            }
          ]
        };
      }
    }
  );
} 