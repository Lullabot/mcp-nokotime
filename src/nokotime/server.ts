import * as dotenv from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerEntryTools } from './tools/entries.js';
import { registerProjectTools } from './tools/projects.js';
import { registerUserTools } from './tools/users.js';
import { NokoApi } from './noko-api.js';
// Re-enable resources with improved error handling
import { registerResources } from './resources/index.js';

// Load environment variables
dotenv.config();

export class NokoServer {
  private server: McpServer;

  constructor(name: string = "noko") {
    const apiToken = process.env.NOKO_API_TOKEN;
    if (!apiToken) {
      console.error("NOKO_API_TOKEN environment variable not set");
      process.exit(1);
    }

    const nokoApi = new NokoApi(apiToken);

    this.server = new McpServer({
      name,
      version: "0.2.0",
      description: "Model Context Protocol server for Noko time tracking API",
      capabilities: {
        tools: true,
        resources: true,
      }
    });

    // Register all tool sets
    registerEntryTools(this.server, nokoApi);
    registerProjectTools(this.server, nokoApi);
    registerUserTools(this.server, nokoApi);

    // TODO: Refactor and re-enable resource registration
    try {
      registerResources(this.server, nokoApi);
    } catch (error) {
      console.error("Failed to register resources, continuing with tools only:", error);
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    handleSignals(this.server);
    await this.server.connect(transport);
  }
}

function handleSignals(server: McpServer): void {
  function handleInterrupt() {
    console.log('\nGracefully shutting down...');
    server.close().then(() => {
      console.log('Server shut down.');
      process.exit(0);
    }).catch(err => {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    });
  }

  process.on('SIGINT', handleInterrupt);
  process.on('SIGTERM', handleInterrupt);
}

export function runServer(): void {
  const server = new NokoServer();
  server.run().catch(error => {
    console.error("Failed to run server:", error);
    process.exit(1);
  });
} 