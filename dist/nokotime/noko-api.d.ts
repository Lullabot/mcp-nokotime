import { Method } from 'axios';
export declare class NokoApi {
    private baseUrl;
    private apiToken;
    constructor(apiToken: string);
    request(method: Method, path: string, args?: Record<string, any>, pathParams?: Record<string, any>): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    searchProjects(searchTerm: string): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    private parseLinkHeader;
}
