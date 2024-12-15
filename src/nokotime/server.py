from mcp import Server, Request, Response
import httpx

class NokoServer(Server):
    def __init__(self):
        super().__init__()
        self.base_url = "https://api.nokotime.com/v2"

    async def handle_request(self, request: Request) -> Response:
        """Handle incoming MCP requests and proxy them to Noko API."""
        client = httpx.AsyncClient()
        
        try:
            # Get token from request headers
            if "X-NokoToken" not in request.headers:
                return Response(
                    status=401,
                    body={"error": "Missing X-NokoToken header"}
                )
            
            # Forward the request to Noko API
            noko_response = await client.request(
                method=request.method,
                url=f"{self.base_url}{request.path}",
                headers=request.headers,
                json=request.body if request.body else None,
                params=request.query_params if request.query_params else None,
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
        finally:
            await client.aclose()

async def run_server():
    """Run the Noko MCP server."""
    server = NokoServer()
    await server.serve()

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_server())
