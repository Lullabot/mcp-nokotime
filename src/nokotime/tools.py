from typing import Dict, Any, List

# Tool schemas for Noko API v2
TOOLS: List[Dict[str, Any]] = [
    {
        "name": "noko_list_entries",
        "description": "List time entries with optional filters",
        "inputSchema": {
            "type": "object",
            "properties": {
                "user_ids[]": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "description": "Filter by user IDs",
                },
                "project_ids[]": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "description": "Filter by project IDs",
                },
                "from": {
                    "type": "string",
                    "description": "Start date (YYYY-MM-DD)",
                },
                "to": {
                    "type": "string",
                    "description": "End date (YYYY-MM-DD)",
                },
                "invoiced": {
                    "type": "boolean",
                    "description": "Filter by invoice status",
                },
                "updated_from": {
                    "type": "string",
                    "description": "Filter entries updated since date (ISO 8601)",
                },
                "updated_to": {
                    "type": "string",
                    "description": "Filter entries updated before date (ISO 8601)",
                },
                "per_page": {
                    "type": "integer",
                    "description": "Number of entries per page (max 100)",
                },
                "page": {
                    "type": "integer",
                    "description": "Page number",
                },
            },
        },
    },
    {
        "name": "noko_create_entry",
        "description": "Create a new time entry",
        "inputSchema": {
            "type": "object",
            "properties": {
                "date": {
                    "type": "string",
                    "description": "Entry date (YYYY-MM-DD)",
                },
                "minutes": {
                    "type": "integer",
                    "description": "Duration in minutes",
                },
                "description": {
                    "type": "string",
                    "description": "Entry description",
                },
                "project_id": {
                    "type": "integer",
                    "description": "Project ID",
                },
                "user_id": {
                    "type": "integer",
                    "description": "User ID (defaults to authenticated user)",
                },
                "billable": {
                    "type": "boolean",
                    "description": "Whether the entry is billable",
                },
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Array of tags",
                },
                "invoice_id": {
                    "type": "integer",
                    "description": "ID of associated invoice",
                },
            },
            "required": ["date", "minutes", "description"],
        },
    },
    {
        "name": "noko_list_projects",
        "description": "List all available projects",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Filter by project name",
                },
                "state": {
                    "type": "string",
                    "enum": ["active", "archived"],
                    "description": "Filter by project state (active or archived)",
                },
                "billing_increment": {
                    "type": "integer",
                    "description": "Filter by billing increment in minutes",
                },
                "enabled_for_tracking": {
                    "type": "boolean",
                    "description": "Filter by tracking enabled status",
                },
                "per_page": {
                    "type": "integer",
                    "description": "Number of projects per page (max 100)",
                },
                "page": {
                    "type": "integer",
                    "description": "Page number",
                },
            },
        },
    },
    {
        "name": "noko_list_users",
        "description": "List all users",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Filter by user name",
                },
                "email": {
                    "type": "string",
                    "description": "Filter by email address",
                },
                "state": {
                    "type": "string",
                    "enum": ["active", "suspended", "archived"],
                    "description": "Filter by user state (active, suspended, or archived)",
                },
                "role": {
                    "type": "string",
                    "enum": ["coworker", "supervisor", "administrator"],
                    "description": "Filter by user role",
                },
                "per_page": {
                    "type": "integer",
                    "description": "Number of users per page (max 100)",
                },
                "page": {
                    "type": "integer",
                    "description": "Page number",
                },
            },
        },
    },
] 