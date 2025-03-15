import * as dotenv from 'dotenv';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { TOOL_PATHS, TOOL_METHODS, registerAllTools } from './tools/index.js';
// Re-enable resources with improved error handling
import { registerResources } from './resources/index.js';

// Load environment variables
dotenv.config();

// Set up error logging to a file for debugging
const errorLogDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(errorLogDir)) {
  fs.mkdirSync(errorLogDir, { recursive: true });
}
const errorLogFile = path.join(errorLogDir, 'error.log');

// Function to write error details to file
function logErrorToFile(message: string, error?: any) {
  try {
    const timestamp = new Date().toISOString();
    let errorDetail = `[${timestamp}] ${message}\n`;
    
    if (error) {
      errorDetail += `Error: ${error.message || 'Unknown error'}\n`;
      if (error.stack) {
        errorDetail += `Stack: ${error.stack}\n`;
      }
    }
    
    fs.appendFileSync(errorLogFile, errorDetail + '\n');
  } catch (e) {
    // Last resort if we can't even log to file
    console.error('Failed to write to error log:', e);
  }
}

// Override global error handlers
process.on('uncaughtException', (err) => {
  logErrorToFile('Uncaught exception:', err);
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logErrorToFile('Unhandled rejection at:', reason);
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// Define text content type for responses
const TEXT = "text" as const;

// Create error response
const createErrorResponse = (message: string) => ({
  content: [{ type: TEXT, text: message }]
});

// Create success response
const createSuccessResponse = (data: any) => {
  let text: string;
  
  if (data) {
    if (typeof data === 'object') {
      text = JSON.stringify(data, null, 2);
    } else {
      text = String(data);
    }
  } else {
    text = "Success (no content)";
  }
  
  return {
    content: [{ type: TEXT, text }]
  };
};

// Create logger for console.error
const consoleLogger = {
  debug: (message: string, ...args: any[]) => {
    console.error(`[DEBUG] ${message}`, ...args.map(arg => {
      // Handle objects by stringifying them with null replacer to avoid circular references
      if (arg && typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return '[Complex Object]';
        }
      }
      return arg;
    }).filter(Boolean));
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args.map(arg => {
      // Handle objects by stringifying them
      if (arg && typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return '[Complex Object]';
        }
      }
      return arg;
    }).filter(Boolean));
  }
};

export class NokoServer {
  private server: McpServer;
  private baseUrl: string;

  constructor(name: string = "noko") {
    try {
      this.baseUrl = "https://api.nokotime.com/v2";
      
      // Initialize MCP server
      this.server = new McpServer({
        name,
        version: "0.1.0",
        description: "Model Context Protocol server for Noko time tracking API"
      });
      
      // Get API token from environment
      const apiToken = process.env.NOKO_API_TOKEN;
      if (!apiToken) {
        console.error("NOKO_API_TOKEN environment variable not set");
        process.exit(1);
      }
      
      // First register tools
      console.error("Registering tools...");
      registerAllTools(this.server, this._handleToolCall.bind(this));
      console.error("Tools registered successfully");
      
      // Then carefully try to register resources
      try {
        console.error("Registering resources...");
        registerResources(this.server, apiToken, consoleLogger);
        console.error("Resources registered successfully");
      } catch (error) {
        console.error("Failed to register resources, continuing with tools only:", error);
        logErrorToFile("Failed to register resources:", error);
        // Continue with server startup even if resources fail
      }
      
      console.error("Server initialization complete");
    } catch (error) {
      console.error("Error initializing server:", error);
      logErrorToFile("Error initializing server:", error);
      throw error;
    }
  }

  private async _handleToolCall(name: string, args: Record<string, any>) {
    try {
      console.error(`Tool call received - name: ${name}`);
      
      // Get API token from environment
      const apiToken = process.env.NOKO_API_TOKEN;
      if (!apiToken) {
        console.error("NOKO_API_TOKEN not found in environment");
        return createErrorResponse("Error: NOKO_API_TOKEN environment variable not set");
      }

      // Get the Noko API path and method
      if (!(name in TOOL_PATHS)) {
        return createErrorResponse(`Error: Tool ${name} not found`);
      }
          
      // Need to assert type here to satisfy TypeScript
      const nokoPath = TOOL_PATHS[name as keyof typeof TOOL_PATHS];
      const method = TOOL_METHODS[name as keyof typeof TOOL_METHODS];
      
      // Convert tool arguments to API parameters
      let params: Record<string, any> | null = null;
      let jsonData: Record<string, any> | null = null;
      
      if (method === "GET") {
        params = {};
        // Only add non-empty parameters
        for (const [key, value] of Object.entries(args)) {
          // Skip 'all' state values as they mean no filter
          if (key === 'state' && value === 'all') {
            continue;
          }
          
          if (value !== null && value !== undefined) {
            // Handle array parameters
            if (Array.isArray(value)) {
              // Noko expects array parameters in the format key[]=value
              const arrayKey = `${key}[]`;
              if (!(arrayKey in params)) {
                params[arrayKey] = [];
              }
              
              for (const item of value) {
                params[arrayKey].push(String(item));
              }
            } else {
              params[key] = value;
            }
          }
        }
      } else {
        jsonData = args || {};
      }
      
      // Make direct API call to Noko
      const headers = {
        "X-NokoToken": apiToken,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "NokoMCP/0.1.0"
      };
      
      console.error(`Making Noko API request: ${method} ${this.baseUrl}${nokoPath}`);
      
      const nokoResponse = await axios({
        method: method.toLowerCase(),
        url: `${this.baseUrl}${nokoPath}`,
        headers,
        params,
        data: jsonData,
      });
      
      console.error(`Noko API Response: ${nokoResponse.status}`);
      
      return createSuccessResponse(nokoResponse.data);
    } catch (error: any) {
      console.error("Error handling tool call", error.message);
      logErrorToFile("Error handling tool call:", error);
      
      // Handle Axios errors specifically
      if (error.response) {
        const errorMsg = `API Error ${error.response.status}`;
        let detailedMsg = errorMsg;
        
        if (error.response.data) {
          try {
            if (typeof error.response.data === 'object' && error.response.data.error) {
              detailedMsg = `${errorMsg}: ${error.response.data.error}`;
            } else {
              detailedMsg = `${errorMsg}: ${JSON.stringify(error.response.data)}`;
            }
          } catch {
            detailedMsg = `${errorMsg}: ${String(error.response.data)}`;
          }
        }
        
        console.error(detailedMsg);
        return createErrorResponse(detailedMsg);
      }
      
      return createErrorResponse(`Error: ${error.message || String(error)}`);
    }
  }

  async run(): Promise<void> {
    try {
      console.error("Starting server with StdioServerTransport");
      const transport = new StdioServerTransport();
      
      console.error("Connecting transport to server");
      await this.server.connect(transport);
      
      console.error("Server running successfully");
    } catch (error) {
      console.error("Error running server:", error);
      logErrorToFile("Error running server:", error);
      throw error;
    }
  }
}

// Signal handling for graceful shutdown
function handleSignals(): void {
  function handleInterrupt() {
    console.error("\nShutting down gracefully...");
    process.exit(0);
  }

  process.on('SIGINT', handleInterrupt);
  process.on('SIGTERM', handleInterrupt);
}

export function runServer(): void {
  try {
    console.error("Starting server...");
    handleSignals();
    const server = new NokoServer();
    server.run().catch(err => {
      console.error('Error running server:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
} 