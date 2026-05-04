import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getDateRange } from '../utils/date-ranges.js';
/**
 * Register all resources with the MCP server
 */
export function registerResources(server, nokoApi, logger) {
    // Use console as default logger if not provided
    const log = logger || {
        debug: (msg, ...args) => console.error(`[DEBUG] ${msg}`, ...args),
        error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args)
    };
    try {
        log.debug("Starting resources registration");
        const makeRequest = async (path, params = {}) => {
            try {
                log.debug(`Making API request to: ${path} with params: ${JSON.stringify(params)}`);
                const response = await nokoApi.request('GET', path, params);
                if (response.content && response.content[0]?.text) {
                    const data = JSON.parse(response.content[0].text);
                    // Handle paginated and non-paginated responses
                    return data.data || data;
                }
                throw new Error("Invalid API response format");
            }
            catch (error) {
                log.error(`Error making API request: ${path}`, error.message || 'Unknown error');
                throw new Error(error.message || 'Unknown API error');
            }
        };
        // Register each resource type with proper error handling
        try {
            registerUserResources(server, makeRequest, log);
            log.debug("User resources registered successfully");
        }
        catch (error) {
            log.error("Failed to register user resources:", error.message);
            // Continue with other registrations
        }
        try {
            registerProjectResources(server, makeRequest, log);
            log.debug("Project resources registered successfully");
        }
        catch (error) {
            log.error("Failed to register project resources:", error.message);
            // Continue with other registrations
        }
        try {
            registerEntryResources(server, makeRequest, log);
            log.debug("Entry resources registered successfully");
        }
        catch (error) {
            log.error("Failed to register entry resources:", error.message);
            // Continue execution
        }
        log.debug("All resources registration attempts completed");
    }
    catch (error) {
        log.error("Fatal error during resources registration:", error.message);
        throw error; // Rethrow to allow server to handle
    }
}
/**
 * Register user-related resources
 */
function registerUserResources(server, makeRequest, logger) {
    // List users callback for users resource
    const listUsersCallback = async (_extra) => {
        try {
            logger.debug("Listing users...");
            const users = (await makeRequest('/users'));
            logger.debug(`Retrieved ${users.length} users`);
            const resources = users.map((user) => ({
                uri: `noko://user/${user.id}`,
                name: `${user.first_name} ${user.last_name}`,
                description: `${user.email} (${user.state})`,
            }));
            return {
                resources
            };
        }
        catch (error) {
            logger.error("Error listing users", error.message);
            // Return empty list instead of failing
            return { resources: [] };
        }
    };
    // Register users resource template
    logger.debug("Registering users resource template");
    server.resource("users", new ResourceTemplate("noko://users", {
        list: listUsersCallback
    }), async (uri) => {
        logger.debug("Fetching users content");
        try {
            const users = (await makeRequest('/users'));
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: "Noko Users",
                            description: "List of all Noko users"
                        },
                        text: JSON.stringify(users, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            logger.error("Error fetching users content", error.message);
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: "Noko Users Error",
                            description: "Error fetching users"
                        },
                        text: `Error fetching users: ${error.message || 'Unknown error'}`
                    }
                ]
            };
        }
    });
    // Register single user resource template
    logger.debug("Registering single user resource template");
    server.resource("user", new ResourceTemplate("noko://user/{id}", { list: undefined }), async (uri, { id }) => {
        logger.debug(`Fetching user ${id}`);
        try {
            const user = (await makeRequest(`/users/${id}`));
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `User: ${user.first_name} ${user.last_name}`,
                            description: `Details for Noko user ${id}`
                        },
                        text: JSON.stringify(user, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            logger.error(`Error fetching user ${id}`, error.message);
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `User Error: ${id}`,
                            description: `Error fetching user ${id}`
                        },
                        text: `Error fetching user: ${error.message || 'Unknown error'}`
                    }
                ]
            };
        }
    });
}
/**
 * Register project-related resources
 */
