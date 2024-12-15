from mcp import Server, Request, Response
import httpx
from .tools import TOOLS

class NokoServer(Server):
    def __init__(self):
        super().__init__()
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
            return Response(status=200, body={"tools": TOOLS})
            
        if request.path.startswith("/tools/call/"):
            tool_name = request.path.split("/")[-1]
            if tool_name not in self.tool_paths:
                return Response(status=404, body={"error": f"Tool {tool_name} not found"})
                
            if "X-NokoToken" not in request.headers:
                return Response(status=401, body={"error": "Missing X-NokoToken header"})
            
            async with httpx.AsyncClient() as client:
                try:
                    # Map tool call to Noko API request
                    noko_path = self.tool_paths[tool_name]
                    method = self.tool_methods[tool_name]
                    
                    # Convert tool arguments to API parameters
                    params = None
                    json_data = None
                    if method == "GET":
                        params = request.body.get("arguments", {})
                    else:
                        json_data = request.body.get("arguments", {})
                    
                    # Forward the request to Noko API
                    noko_response = await client.request(
                        method=method,
                        url=f"{self.base_url}{noko_path}",
                        headers=request.headers,
                        params=params,
                        json=json_data,
                    )
                    
                    # Return the response from Noko
                    return Response(
                        status=noko_response.status_code,
                        body=noko_response.json(),
                        headers=dict(noko_response.headers)
                    )
                    
                except Exception as e:
                    return Response(
                        status=500,
                        body={"error": str(e)}
                    )
        
        return Response(status=404, body={"error": "Not found"})

async def run_server():
    """Run the Noko MCP server."""
    server = NokoServer()
    await server.serve()

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_server())
