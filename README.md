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

1. Ensure you have Python 3.13+ installed
2. Clone this repository:
```bash
git clone https://github.com/yourusername/mcp-nokotime.git
cd mcp-nokotime
```

3. Create and activate a virtual environment:
```bash
python3.13 -m venv .venv
source .venv/bin/activate  # On Unix/macOS
# or
.venv\Scripts\activate  # On Windows
```

4. Install the package with development dependencies:
```bash
pip install -e ".[test]"
```

5. Test the server connection:
```bash
./test_connection.py
```

## Configuration

The server requires a Noko API token for authentication. This should be provided by the Claude Desktop configuration.

### Claude Desktop Setup

1. Open Claude Desktop settings
2. If you already have a Noko configuration:
   - Update the existing configuration to use the new server command
   - Keep your existing API token and other settings
   - Only change the `command` field to point to the virtual environment

3. Example configuration (adjust paths as needed):
```json
{
  "servers": [
    {
      "name": "Noko Time Tracking",
      "description": "Track time entries using Noko API v2",
      "command": ".venv/bin/python -m nokotime.server",
      "capabilities": {
        "tools": true
      },
      "headers": {
        "X-NokoToken": "your_existing_token"
      }
    }
  ]
}
```

**Note:** Keep your existing `X-NokoToken` value; don't replace it with the example value shown above.

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
