import * as dotenv from 'dotenv';
import axios from 'axios';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { TOOL_PATHS, TOOL_METHODS, registerAllTools } from './tools/index.js';
import { registerResources } from './resources/index.js';

// Load environment variables
dotenv.config();

// Set up logging
const logger = {
  debug: (...args: any[]) => console.debug(...args),
  error: (...args: any[]) => console.error(...args),
};

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

export class NokoServer {
  private server: McpServer;
  private baseUrl: string;

  constructor(name: string = "noko") {
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
    
    // Register resources
    registerResources(this.server, apiToken, {
      debug: (...args: any[]) => console.debug(...args),
      error: (...args: any[]) => console.error(...args)
    });
    
    // Register tools from separate modules
    registerAllTools(this.server, this._handleToolCall.bind(this));
  }

  private async _handleToolCall(name: string, args: Record<string, any>) {
    logger.debug(`Tool call received - name: ${name}, arguments:`, args);
    
    // Get API token from environment
    const apiToken = process.env.NOKO_API_TOKEN;
    if (!apiToken) {
      logger.error("NOKO_API_TOKEN not found in environment");
      return createErrorResponse("Error: NOKO_API_TOKEN environment variable not set");
    }

    try {
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
        "X-NokoToken": apiToken, // Noko expects token in X-NokoToken header
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "NokoMCP/0.1.0"
      };
      
      // Log request details for debugging
      logger.debug(`Making Noko API request: ${method} ${this.baseUrl}${nokoPath}`);
      logger.debug(`Headers: ${JSON.stringify(headers)}`);
      logger.debug(`Params: ${JSON.stringify(params)}`);
      logger.debug(`JSON data: ${JSON.stringify(jsonData)}`);
      
      const nokoResponse = await axios({
        method: method.toLowerCase(),
        url: `${this.baseUrl}${nokoPath}`,
        headers,
        params,
        data: jsonData,
      });
      
      logger.debug(`Noko API Response: ${nokoResponse.status} - ${JSON.stringify(nokoResponse.data)}`);
      
      return createSuccessResponse(nokoResponse.data);
    } catch (error: any) {
      logger.error("Error handling tool call", error);
      
      // Handle Axios errors specifically
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
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
        
        logger.error(detailedMsg);
        return createErrorResponse(detailedMsg);
      }
      
      return createErrorResponse(`Error: ${error.message || String(error)}`);
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
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
  handleSignals();
  const server = new NokoServer();
  server.run().catch(err => {
    console.error('Error running server:', err);
    process.exit(1);
  });
} 