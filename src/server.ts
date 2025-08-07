import express from 'express';
import { fuzzySearchMethod } from './methods/fuzzySearch.js';
import { getIconMethod } from './methods/getIcon.js';
import { faLoader } from './fa/loader.js';
import { FAStyle } from './fa/types.js';

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

// Simple HTTP API endpoints for testing
app.post('/api/search', async (req, res) => {
  try {
    const result = fuzzySearchMethod.handler(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/api/icon', async (req, res) => {
  try {
    const result = getIconMethod.handler(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// MCP JSON-RPC endpoint
app.post('/rpc', async (req, res) => {
  try {
    const { method, params, id } = req.body;
    
    let result;
    switch (method) {
      case 'tools/list':
        result = {
          tools: [
            {
              name: fuzzySearchMethod.name,
              description: fuzzySearchMethod.description,
              inputSchema: fuzzySearchMethod.inputSchema
            },
            {
              name: getIconMethod.name,
              description: getIconMethod.description,
              inputSchema: getIconMethod.inputSchema
            }
          ]
        };
        break;
        
      case 'tools/call':
        const { name, arguments: args } = params;
        switch (name) {
          case fuzzySearchMethod.name:
            result = {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(fuzzySearchMethod.handler(args), null, 2)
                }
              ]
            };
            break;
          
          case getIconMethod.name:
            result = {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(getIconMethod.handler(args), null, 2)
                }
              ]
            };
            break;
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        break;
        
      default:
        throw new Error(`Unknown method: ${method}`);
    }
    
    res.json({
      jsonrpc: '2.0',
      id,
      result
    });
  } catch (error) {
    res.json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: {
        code: -32000,
        message: error instanceof Error ? error.message : String(error)
      }
    });
  }
});

// Optional raw SVG endpoint
app.get('/svg/:style/:name.svg', (req, res) => {
  try {
    const { style, name } = req.params;
    const icon = faLoader.getIcon(name, style as FAStyle);
    
    if (!icon || !icon.svg) {
      return res.status(404).json({ error: 'Icon not found' });
    }
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(icon.svg);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Font Awesome Pro MCP Server',
    version: '1.0.0',
    endpoints: {
      rpc: '/rpc',
      svg: '/svg/:style/:name.svg',
      health: '/health'
    }
  });
});

app.listen(port, () => {
  console.log(`Font Awesome Pro MCP Server running on port ${port}`);
  console.log(`MCP endpoint: http://localhost:${port}/rpc`);
  console.log(`SVG endpoint: http://localhost:${port}/svg/:style/:name.svg`);
  console.log(`Health check: http://localhost:${port}/health`);
});

export default app;