#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fuzzySearchMethod } from './methods/fuzzySearch.js';
import { getIconMethod } from './methods/getIcon.js';
import { z } from 'zod';

const server = new McpServer({
  name: "fontawesome-pro-mcp",
  version: "1.0.0"
});

// Register fuzzy search tool
server.registerTool(
  fuzzySearchMethod.name,
  {
    title: "Fuzzy Search Font Awesome Icons",
    description: fuzzySearchMethod.description,
    inputSchema: fuzzySearchMethod.inputSchema.shape
  },
  async (args: any) => {
    try {
      const result = fuzzySearchMethod.handler(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
);

// Register get icon tool
server.registerTool(
  getIconMethod.name,
  {
    title: "Get Font Awesome Icon",
    description: getIconMethod.description,
    inputSchema: getIconMethod.inputSchema.shape
  },
  async (args: any) => {
    try {
      const result = getIconMethod.handler(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.stderr.write(`Failed to start MCP server: ${error}\n`);
  process.exit(1);
});