function registerProjectResources(server, makeRequest, logger) {
    // Project listing callback
    const listProjectsCallback = async (_extra) => {
        try {
            const projects = (await makeRequest('/projects'));
            const resources = projects.map((project) => ({
                uri: `noko://project/${project.id}`,
                name: project.name,
                description: `${project.name} (${project.enabled ? 'enabled' : 'archived'})`,
            }));
            return {
                resources
            };
        }
        catch (error) {
            logger.error("Error listing projects", error);
            return { resources: [] };
        }
    };
    // List projects resource
    server.resource("projects", new ResourceTemplate("noko://projects", {
        list: listProjectsCallback
    }), async (uri) => {
        logger.debug("Fetching projects");
        try {
            const projects = (await makeRequest('/projects'));
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: "Noko Projects",
                            description: "List of all Noko projects"
                        },
                        text: JSON.stringify(projects, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            logger.error("Error fetching projects", error);
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: "Noko Projects Error",
                            description: "Error fetching projects"
                        },
                        text: `Error fetching projects: ${error.message || 'Unknown error'}`
                    }
                ]
            };
        }
    });
    // Single project resource
    server.resource("project", new ResourceTemplate("noko://project/{id}", { list: undefined }), async (uri, { id }) => {
        logger.debug(`Fetching project ${id}`);
        try {
            const project = (await makeRequest(`/projects/${id}`));
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Project: ${project.name}`,
                            description: `Details for Noko project ${id}`
                        },
                        text: JSON.stringify(project, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            logger.error(`Error fetching project ${id}`, error);
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Project Error: ${id}`,
                            description: `Error fetching project ${id}`
                        },
                        text: `Error fetching project: ${error.message || 'Unknown error'}`
                    }
                ]
            };
        }
    });
}
/**
 * Register entries-related resources
 */
