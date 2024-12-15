import pytest
from nokotime.tools import TOOLS
from unittest.mock import MagicMock

@pytest.mark.asyncio
async def test_list_tools(server, mock_request):
    """Test the /tools/list endpoint."""
    request = mock_request("/tools/list")
    response = await server.handle_request(request)
    
    assert response.status_code == 200
    assert response.body == {"tools": TOOLS}

@pytest.mark.asyncio
async def test_missing_auth_token(server, mock_request):
    """Test request without authentication token."""
    request = mock_request(
        "/tools/call/list-entries",
        headers=None  # No headers at all
    )
    response = await server.handle_request(request)
    
    assert response.status_code == 401
    assert "Missing X-NokoToken header" in response.body["error"]

@pytest.mark.asyncio
async def test_invalid_tool(server, mock_request):
    """Test request for non-existent tool."""
    request = mock_request("/tools/call/invalid-tool")
    response = await server.handle_request(request)
    
    assert response.status_code == 404
    assert "Tool invalid-tool not found" in response.body["error"]

@pytest.mark.asyncio
async def test_list_entries(server, mock_request, mock_httpx_response):
    """Test list-entries tool."""
    mock_data = {
        "entries": [
            {"id": 1, "minutes": 60, "description": "Test entry"}
        ]
    }
    
    async def custom_response(*args, **kwargs):
        mock = MagicMock()
        mock.status_code = 200
        mock.headers = {"Content-Type": "application/json"}
        mock.json = lambda: mock_data
        return mock
    
    mock_httpx_response.side_effect = custom_response
    
    request = mock_request(
        "/tools/call/list-entries",
        headers={"X-NokoToken": "test_token"},
        body={"arguments": {"from": "2023-12-01", "to": "2023-12-31"}}
    )
    response = await server.handle_request(request)
    
    assert response.status_code == 200
    assert response.body == mock_data

@pytest.mark.asyncio
async def test_create_entry(server, mock_request, mock_httpx_response):
    """Test create-entry tool."""
    entry_data = {
        "date": "2023-12-14",
        "minutes": 60,
        "description": "Test entry",
        "project_id": 123
    }
    mock_data = {"entry": entry_data}
    
    async def custom_response(*args, **kwargs):
        mock = MagicMock()
        mock.status_code = 201
        mock.headers = {"Content-Type": "application/json"}
        mock.json = lambda: mock_data
        return mock
    
    mock_httpx_response.side_effect = custom_response
    
    request = mock_request(
        "/tools/call/create-entry",
        method="POST",
        headers={"X-NokoToken": "test_token"},
        body={"arguments": entry_data}
    )
    response = await server.handle_request(request)
    
    assert response.status_code == 201
    assert response.body == mock_data

@pytest.mark.asyncio
async def test_api_error_handling(server, mock_request, mock_httpx_response):
    """Test error handling for API failures."""
    async def raise_error(*args, **kwargs):
        raise Exception("API connection failed")
    
    mock_httpx_response.side_effect = raise_error
    
    request = mock_request(
        "/tools/call/list-entries",
        headers={"X-NokoToken": "test_token"}
    )
    response = await server.handle_request(request)
    
    assert response.status_code == 500
    assert "API connection failed" in response.body["error"]
