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
