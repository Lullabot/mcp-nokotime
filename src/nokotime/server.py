import asyncio
import httpx
from dataclasses import dataclass
from typing import Dict, Any, Optional
from .tools import TOOLS

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

async def main():
    """Run the Noko MCP server."""
    server = NokoServer()
    # TODO: Add MCP server integration
    await asyncio.sleep(0)  # Placeholder

if __name__ == "__main__":
    asyncio.run(main())
