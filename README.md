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

Create a `.env` file in the root directory with the following content:

```
NOKO_API_TOKEN=your_noko_api_token
```

You can obtain your Noko API token from your Noko account settings.

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

1. `noko_list_entries` - List time entries with optional filters
   - Parameters: `user_ids[]`, `project_ids[]`, `from`, `to`, `invoiced`, `updated_from`, `updated_to`, `per_page`, `page`

2. `noko_create_entry` - Create a new time entry
   - Required parameters: `date`, `minutes`, `description`
   - Optional parameters: `project_id`, `user_id`, `billable`, `tags`, `invoice_id`

3. `noko_list_projects` - List all available projects with optional filtering and pagination
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

4. `noko_list_users` - List all users with optional filtering and pagination
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

## License

MIT
