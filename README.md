# MCP Noko Server

A Model Context Protocol (MCP) server for integrating Noko time tracking with Claude Desktop.

## Features

- Full Noko API v2 integration
- Secure authentication handling
- Time entry management
- Project and user listing
- Error handling and validation
- Async/await support

## Installation

1. Ensure you have Python 3.9+ installed
2. Clone this repository:
```bash
git clone https://github.com/yourusername/mcp-nokotime.git
cd mcp-nokotime
```

3. Install `uv` if you haven't already:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

4. Create and activate a virtual environment:
```bash
uv venv
source .venv/bin/activate  # On Unix/macOS
# or
.venv\Scripts\activate  # On Windows
```

5. Install the package in development mode:
```bash
uv pip install -e .
```

6. Test the server:
```bash
python -m nokotime.server
```

### Claude Desktop Setup

1. Open Claude Desktop settings at:
   - MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add or update the Noko server configuration:
```json
{
  "mcpServers": {
    "noko": {
      "command": "/Users/sirkitree/repos/mcp-nokotime/.venv/bin/python3",
      "args": [
        "-m",
        "nokotime.server"
      ],
      "env": {
        "NOKO_API_TOKEN": "your_existing_token",
        "PYTHONPATH": "/Users/sirkitree/repos/mcp-nokotime"
      }
    }
  }
}
```

**Important Notes:**
- The `command` should point to Python in your virtual environment (shown above is an example path)
- Keep your existing `NOKO_API_TOKEN` value; don't replace it with the example value shown above
- Make sure you've completed all installation steps before starting Claude Desktop
- Restart Claude Desktop after making configuration changes
- If you get connection errors, check Claude Desktop logs at `~/Library/Logs/Claude/mcp*.log`

## Available Tools

### 1. List Time Entries
Lists time entries with optional filters.

**Example:**
```json
{
  "from": "2023-12-01",
  "to": "2023-12-31",
  "user_ids": [123],
  "project_ids": [456]
}
```

### 2. Create Time Entry
Creates a new time entry.

**Example:**
```json
{
  "date": "2023-12-14",
  "minutes": 60,
  "description": "Working on project documentation",
  "project_id": 123
}
```

### 3. List Projects
Lists all available projects.

**Example:**
```json
{
  "state": "active"  // Options: "active", "archived", "all"
}
```

### 4. List Users
Lists all users.

**Example:**
```json
{
  "state": "active"  // Options: "active", "suspended", "all"
}
```

## Development

### Running Tests

Run the test suite with:
```bash
pytest
```

For test coverage report:
```bash
pytest --cov=nokotime
```

### Project Structure

- `src/nokotime/server.py`: Main server implementation
- `src/nokotime/tools.py`: Tool definitions and schemas
- `tests/`: Test suite
  - `conftest.py`: Test fixtures and configuration
  - `test_server.py`: Server tests
  - `test_tools.py`: Tool schema tests

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure your Noko API token is valid
   - Check that the token is correctly set in Claude Desktop configuration
   - Verify the `X-NokoToken` header is being sent with requests

2. **Connection Issues**
   - Check your internet connection
   - Verify the Noko API is accessible
   - Check for any firewall restrictions

3. **Tool Errors**
   - Ensure request parameters match the tool schemas
   - Check date formats are YYYY-MM-DD
   - Verify project and user IDs exist in your Noko account

4. **Virtual Environment Issues**
   - Make sure the virtual environment is activated when installing packages
   - Verify the path to Python in the Claude Desktop configuration matches your virtual environment
   - On Windows, use backslashes in paths: `.venv\Scripts\python`

### Debug Mode

To enable debug logging, set the environment variable:
```bash
export MCP_DEBUG=1
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details
