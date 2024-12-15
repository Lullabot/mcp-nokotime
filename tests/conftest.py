import pytest
from dataclasses import dataclass
from typing import Dict, Any, Optional
from unittest.mock import MagicMock
import asyncio

@dataclass
class Request:
    """Mock MCP request class for testing."""
    path: str
    method: str
    headers: Optional[Dict[str, str]]
    body: Optional[Dict[str, Any]] = None

@dataclass
class Response:
    """Mock MCP response class for testing."""
    status_code: int
    body: Dict[str, Any]
    headers: Optional[Dict[str, str]] = None

@pytest.fixture
def server():
    """Create a NokoServer instance for testing."""
    from nokotime.server import NokoServer
    return NokoServer()

@pytest.fixture
def mock_request():
    """Create a mock MCP request."""
    def _make_request(path: str, method: str = "GET", headers: Optional[Dict[str, str]] = None, body: Optional[Dict[str, Any]] = None) -> Request:
        # Handle headers
        if headers is None:
            headers = {}  # Empty dict for no headers
        elif headers == {}:
            headers = {}  # Keep empty if explicitly empty
        else:
            # Add default auth token if not explicitly set
            headers = dict(headers or {})  # Create a new dict
            if "X-NokoToken" not in headers:
                headers["X-NokoToken"] = "test_token"
        
        return Request(
            path=path,
            method=method,
            headers=headers,
            body=body or {}
        )
    return _make_request

@pytest.fixture
def mock_httpx_response(monkeypatch):
    """Mock httpx response for testing API calls."""
    mock = MagicMock()
    
    async def default_response(*args, **kwargs):
        response = MagicMock()
        response.status_code = 200
        response.headers = {"Content-Type": "application/json"}
        response.json = lambda: {"data": "test_response"}
        return response
    
    mock.side_effect = default_response
    
    # Patch httpx.AsyncClient.request
    import httpx
    monkeypatch.setattr(httpx.AsyncClient, "request", mock)
    return mock

# Configure pytest to use asyncio
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
