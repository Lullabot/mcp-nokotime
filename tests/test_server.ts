import { NokoServer } from '../src/nokotime/server';
import { Request } from '../src/nokotime/types';
import { TOOLS } from '../src/nokotime/tools';

// Mock environment variables
process.env.NOKO_API_TOKEN = 'test_token';

// Mock axios
jest.mock('axios');

describe('NokoServer', () => {
  let server: NokoServer;

  beforeEach(() => {
    server = new NokoServer('test-noko');
  });

  test('should handle tools list request', async () => {
    const request: Request = {
      path: '/tools/list',
      method: 'GET'
    };

    const response = await server.handleRequest(request);
    expect(response.status_code).toBe(200);
    expect(response.body.tools).toEqual(TOOLS);
  });

  test('should handle 404 for unknown paths', async () => {
    const request: Request = {
      path: '/unknown',
      method: 'GET'
    };

    const response = await server.handleRequest(request);
    expect(response.status_code).toBe(404);
    expect(response.body.error).toBe('Not found');
  });
}); 