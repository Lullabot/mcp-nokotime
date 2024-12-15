import asyncio
import signal
import sys
import httpx
import logging
import mcp.types as types
from dataclasses import dataclass
from typing import Dict, Any, Optional, List
from mcp.server import Server, NotificationOptions
from mcp.server.stdio import stdio_server
from mcp.server.models import InitializationOptions
from .tools import TOOLS

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger("noko-server")

@dataclass
class Request:
    """Request class for testing."""
    path: str
    method: str = "GET"
    headers: Optional[Dict[str, str]] = None
    body: Optional[Dict[str, Any]] = None

@dataclass
class Response:
    """Response class for testing."""
    status_code: int
    body: Dict[str, Any]
    headers: Optional[Dict[str, str]] = None

class NokoServer:
    def __init__(self, name: str = "noko"):
        self.name = name
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
        # Initialize MCP server
        self.mcp_server = Server(name)
        self._setup_mcp_handlers()

    def _setup_mcp_handlers(self):
        """Set up MCP server handlers."""
        @self.mcp_server.list_tools()
        async def handle_list_tools() -> List[types.Tool]:
            """Convert our tools to MCP format."""
            return [
                types.Tool(
                    name=tool["name"],
                    description=tool["description"],
                    inputSchema=tool["inputSchema"]
                )
                for tool in TOOLS
            ]

        @self.mcp_server.call_tool()
        async def handle_call_tool(name: str, arguments: dict | None) -> List[types.TextContent]:
            """Handle tool calls through MCP."""
            # Get API token from environment
            request_context = self.mcp_server.request_context
            if not request_context or not request_context.session:
                raise ValueError("No request context available")

            # Get environment variables from the session
            session = request_context.session
            api_token = None

            # Access environment variables through the session's environment property
            try:
                api_token = session.environment.get("NOKO_API_TOKEN")
                logger.debug("Environment variables: %s", session.environment)
            except Exception as e:
                logger.error("Error accessing environment: %s", e)
                raise ValueError("Could not access environment variables") from e

            if not api_token:
                logger.error("NOKO_API_TOKEN not found in environment")
                raise ValueError("Missing NOKO_API_TOKEN environment variable")

            # Create a test-style request
            request = Request(
                path=f"/tools/call/{name}",
                headers={"X-NokoToken": api_token},
                body={"arguments": arguments} if arguments else None
            )

            # Use our existing handler
            response = await self.handle_request(request)

            # Convert response to MCP format
            if response.status_code >= 400:
                raise ValueError(response.body.get("error", "Unknown error"))

            # Format the response nicely for Claude
            if isinstance(response.body, dict):
                text = "\n".join(
                    f"{key}: {value}" 
                    for key, value in response.body.items()
                )
            else:
                text = str(response.body)

            return [types.TextContent(
                type="text",
                text=text
            )]

    async def handle_request(self, request: Request) -> Response:
        """Handle incoming MCP requests and proxy them to Noko API."""
        if request.path == "/tools/list":
            return Response(status_code=200, body={"tools": TOOLS})
            
        if request.path.startswith("/tools/call/"):
            tool_name = request.path.split("/")[-1]
            if tool_name not in self.tool_paths:
                return Response(
                    status_code=404,
                    body={"error": f"Tool {tool_name} not found"}
                )
                
            # Check auth before making API call
            if not request.headers or "X-NokoToken" not in request.headers:
                return Response(
                    status_code=401,
                    body={"error": "Missing X-NokoToken header"}
                )
            
            # Map tool call to Noko API request
            noko_path = self.tool_paths[tool_name]
            method = self.tool_methods[tool_name]
            
            # Convert tool arguments to API parameters
            params = None
            json_data = None
            if method == "GET":
                params = request.body.get("arguments", {}) if request.body else {}
            else:
                json_data = request.body.get("arguments", {}) if request.body else {}
            
            try:
                async with httpx.AsyncClient() as client:
                    # Forward the request to Noko API
                    noko_response = await client.request(
                        method=method,
                        url=f"{self.base_url}{noko_path}",
                        headers={"X-NokoToken": request.headers["X-NokoToken"]},
                        params=params,
                        json=json_data,
                    )
                    
                    # Return the response from Noko
                    return Response(
                        status_code=noko_response.status_code,
                        body=noko_response.json(),
                        headers=dict(noko_response.headers)
                    )
                    
            except Exception as e:
                return Response(
                    status_code=500,
                    body={"error": str(e)}
                )
        
        return Response(status_code=404, body={"error": "Not found"})

    async def run(self):
        """Run the Noko MCP server."""
        async with stdio_server() as (read_stream, write_stream):
            await self.mcp_server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name=self.name,
                    server_version="0.1.0",
                    capabilities=self.mcp_server.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={},
                    ),
                ),
            )

def handle_signals():
    """Set up signal handlers for graceful shutdown."""
    def handle_interrupt(signum, frame):
        print("\nShutting down gracefully...", file=sys.stderr)
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_interrupt)
    signal.signal(signal.SIGTERM, handle_interrupt)

def run_server():
    """Run the server with proper signal handling."""
    handle_signals()
    server = NokoServer()
    asyncio.run(server.run())

if __name__ == "__main__":
    run_server()
