import axios, { Method } from 'axios';
import { Project } from './types/index.js';

const TEXT = "text" as const;

// Create error response
const createErrorResponse = (message: string) => ({
  content: [{ type: TEXT, text: message }]
});

// Create success response
const createSuccessResponse = (data: any) => {
  let text: string;

  if (data) {
    if (typeof data === 'object') {
      text = JSON.stringify(data, null, 2);
    } else {
      text = String(data);
    }
  } else {
    text = "Success (no content)";
  }

  return {
    content: [{ type: TEXT, text }]
  };
};

export class NokoApi {
  private baseUrl: string;
  private apiToken: string;

  constructor(apiToken: string) {
    this.baseUrl = "https://api.nokotime.com/v2";
    this.apiToken = apiToken;
  }

  async request(method: Method, path: string, args: Record<string, any> = {}, pathParams: Record<string, any> = {}) {
    let resolvedPath = path;
    if (pathParams) {
      for (const [param, value] of Object.entries(pathParams)) {
        resolvedPath = resolvedPath.replace(`:${param}`, String(value));
      }
    }

    let params: Record<string, any> | null = null;
    let jsonData: Record<string, any> | null = null;

    if (method.toUpperCase() === "GET") {
      params = {};
      // Only add non-empty parameters
      for (const [key, value] of Object.entries(args)) {
        // Skip 'all' state values as they mean no filter
        if (key === 'state' && value === 'all') {
          continue;
        }

        if (value !== null && value !== undefined && value !== '') {
          params[key] = value;
        }
      }
    } else {
      jsonData = args || {};
    }

    const headers = {
      "X-NokoToken": this.apiToken,
      "Accept": "application/json",
      "Content-Type": "application/json",
      "User-Agent": "NokoMCP/0.1.0"
    };

    try {
      const nokoResponse = await axios({
        method: method.toLowerCase(),
        url: `${this.baseUrl}${resolvedPath}`,
        headers,
        params,
        data: jsonData,
      });

      // Process response data
      let responseData = nokoResponse.data;

      // Extract pagination information from Link header if present
      if (nokoResponse.headers?.link) {
        responseData = {
          data: nokoResponse.data,
          pagination: this.parseLinkHeader(nokoResponse.headers.link),
        };
      }

      return createSuccessResponse(responseData);
    } catch (error: any) {
      console.error(`Noko API Error: ${error.message}`);
      if (error.response) {
        console.error(`Response Data: ${JSON.stringify(error.response.data)}`);
        return createErrorResponse(`Noko API Error: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`);
      }
      return createErrorResponse(`Noko API Error: ${error.message}`);
    }
  }

  async searchProjects(searchTerm: string) {
    try {
      const allProjectsResponse = await this.request('GET', '/projects', { enabled: true, per_page: 1000 });
      
      if (!allProjectsResponse.content || allProjectsResponse.content.length === 0) {
        return createErrorResponse("Could not retrieve project list.");
      }

      const content = JSON.parse(allProjectsResponse.content[0].text);
      const allProjects = content.data || content; // Handle paginated and non-paginated responses

      if (!Array.isArray(allProjects)) {
        return createErrorResponse("Project list is not in the expected format.");
      }
      
      const searchKeywords = searchTerm.toLowerCase().split(/[^a-z0-9]+/).filter(kw => kw);

      const filteredProjects: Project[] = allProjects.filter((project: Project) => {
        const projectName = project.name.toLowerCase();
        return searchKeywords.every(keyword => projectName.includes(keyword));
      });

      return createSuccessResponse(filteredProjects);
    } catch (error: any) {
      console.error(`Error searching projects: ${error.message}`);
      return createErrorResponse(`Error searching projects: ${error.message}`);
    }
  }

  private parseLinkHeader(linkHeader: string): Record<string, string> {
    const links: Record<string, string> = {};
    const parts = linkHeader.split(',');

    for (const part of parts) {
      const section = part.split(';');
      if (section.length > 1) {
        const url = section[0].replace(/<(.*)>/, '$1').trim();
        const name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
      }
    }

    return links;
  }
} 