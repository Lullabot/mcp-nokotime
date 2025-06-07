# Noko MCP Server

A Model Context Protocol (MCP) server for interacting with the [Noko](https://nokotime.com/) time tracking API.

## Features

This MCP server allows Claude and other AI assistants to:

- List time entries with filtering options
- Create new time entries
- List projects
- List users

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-nokotime.git
cd mcp-nokotime

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

You can obtain your Noko API token from your Noko account settings. 

An `.env` file will be used when running the server directly via `npm start` or during development. Please put your API token in the .env file.

```
NOKO_API_TOKEN=your_noko_api_token
```



## Claude Desktop Configuration

To use this MCP server with Claude Desktop, add the following configuration to your `claude_desktop_config.json` (located at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "noko": {
      "command": "node",
      "args": [
        "/path/to/mcp-nokotime"
      ],
      "env": {
        "NOKO_API_TOKEN": "your_noko_api_token"
      }
    }
  }
}
```

**Note about environment variables**: While the project uses a `.env` file for direct server execution, Claude Desktop requires the environment variables to be specified in the `claude_desktop_config.json` file as shown above. The `.env` file is not automatically read when Claude Desktop launches the server.

Make sure to:
1. Replace `/path/to/mcp-nokotime` with the actual path where you cloned the repository
2. Replace `your_noko_api_token` with your actual Noko API token from your Noko account settings (same token as in your `.env` file)
3. Ensure you have Node.js installed on your system (verify by running `node --version` in your terminal)
4. Restart Claude Desktop after making these changes

The server includes built-in safety features like requiring confirmation for destructive operations (edit/delete), so you don't need to worry about accidental modifications to your time entries.

## Usage

### Running the Server

```bash
npm start
```

### Development

```bash
npm run dev
```

## Available Tools

The server provides the following tools to AI assistants:

1. `noko_list_entries` - List time entries with optional filters and pagination
   - Optional parameters:
     - `user_ids` - Comma-separated list of user IDs to filter by (e.g., '1,2,3')
     - `project_ids` - Comma-separated list of project IDs to filter by (e.g., '4,5,6')
     - `description` - Filter entries containing this text in their description
     - `tag_ids` - Comma-separated list of tag IDs to filter by (e.g., '7,8,9')
     - `tag_filter_type` - How to filter by tags: 'and' (default) or 'combination of'
     - `invoice_ids` - Comma-separated list of invoice IDs to filter by
     - `import_ids` - Comma-separated list of import IDs to filter by
     - `from` - Only include entries from or after this date (YYYY-MM-DD)
     - `to` - Only include entries on or before this date (YYYY-MM-DD)
     - `invoiced` - Filter by invoice status: true for invoiced entries, false for uninvoiced entries
     - `invoiced_at_from`/`invoiced_at_to` - Filter by invoice date range (YYYY-MM-DD)
     - `updated_from`/`updated_to` - Filter by update timestamp range (YYYY-MM-DDTHH:MM:SSZ)
     - `billable` - Filter by billable status: true for billable entries, false for unbillable entries
     - `approved_at_from`/`approved_at_to` - Filter by approval date range (YYYY-MM-DD)
     - `approved_by_ids` - Comma-separated list of user IDs who approved entries
     - `per_page` - Number of results per page (1-1000, default: 30)
     - `page` - Page number (starts at 1)
   - Returns:
     - Array of entry objects when no pagination is needed
     - Object with `data` (array of entries) and `pagination` properties when pagination is present
     - Pagination includes links to `first`, `last`, `next`, and `prev` pages when available

2. `noko_create_entry` - Create a new time entry
   - Required parameters: `date`, `minutes`, `description`
   - Optional parameters: `project_id`, `user_id`, `billable`, `tags`, `invoice_id`

3. `noko_edit_entry` - Edit an existing time entry
   - Required parameters: 
     - `id` - ID of the entry to edit
     - `confirm` - Must be set to true to confirm the edit operation
   - Optional parameters:
     - `date` - Date of the entry in YYYY-MM-DD format
     - `minutes` - Duration of the entry in minutes
     - `description` - Description of the work performed
     - `project_id` - ID of the project this entry belongs to
     - `user_id` - ID of the user this entry belongs to
     - `billable` - Whether this entry is billable
     - `tags` - Array of tags to associate with this entry
     - `invoice_id` - ID of an invoice to associate with this entry

4. `noko_delete_entry` - Delete a time entry permanently
   - Required parameters:
     - `id` - ID of the entry to delete
     - `confirm` - Must be set to true to confirm the delete operation
   - Note: Entries cannot be deleted if they have been invoiced, are associated with an archived project, or are approved and locked

5. `noko_list_projects` - List all available projects with optional filtering and pagination
   - Optional parameters:
     - `name` - Filter projects by name (partial matching)
     - `project_group_ids` - Comma-separated list of project group IDs to filter by (e.g., '1,2,3')
     - `billing_increment` - Filter by billing increment in minutes: "1", "5", "6", "10", "15", "20", "30", "60" (default: "15")
     - `enabled` - Filter by project status: true for enabled projects, false for archived projects
     - `billable` - Filter by billing status: true for billable projects, false for unbillable projects
     - `per_page` - Number of results per page (1-1000, default: 30)
     - `page` - Page number (starts at 1)
   - Returns:
     - Array of project objects when no pagination is needed
     - Object with `data` (array of projects) and `pagination` properties when pagination is present
     - Pagination includes links to `first`, `last`, `next`, and `prev` pages when available

6. `noko_list_users` - List all users with optional filtering and pagination
   - Optional parameters:
     - `name` - Filter users by name (partial matching)
     - `email` - Filter users by email (partial matching)
     - `state` - Filter by account state: "disabled", "pending", "active", "suspended", or "all" (default: all)
     - `role` - Filter by role: "supervisor", "leader", "coworker", or "contractor"
     - `per_page` - Number of results per page (1-1000, default: 30)
     - `page` - Page number (starts at 1)
   - Returns:
     - Array of user objects when no pagination is needed
     - Object with `data` (array of users) and `pagination` properties when pagination is present
     - Pagination includes links to `first`, `last`, `next`, and `prev` pages when available

## Convenience Tools for Common Date Ranges

The server also provides convenience tools for frequently used date ranges:

7. `noko_get_project_entries_past_week` - Get time entries for a project from the past 7 days
   - Required parameters:
     - `project_id` - ID of the project
   - Optional parameters:
     - `per_page` - Number of results per page (1-1000, default: 30)
     - `page` - Page number (starts at 1)

8. `noko_get_project_entries_past_month` - Get time entries for a project from the past 30 days
   - Required parameters:
     - `project_id` - ID of the project
   - Optional parameters:
     - `per_page` - Number of results per page (1-1000, default: 30)
     - `page` - Page number (starts at 1)

9. `noko_get_project_entries_current_week` - Get time entries for a project from the current week (Monday to Sunday)
   - Required parameters:
     - `project_id` - ID of the project
   - Optional parameters:
     - `per_page` - Number of results per page (1-1000, default: 30)
     - `page` - Page number (starts at 1)

10. `noko_get_project_entries_date_range` - Get time entries for a project with flexible date range presets
    - Required parameters:
      - `project_id` - ID of the project
      - `period` - Date range preset: 'past_week', 'past_month', 'current_week', 'current_month'
    - Optional parameters:
      - `per_page` - Number of results per page (1-1000, default: 30)
      - `page` - Page number (starts at 1)

### Enhanced noko_list_entries Tool

The `noko_list_entries` tool now supports a `date_preset` parameter for quick date range selection:
- `date_preset` - Choose from: 'past_week', 'past_month', 'current_week', 'current_month'
- When provided, this automatically sets the `from` and `to` parameters
- Example: `noko_list_entries({ project_ids: [123], date_preset: 'past_week' })`

## Resources

The server provides MCP resources for easy data access:

### Standard Resources
- `noko://users` - List of all users
- `noko://user/{id}` - Individual user details
- `noko://projects` - List of all projects  
- `noko://project/{id}` - Individual project details
- `noko://project/{projectId}/entries` - All entries for a specific project
- `noko://entries` - All entries (requires additional filters)
- `noko://entry/{id}` - Individual entry details

### Convenience Date-Based Resources
- `noko://project/{projectId}/entries/week` - Past 7 days entries for a project
- `noko://project/{projectId}/entries/month` - Past 30 days entries for a project
- `noko://project/{projectId}/entries/current-week` - Current week entries for a project
- `noko://project/{projectId}/entries/current-month` - Current month entries for a project

These resources automatically calculate date ranges and provide quick access to commonly requested time entry data.

## Safety Features

### Confirmation for Destructive Operations

Tools that perform destructive operations (like `noko_edit_entry` and `noko_delete_entry`) include a required `confirm` parameter which must be explicitly set to `true` before the operation will proceed.

When using an AI assistant like Claude with these tools:

1. When you request a destructive action, the assistant will recognize that confirmation is required
2. The assistant will ask you to confirm before proceeding with the operation
3. Only after receiving your confirmation will the assistant set `confirm: true` and execute the operation

This provides an additional safety layer to prevent accidental modifications or deletions of your time entries.

Example interaction:

```
User: Delete time entry 12345
Assistant: I can help you delete entry #12345. This action is permanent and cannot be undone. Would you like to proceed?
User: Yes, please delete it
Assistant: [Executes deletion with confirm=true] Entry #12345 has been successfully deleted.
```

## License

MIT
