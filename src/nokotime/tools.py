from typing import Dict, Any, List

# Tool schemas for Noko API v2
TOOLS: List[Dict[str, Any]] = [
    {
        "name": "noko_list_entries",
        "description": "List time entries with optional filters",
        "inputSchema": {
            "type": "object",
            "properties": {
                "from": {
                    "type": "string",
                    "description": "Start date (YYYY-MM-DD)",
                },
                "to": {
                    "type": "string",
                    "description": "End date (YYYY-MM-DD)",
                },
                "user_ids": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "description": "Filter by user IDs",
                },
                "project_ids": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "description": "Filter by project IDs",
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
                "state": {
                    "type": "string",
                    "enum": ["active", "archived", "all"],
                    "description": "Filter projects by state",
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
                "state": {
                    "type": "string",
                    "enum": ["active", "suspended", "all"],
                    "description": "Filter users by state",
                },
            },
        },
    },
] 