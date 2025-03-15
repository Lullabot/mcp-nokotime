// Type definitions for Noko API
export type ToolPathConfig = Record<string, string>;
export type ToolMethodConfig = Record<string, string>;

export interface Request {
  path: string;
  method: string;
  headers: Record<string, string>;
  params?: Record<string, string | number | boolean | string[]>;
  data?: Record<string, any>;
}

export interface Response {
  status: number;
  data: any;
  headers: Record<string, string>;
}

/**
 * Tool schema for Noko API
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Noko API response
 */
export interface NokoResponse<T> {
  [key: string]: any;
} 