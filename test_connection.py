#!/usr/bin/env python3
import asyncio
from nokotime.server import NokoServer

async def test_connection():
    """Test the MCP server connection and list available tools."""
    server = NokoServer()
    
    # Create a test request to list tools
    class TestRequest:
        path = "/tools/list"
        method = "GET"
        headers = {}
        body = None
    
    try:
        response = await server.handle_request(TestRequest())
        if response.status_code == 200:
            print("✓ Server is running")
            print("\nAvailable tools:")
            for tool in response.body["tools"]:
                print(f"- {tool['name']}: {tool['description']}")
        else:
            print("✗ Server error:", response.body.get("error", "Unknown error"))
    except Exception as e:
        print("✗ Connection error:", str(e))

if __name__ == "__main__":
    asyncio.run(test_connection()) 