import asyncio
import httpx
import mcp.types as types
from mcp.server import Server, NotificationOptions
from mcp.server.stdio import stdio_server
from mcp.server.models import InitializationOptions
from .tools import TOOLS

class NokoServer:
    def __init__(self, name: str = "noko"):
        self.app = Server(name)
        self.base_url = "https://api.nokotime.com/v2"
        self.tool_paths = {
            "list-entries": "/entries",
            "create-entry": "/entries",
            "list-projects": "/projects",
            "list-users": "/users",
        }
        self.tool_methods = {
            "list-entries": "GET",
            "create-entry": "POST",
            "list-projects": "GET",
            "list-users": "GET",
        }

        @self.app.list_tools()
        async def handle_list_tools() -> list[types.Tool]:
            """List available tools."""
            return TOOLS

        @self.app.call_tool()
        async def handle_call_tool(name: str, arguments: dict | None) -> list[types.TextContent]:
            """Handle tool execution requests."""
            if name not in self.tool_paths:
                raise ValueError(f"Tool {name} not found")

            # Get API token from environment
            api_token = self.app.request_context.session.get_env().get("NOKO_API_TOKEN")
            if not api_token:
                raise ValueError("Missing NOKO_API_TOKEN environment variable")

            # Map tool call to Noko API request
            noko_path = self.tool_paths[name]
            method = self.tool_methods[name]
            
            # Convert tool arguments to API parameters
            params = None
            json_data = None
            if method == "GET":
                params = arguments or {}
            else:
                json_data = arguments or {}
            
            try:
                async with httpx.AsyncClient() as client:
                    # Forward the request to Noko API
                    noko_response = await client.request(
                        method=method,
                        url=f"{self.base_url}{noko_path}",
                        headers={"X-NokoToken": api_token},
                        params=params,
                        json=json_data,
                    )
                    
                    # Return the response from Noko
                    return [types.TextContent(
                        type="text",
                        text=noko_response.text
                    )]
                    
            except Exception as e:
                raise ValueError(f"Noko API error: {str(e)}")

    async def run(self):
        """Run the Noko MCP server."""
        async with stdio_server() as (read_stream, write_stream):
            await self.app.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name="noko",
                    server_version="0.1.0",
                    capabilities=self.app.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={},
                    ),
                ),
            )

async def main():
    """Run the Noko MCP server."""
    server = NokoServer()
    await server.run()

if __name__ == "__main__":
    asyncio.run(main())
