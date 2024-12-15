import pytest
import os
from nokotime.server import NokoServer
from nokotime.tools import TOOLS
import mcp.types as types

@pytest.fixture
def server():
    return NokoServer()

def test_server_initialization(server):
    """Test server initialization."""
    assert server.name == "noko"
    assert server.base_url == "https://api.nokotime.com/v2"
    assert len(server.tool_paths) == len(TOOLS)
    assert len(server.tool_methods) == len(TOOLS)

@pytest.mark.asyncio
async def test_handle_request_list_tools(server):
    """Test handling /tools/list request."""
    request = server.Request(path="/tools/list")
    response = await server.handle_request(request)
    assert response.status_code == 200
    assert response.body["tools"] == TOOLS

@pytest.mark.asyncio
async def test_handle_request_tool_not_found(server):
    """Test handling request for non-existent tool."""
    request = server.Request(path="/tools/call/nonexistent")
    response = await server.handle_request(request)
    assert response.status_code == 404
    assert "error" in response.body

@pytest.mark.asyncio
async def test_handle_request_missing_token(server):
    """Test handling request without API token."""
    request = server.Request(path="/tools/call/noko_list_entries")
    response = await server.handle_request(request)
    assert response.status_code == 401
    assert "error" in response.body

@pytest.mark.asyncio
async def test_handle_tool_call_missing_token(server):
    """Test handling tool call without API token."""
    with pytest.raises(ValueError, match="Missing NOKO_API_TOKEN environment variable"):
        await server._handle_tool_call("noko_list_entries", {})

@pytest.mark.asyncio
async def test_handle_tool_call_with_token(server, monkeypatch):
    """Test handling tool call with API token."""
    # Mock environment variable
    monkeypatch.setenv("NOKO_API_TOKEN", "test_token")
    
    # Mock httpx client
    class MockResponse:
        status_code = 200
        def json(self):
            return {"entries": []}
    
    class MockClient:
        async def request(self, *args, **kwargs):
            return MockResponse()
        
        async def __aenter__(self):
            return self
            
        async def __aexit__(self, *args):
            pass
    
    monkeypatch.setattr("httpx.AsyncClient", MockClient)
    
    result = await server._handle_tool_call("noko_list_entries", {})
    assert isinstance(result, list)
    assert all(isinstance(content, types.TextContent) for content in result)

def test_tool_registration(server):
    """Test that tools are properly registered."""
    # Check that each tool from TOOLS is registered
    for tool in TOOLS:
        tool_name = tool["name"]
        assert tool_name in server.tool_paths
        assert tool_name in server.tool_methods
