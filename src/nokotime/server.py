import asyncio
import signal
import sys
import httpx
import logging
import os
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
            "noko_list_entries": "/entries",
            "noko_create_entry": "/entries",
            "noko_list_projects": "/projects",
            "noko_list_users": "/users",
        }
        self.tool_methods = {
            "noko_list_entries": "GET",
            "noko_create_entry": "POST",
            "noko_list_projects": "GET",
            "noko_list_users": "GET",
        }
        # Initialize MCP server
        self.mcp_server = Server(name)
        self._register_tools()

    def _register_tools(self):
        """Register tools with the MCP server."""
        # First register the list_tools handler
        @self.mcp_server.list_tools()
        async def handle_list_tools() -> List[types.Tool]:
            """Convert our tools to MCP format."""
            mcp_tools = []
            for tool in TOOLS:
                try:
                    mcp_tool = types.Tool(
                        name=tool["name"],
                        description=tool["description"],
                        inputSchema=tool["inputSchema"]
                    )
                    mcp_tools.append(mcp_tool)
                    logger.debug("Created tool: %s", mcp_tool)
                except Exception as e:
                    logger.error("Failed to create tool %s: %s", tool["name"], e, exc_info=True)
            return mcp_tools

        # Then register the call_tool handler
        @self.mcp_server.call_tool()
        async def handle_call_tool(name: str, arguments: dict | None) -> List[types.TextContent]:
            """Handle tool calls through MCP."""
            return await self._handle_tool_call(name, arguments)

    async def _handle_tool_call(self, name: str, arguments: dict | None) -> List[types.TextContent]:
        """Handle tool calls through MCP."""
        logger.debug("Tool call received - name: %s, arguments: %s", name, arguments)
        
        # Get API token from environment
        api_token = os.environ.get("NOKO_API_TOKEN")
        if not api_token:
            logger.error("NOKO_API_TOKEN not found in environment")
            return [types.TextContent(
                type="text",
                text="Error: NOKO_API_TOKEN environment variable not set"
            )]

        try:
            # Get the Noko API path and method
            if name not in self.tool_paths:
                return [types.TextContent(
                    type="text",
                    text=f"Error: Tool {name} not found"
                )]
                
            noko_path = self.tool_paths[name]
            method = self.tool_methods[name]
            
            # Convert tool arguments to API parameters
            params = None
            json_data = None
            if method == "GET":
                params = {}
                # Only add non-empty parameters
                if arguments:
                    for key, value in arguments.items():
                        # Skip 'all' state values as they mean no filter
                        if key == 'state' and value == 'all':
                            continue
                        if value is not None:
                            # Handle array parameters
                            if isinstance(value, list):
                                # Noko expects array parameters in the format key[]=value
                                for item in value:
                                    array_key = f"{key}[]"
                                    if array_key not in params:
                                        params[array_key] = []
                                    params[array_key].append(str(item))
                            else:
                                params[key] = value
            else:
                json_data = arguments if arguments else {}
            
            # Make direct API call to Noko
            async with httpx.AsyncClient() as client:
                headers = {
                    "X-NokoToken": api_token,  # Noko expects token in X-NokoToken header
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "NokoMCP/0.1.0"
                }
                
                # Log request details for debugging
                logger.debug(f"Making Noko API request: {method} {self.base_url}{noko_path}")
                logger.debug(f"Headers: {headers}")
                logger.debug(f"Params: {params}")
                logger.debug(f"JSON data: {json_data}")
                
                noko_response = await client.request(
                    method=method,
                    url=f"{self.base_url}{noko_path}",
                    headers=headers,
                    params=params,
                    json=json_data,
                )
                
                logger.debug(f"Noko API Response: {noko_response.status_code} - {noko_response.text}")
                
                # Handle errors
                if noko_response.status_code >= 400:
                    error_msg = f"API Error {noko_response.status_code}"
                    if noko_response.text:
                        try:
                            error_data = noko_response.json()
                            error_msg = f"{error_msg}: {error_data.get('error', 'Unknown error')}"
                        except:
                            error_msg = f"{error_msg}: {noko_response.text}"
                            
                    logger.error(error_msg)
                    return [types.TextContent(
                        type="text",
                        text=error_msg
                    )]

                # Format the response nicely for Claude
                if noko_response.text:
                    try:
                        response_data = noko_response.json()
                        if isinstance(response_data, dict):
                            text = "\n".join(
                                f"{key}: {value}" 
                                for key, value in response_data.items()
                            )
                        else:
                            text = str(response_data)
                    except:
                        text = noko_response.text
                else:
                    text = "Success (no content)"

                return [types.TextContent(
                    type="text",
                    text=text
                )]
            
        except Exception as e:
            logger.error("Error handling tool call", exc_info=True)
            return [types.TextContent(
                type="text",
                text=f"Error: {str(e)}"
            )]

    async def handle_request(self, request: Request) -> Response:
        """Handle incoming MCP requests."""
        if request.path == "/tools/list":
            return Response(status_code=200, body={"tools": TOOLS})
            
        return Response(status_code=404, body={"error": "Not found"})

    async def run(self):
        """Run the Noko MCP server."""
        async with stdio_server() as (read_stream, write_stream):
            # Create server capabilities
            capabilities = types.ServerCapabilities(
                tools=types.ToolsCapability(enabled=True),  # Enable tool support
                notifications=types.NotificationParams(),
                experimental={}
            )
            
            await self.mcp_server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name=self.name,
                    server_version="0.1.0",
                    capabilities=capabilities,
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