function registerEntryResources(server, makeRequest, logger) {
    // Entries listing callback for a specific project
    const listEntriesForProjectCallback = async (extra) => {
        try {
            const projectId = extra.projectId;
            if (!projectId) {
                return { resources: [] };
            }
            logger.debug(`Listing entries for project ${projectId}...`);
            const entries = (await makeRequest(`/projects/${projectId}/entries`));
            logger.debug(`Retrieved ${entries.length} entries for project ${projectId}`);
            const resources = entries.map((entry) => ({
                uri: `noko://entry/${entry.id}`,
                name: `Entry #${entry.id}: ${entry.minutes} minutes on ${entry.date}`,
                description: entry.description || 'No description',
            }));
            return {
                resources,
            };
        }
        catch (error) {
            logger.error("Error listing entries for project", error.message);
            return { resources: [] };
        }
    };
    logger.debug("Registering entries (for project) resource template");
    server.resource("entries_for_project", new ResourceTemplate("noko://project/{projectId}/entries", {
        list: listEntriesForProjectCallback,
    }), async (uri, { projectId }) => {
        logger.debug(`Fetching entries content for project ${projectId}`);
        try {
            const entries = (await makeRequest(`/projects/${projectId}/entries`));
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Noko Entries for Project ${projectId}`,
                            description: `List of all Noko entries for project ${projectId}`,
                        },
                        text: JSON.stringify(entries, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            logger.error(`Error fetching entries for project ${projectId}`, error.message);
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Noko Entries Error for Project ${projectId}`,
                            description: `Error fetching entries for project ${projectId}`,
                        },
                        text: `Error fetching entries: ${error.message || 'Unknown error'}`,
                    },
                ],
            };
        }
    });
    // List all entries callback
    const listEntriesCallback = async (_extra) => {
        try {
            logger.debug("Listing all entries...");
            // Noko API requires a user_id or project_id to list entries.
            // We'll leave this unimplemented for now, as listing all entries
            // for all users could be a very large and slow request.
            // A more specific tool or resource would be better.
            logger.debug("Listing all entries is not supported without filters.");
            return { resources: [] };
        }
        catch (error) {
            logger.error("Error listing all entries", error.message);
            return { resources: [] };
        }
    };
    // Register all entries resource template
    logger.debug("Registering all entries resource template");
    server.resource("entries", new ResourceTemplate("noko://entries", {
        list: listEntriesCallback,
    }), async (uri) => {
        logger.debug("Fetching all entries content is not supported");
        return {
            contents: [
                {
                    uri: uri.href,
                    metadata: {
                        title: "Noko Entries",
                        description: "Listing all entries is not supported without a filter like user_id or project_id."
                    },
                    text: "Listing all entries is not supported without a filter like user_id or project_id."
                }
            ]
        };
    });
    // Register convenience resources for date-based entries
    logger.debug("Registering project entries past week resource template");
    server.resource("project_entries_week", new ResourceTemplate("noko://project/{projectId}/entries/week", { list: undefined }), async (uri, { projectId }) => {
        logger.debug(`Fetching past week entries for project ${projectId}`);
        try {
            const dateRange = getDateRange('past_week');
            const entries = (await makeRequest('/entries', {
                project_ids: [parseInt(projectId)],
                from: dateRange.from,
                to: dateRange.to
            }));
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Past Week Entries for Project ${projectId}`,
                            description: `Time entries for project ${projectId} from the past 7 days (${dateRange.from} to ${dateRange.to})`
                        },
                        text: JSON.stringify(entries, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            logger.error(`Error fetching past week entries for project ${projectId}`, error.message);
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Past Week Entries Error for Project ${projectId}`,
                            description: `Error fetching past week entries for project ${projectId}`
                        },
                        text: `Error fetching past week entries: ${error.message || 'Unknown error'}`
                    }
                ]
            };
        }
    });
    logger.debug("Registering project entries past month resource template");
    server.resource("project_entries_month", new ResourceTemplate("noko://project/{projectId}/entries/month", { list: undefined }), async (uri, { projectId }) => {
        logger.debug(`Fetching past month entries for project ${projectId}`);
        try {
            const dateRange = getDateRange('past_month');
            const entries = (await makeRequest('/entries', {
                project_ids: [parseInt(projectId)],
                from: dateRange.from,
                to: dateRange.to
            }));
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Past Month Entries for Project ${projectId}`,
                            description: `Time entries for project ${projectId} from the past 30 days (${dateRange.from} to ${dateRange.to})`
                        },
                        text: JSON.stringify(entries, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            logger.error(`Error fetching past month entries for project ${projectId}`, error.message);
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Past Month Entries Error for Project ${projectId}`,
                            description: `Error fetching past month entries for project ${projectId}`
                        },
                        text: `Error fetching past month entries: ${error.message || 'Unknown error'}`
                    }
                ]
            };
        }
    });
    logger.debug("Registering project entries current week resource template");
    server.resource("project_entries_current_week", new ResourceTemplate("noko://project/{projectId}/entries/current-week", { list: undefined }), async (uri, { projectId }) => {
        logger.debug(`Fetching current week entries for project ${projectId}`);
        try {
            const dateRange = getDateRange('current_week');
            const entries = (await makeRequest('/entries', {
                project_ids: [parseInt(projectId)],
                from: dateRange.from,
                to: dateRange.to
            }));
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Current Week Entries for Project ${projectId}`,
                            description: `Time entries for project ${projectId} for the current week (${dateRange.from} to ${dateRange.to})`
                        },
                        text: JSON.stringify(entries, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            logger.error(`Error fetching current week entries for project ${projectId}`, error.message);
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Current Week Entries Error for Project ${projectId}`,
                            description: `Error fetching current week entries for project ${projectId}`
                        },
                        text: `Error fetching current week entries: ${error.message || 'Unknown error'}`
                    }
                ]
            };
        }
    });
    logger.debug("Registering project entries current month resource template");
    server.resource("project_entries_current_month", new ResourceTemplate("noko://project/{projectId}/entries/current-month", { list: undefined }), async (uri, { projectId }) => {
        logger.debug(`Fetching current month entries for project ${projectId}`);
        try {
            const dateRange = getDateRange('current_month');
            const entries = (await makeRequest('/entries', {
                project_ids: [parseInt(projectId)],
                from: dateRange.from,
                to: dateRange.to
            }));
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Current Month Entries for Project ${projectId}`,
                            description: `Time entries for project ${projectId} for the current month (${dateRange.from} to ${dateRange.to})`
                        },
                        text: JSON.stringify(entries, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            logger.error(`Error fetching current month entries for project ${projectId}`, error.message);
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Current Month Entries Error for Project ${projectId}`,
                            description: `Error fetching current month entries for project ${projectId}`
                        },
                        text: `Error fetching current month entries: ${error.message || 'Unknown error'}`
                    }
                ]
            };
        }
    });
    // Register single entry resource template
    logger.debug("Registering single entry resource template");
    server.resource("entry", new ResourceTemplate("noko://entry/{id}", { list: undefined }), async (uri, { id }) => {
        logger.debug(`Fetching entry ${id}`);
        try {
            const entry = (await makeRequest(`/entries/${id}`));
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Entry: ${entry.id}`,
                            description: `Details for Noko time entry ${id}`
                        },
                        text: JSON.stringify(entry, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            logger.error(`Error fetching entry ${id}`, error);
            return {
                contents: [
                    {
                        uri: uri.href,
                        metadata: {
                            title: `Entry Error: ${id}`,
                            description: `Error fetching entry ${id}`
                        },
                        text: `Error fetching entry: ${error.message || 'Unknown error'}`
                    }
                ]
            };
        }
    });
}
//# sourceMappingURL=index.js.map