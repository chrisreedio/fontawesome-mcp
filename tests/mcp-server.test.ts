import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';

describe('MCP Server', () => {
  let server: ChildProcess;
  const serverPath = join(process.cwd(), 'dist', 'mcp-server.js');

  beforeAll(async () => {
    // Ensure the project is built
    const { spawn: spawnSync } = await import('child_process');
  });

  afterEach(() => {
    if (server && !server.killed) {
      server.kill();
    }
  });

  const startServer = (): Promise<ChildProcess> => {
    return new Promise((resolve, reject) => {
      const serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      serverProcess.on('error', reject);
      
      // Give server a moment to start
      setTimeout(() => resolve(serverProcess), 100);
    });
  };

  const sendRequest = (server: ChildProcess, request: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      let response = '';
      
      const onData = (data: Buffer) => {
        response += data.toString();
        try {
          const parsed = JSON.parse(response.trim());
          server.stdout?.off('data', onData);
          resolve(parsed);
        } catch (e) {
          // Not complete JSON yet, keep waiting
        }
      };

      server.stdout?.on('data', onData);
      
      // Set timeout
      const timeout = setTimeout(() => {
        server.stdout?.off('data', onData);
        reject(new Error('Request timeout'));
      }, 5000);

      server.stdin?.write(JSON.stringify(request) + '\n');
      
      // Clear timeout when response is received
      const originalResolve = resolve;
      resolve = (value: any) => {
        clearTimeout(timeout);
        originalResolve(value);
      };
    });
  };

  test('should list available tools', async () => {
    server = await startServer();
    
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    };

    const response = await sendRequest(server, request);

    expect(response).toHaveProperty('jsonrpc', '2.0');
    expect(response).toHaveProperty('id', 1);
    expect(response).toHaveProperty('result');
    expect(response.result).toHaveProperty('tools');
    expect(response.result.tools).toHaveLength(2);
    
    const toolNames = response.result.tools.map((tool: any) => tool.name);
    expect(toolNames).toContain('fuzzySearch');
    expect(toolNames).toContain('getIcon');
  }, 10000);

  test('should perform fuzzy search', async () => {
    server = await startServer();
    
    const request = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'fuzzySearch',
        arguments: {
          query: 'home',
          limit: 3
        }
      }
    };

    const response = await sendRequest(server, request);

    expect(response).toHaveProperty('jsonrpc', '2.0');
    expect(response).toHaveProperty('id', 2);
    expect(response).toHaveProperty('result');
    expect(response.result).toHaveProperty('content');
    expect(response.result.content).toHaveLength(1);
    expect(response.result.content[0]).toHaveProperty('type', 'text');
    
    const searchResults = JSON.parse(response.result.content[0].text);
    expect(Array.isArray(searchResults)).toBe(true);
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults.length).toBeLessThanOrEqual(3);
    
    // Verify result structure
    const firstResult = searchResults[0];
    expect(firstResult).toHaveProperty('name');
    expect(firstResult).toHaveProperty('style');
    expect(firstResult).toHaveProperty('label');
  }, 10000);

  test('should get specific icon with SVG', async () => {
    server = await startServer();
    
    const request = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'getIcon',
        arguments: {
          name: 'house',
          style: 'solid'
        }
      }
    };

    const response = await sendRequest(server, request);

    expect(response).toHaveProperty('jsonrpc', '2.0');
    expect(response).toHaveProperty('id', 3);
    expect(response).toHaveProperty('result');
    
    const iconData = JSON.parse(response.result.content[0].text);
    expect(iconData).toHaveProperty('name', 'house');
    expect(iconData).toHaveProperty('style', 'solid');
    expect(iconData).toHaveProperty('svg');
    expect(iconData.svg).toContain('<svg');
    expect(iconData.svg).toContain('</svg>');
  }, 10000);

  test('should handle invalid tool name', async () => {
    server = await startServer();
    
    const request = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'invalidTool',
        arguments: {}
      }
    };

    const response = await sendRequest(server, request);

    expect(response).toHaveProperty('jsonrpc', '2.0');
    expect(response).toHaveProperty('id', 4);
    expect(response).toHaveProperty('error');
    expect(response.error.message).toContain('Tool invalidTool not found');
  }, 10000);

  test('should handle missing required parameters', async () => {
    server = await startServer();
    
    const request = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'fuzzySearch',
        arguments: {} // Missing required 'query' parameter
      }
    };

    const response = await sendRequest(server, request);

    expect(response).toHaveProperty('jsonrpc', '2.0');
    expect(response).toHaveProperty('id', 5);
    expect(response).toHaveProperty('error');
    expect(response.error.message).toContain('Invalid arguments');
  }, 10000);

  test('should handle invalid method', async () => {
    server = await startServer();
    
    const request = {
      jsonrpc: '2.0',
      id: 6,
      method: 'invalid/method',
      params: {}
    };

    const response = await sendRequest(server, request);

    expect(response).toHaveProperty('jsonrpc', '2.0');
    expect(response).toHaveProperty('id', 6);
    expect(response).toHaveProperty('error');
    expect(response.error.message).toContain('Method not found');
  }, 10000);
});