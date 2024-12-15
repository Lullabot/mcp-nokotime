from nokotime.tools import TOOLS

def test_tools_structure():
    """Test that all tools have the required structure."""
    for tool in TOOLS:
        assert "name" in tool
        assert "description" in tool
        assert "inputSchema" in tool
        assert tool["inputSchema"]["type"] == "object"
        assert "properties" in tool["inputSchema"]

def test_list_entries_tool():
    """Test list-entries tool schema."""
    tool = next(t for t in TOOLS if t["name"] == "list-entries")
    props = tool["inputSchema"]["properties"]
    
    assert "from" in props
    assert props["from"]["type"] == "string"
    assert "to" in props
    assert props["to"]["type"] == "string"
    assert "user_ids" in props
    assert props["user_ids"]["type"] == "array"
    assert "project_ids" in props
    assert props["project_ids"]["type"] == "array"

def test_create_entry_tool():
    """Test create-entry tool schema."""
    tool = next(t for t in TOOLS if t["name"] == "create-entry")
    props = tool["inputSchema"]["properties"]
    required = tool["inputSchema"]["required"]
    
    assert "date" in props
    assert props["date"]["type"] == "string"
    assert "minutes" in props
    assert props["minutes"]["type"] == "integer"
    assert "description" in props
    assert props["description"]["type"] == "string"
    assert "project_id" in props
    assert props["project_id"]["type"] == "integer"
    
    assert "date" in required
    assert "minutes" in required
    assert "description" in required

def test_list_projects_tool():
    """Test list-projects tool schema."""
    tool = next(t for t in TOOLS if t["name"] == "list-projects")
    props = tool["inputSchema"]["properties"]
    
    assert "state" in props
    assert props["state"]["type"] == "string"
    assert "enum" in props["state"]
    assert set(props["state"]["enum"]) == {"active", "archived", "all"}

def test_list_users_tool():
    """Test list-users tool schema."""
    tool = next(t for t in TOOLS if t["name"] == "list-users")
    props = tool["inputSchema"]["properties"]
    
    assert "state" in props
    assert props["state"]["type"] == "string"
    assert "enum" in props["state"]
    assert set(props["state"]["enum"]) == {"active", "suspended", "all"}
