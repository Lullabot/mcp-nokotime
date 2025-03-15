import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import axios from 'axios';

// Logger interface
interface Logger {
  debug: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

// Define Resource interface for list results with index signature
interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  [key: string]: unknown;
}

// Define ListResourcesResult interface
interface ListResourcesResult {
  resources: Resource[];
  _meta?: Record<string, unknown>;
  nextCursor?: string;
  [key: string]: unknown;
}

// RequestHandlerExtra type
interface RequestHandlerExtra {
  [key: string]: unknown;
}

// Get the correct type for ListResourcesCallback
type ListResourcesCallback = (extra: RequestHandlerExtra) => ListResourcesResult | Promise<ListResourcesResult>;

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
  
  log.debug("About to register resources");
  
  // Register user resources
  registerUserResources(server, makeRequest, log);
  
  // Register project resources
  registerProjectResources(server, makeRequest, log);
  
  // Register entries resources
  registerEntryResources(server, makeRequest, log);
  
  log.debug("Resources registered");
}

/**
 * Register user-related resources
 */
function registerUserResources(
  server: McpServer, 
  makeRequest: (path: string) => Promise<any>,
  logger: Logger
) {
  // List users callback for users resource
  const listUsersCallback: ListResourcesCallback = async (extra) => {
    try {
      const users = await makeRequest('/users');
      const resources: Resource[] = users.map((user: any) => ({
        uri: `noko://user/${user.id}`,
        name: `${user.first_name} ${user.last_name}`,
        description: `${user.email} (${user.state})`,
      }));
      
      return {
        resources
      };
    } catch (error) {
      logger.error("Error listing users", error);
      return { resources: [] };
    }
  };

  // List users resource
  server.resource(
    "users",
    new ResourceTemplate("noko://users", { 
      list: listUsersCallback 
    }),
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

  // Single user resource
  server.resource(
    "user",
    new ResourceTemplate("noko://user/{id}", { list: undefined }),
    async (uri, { id }) => {
      logger.debug(`Fetching user ${id}`);
      try {
        const user = await makeRequest(`/users/${id}`);
        
        return {
          contents: [
            {
              uri: uri.href,
              metadata: {
                title: `User: ${user.first_name} ${user.last_name}`,
                description: `Details for Noko user ${id}`
              },
              text: JSON.stringify(user, null, 2)
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error fetching user ${id}`, error);
        
        return {
          contents: [
            {
              uri: uri.href,
              metadata: {
                title: `User Error: ${id}`,
                description: `Error fetching user ${id}`
              },
              text: `Error fetching user: ${error.message || 'Unknown error'}`
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
  // Project listing callback
  const listProjectsCallback: ListResourcesCallback = async (extra) => {
    try {
      const projects = await makeRequest('/projects');
      const resources: Resource[] = projects.map((project: any) => ({
        uri: `noko://project/${project.id}`,
        name: project.name,
        description: `${project.name} (${project.state})`,
      }));
      
      return {
        resources
      };
    } catch (error) {
      logger.error("Error listing projects", error);
      return { resources: [] };
    }
  };

  // List projects resource
  server.resource(
    "projects",
    new ResourceTemplate("noko://projects", { 
      list: listProjectsCallback 
    }),
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
  
  // Single project resource
  server.resource(
    "project",
    new ResourceTemplate("noko://project/{id}", { list: undefined }),
    async (uri, { id }) => {
      logger.debug(`Fetching project ${id}`);
      try {
        const project = await makeRequest(`/projects/${id}`);
        
        return {
          contents: [
            {
              uri: uri.href,
              metadata: {
                title: `Project: ${project.name}`,
                description: `Details for Noko project ${id}`
              },
              text: JSON.stringify(project, null, 2)
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error fetching project ${id}`, error);
        
        return {
          contents: [
            {
              uri: uri.href,
              metadata: {
                title: `Project Error: ${id}`,
                description: `Error fetching project ${id}`
              },
              text: `Error fetching project: ${error.message || 'Unknown error'}`
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
  // Entry listing callback
  const listEntriesCallback: ListResourcesCallback = async (extra) => {
    try {
      const entries = await makeRequest('/entries');
      const resources: Resource[] = entries.map((entry: any) => ({
        uri: `noko://entry/${entry.id}`,
        name: `Entry ${entry.id}`,
        description: entry.description || `Time entry from ${entry.date}`,
      }));
      
      return {
        resources
      };
    } catch (error) {
      logger.error("Error listing entries", error);
      return { resources: [] };
    }
  };

  // List entries resource
  server.resource(
    "entries",
    new ResourceTemplate("noko://entries", { 
      list: listEntriesCallback 
    }),
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
  
  // Single entry resource
  server.resource(
    "entry",
    new ResourceTemplate("noko://entry/{id}", { list: undefined }),
    async (uri, { id }) => {
      logger.debug(`Fetching entry ${id}`);
      try {
        const entry = await makeRequest(`/entries/${id}`);
        
        return {
          contents: [
            {
              uri: uri.href,
              metadata: {
                title: `Entry: ${entry.id}`,
                description: `Details for Noko time entry ${id}`
              },
              text: JSON.stringify(entry, null, 2)
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error fetching entry ${id}`, error);
        
        return {
          contents: [
            {
              uri: uri.href,
              metadata: {
                title: `Entry Error: ${id}`,
                description: `Error fetching entry ${id}`
              },
              text: `Error fetching entry: ${error.message || 'Unknown error'}`
            }
          ]
        };
      }
    }
  );
} 