# 🎯 Font Awesome Pro MCP Server

A Model Context Protocol (MCP) server that provides fuzzy search and retrieval functionality for Font Awesome Pro icons. Built with Node.js, TypeScript, and Express.

## ✨ Features

- **🔍 Fuzzy Search**: Find icons using intelligent search with Fuse.js
- **📦 Icon Retrieval**: Get complete icon data including SVG content
- **🔌 MCP Compatible**: Standard JSON-RPC interface for MCP clients
- **🌐 Multiple Access Methods**: HTTP API, MCP protocol, and direct SVG endpoints
- **💎 Font Awesome Pro Support**: Access to all Pro icon styles (solid, regular, light, thin, duotone)

## 📋 Prerequisites

- Node.js 18+ 
- Font Awesome Pro license with NPM access token configured in `~/.npmrc`:
  ```
  @fortawesome:registry=https://npm.fontawesome.com/
  //npm.fontawesome.com/:_authToken=YOUR_TOKEN_HERE
  ```

## 🚀 Installation

### Option 1: NPM Package (Coming Soon)

Once published to NPM, you can install directly:

```bash
# Install and run via npx (no local setup required)
npx @chrisreedio/fontawesome-pro-mcp

# Or install globally
npm install -g @chrisreedio/fontawesome-pro-mcp
fontawesome-pro-mcp
```

### Option 2: Development/Local Setup

```bash
# Clone the repository
git clone https://github.com/chrisreedio/fontawesome-mcp.git
cd fontawesome-mcp

# Install dependencies (uses your FA Pro token automatically)
npm install

# Build the project
npm run build
```

## 🧭 Using

Set up this MCP server in your favorite clients.

### Claude Desktop

Recommended (npx):
```json
{
  "mcpServers": {
    "fontawesome-pro": {
      "command": "npx",
      "args": ["-y", "@chrisreedio/fontawesome-pro-mcp"]
    }
  }
}
```

Local development path:
```json
{
  "mcpServers": {
    "fontawesome-pro": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/fontawesome-mcp/dist/mcp-server.js"]
    }
  }
}
```

Config file locations:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`

Restart Claude Desktop after editing the config.

### Cursor

#### Option 1: Easy Install - One-Click

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-light.svg)](https://cursor.com/en/install-mcp?name=fontawesome-pro&config=JTdCJTIyY29tbWFuZCUyMiUzQSUyMm5weCUyMC15JTIwJTQwY2hyaXNyZWVkaW8lMkZmb250YXdlc29tZS1wcm8tbWNwJTIyJTdE)

#### Option 2: Manual Setup

Steps:
- Open Cursor Settings (Cmd+Shift+J) → MCP Servers
- Add a server and paste one of the configs below
- Restart Cursor if tools don’t appear

Recommended (npx):
```json
{
  "mcpServers": {
    "fontawesome-pro": {
      "command": "npx",
      "args": ["-y", "@chrisreedio/fontawesome-pro-mcp"]
    }
  }
}
```


Local development path:
```json
{
  "mcpServers": {
    "fontawesome-pro": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/fontawesome-mcp/dist/mcp-server.js"]
    }
  }
}
```

Tips:
- If you use many MCP servers, ensure this one isn’t disabled in Cursor’s MCP UI
- Some Cursor builds prioritize a limited number of tools; placing this server earlier can help

### VS Code

You can use either the Claude Code CLI or the Claude Dev extension.

CLI (recommended):
```bash
claude mcp add fontawesome-pro -- npx -y @chrisreedio/fontawesome-pro-mcp
```
Local path alternative:
```bash
claude mcp add fontawesome-pro node /ABSOLUTE/PATH/TO/fontawesome-mcp/dist/mcp-server.js
```

Claude Dev (Cline) config example:
```json
{
  "mcpServers": {
    "fontawesome-pro": {
      "command": "npx",
      "args": ["-y", "@chrisreedio/fontawesome-pro-mcp"]
    }
  }
}
```
Common locations:
- macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- Windows: `%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

## 🎮 Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server runs on `http://localhost:8000` by default. Set `PORT` environment variable to change.

 

## 🔗 API Endpoints

### ❤️ Health Check
```bash
GET /health
```
Returns server status and timestamp.

### 🌐 Simple HTTP API

#### 🔍 Search Icons
```bash
POST /api/search
Content-Type: application/json

{
  "query": "home",
  "limit": 5,
  "style": "solid"  // optional: solid|regular|light|thin|duotone|brands
}
```

#### 📦 Get Specific Icon
```bash
POST /api/icon
Content-Type: application/json

{
  "name": "house-signal",
  "style": "solid"
}
```

### 🔌 MCP JSON-RPC Protocol

#### 📋 List Available Tools
```bash
POST /rpc
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

#### ⚡ Call a Tool
```bash
POST /rpc
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "fuzzySearch",
    "arguments": {
      "query": "search",
      "limit": 3
    }
  }
}
```

### 🎨 Direct SVG Access
```bash
GET /svg/:style/:name.svg
```
Example: `http://localhost:8000/svg/solid/house-signal.svg`

## 🛠️ Available Tools

### fuzzySearch
Search Font Awesome Pro icons using fuzzy matching.

**Parameters:**
- `query` (string): Search query for icons
- `limit` (number, optional): Maximum results to return (default: 20)  
- `style` (string, optional): Filter by icon style

**Returns:** Array of matching icons with metadata.

### getIcon
Get a specific Font Awesome Pro icon with complete data including SVG content.

**Parameters:**
- `name` (string): The icon name (e.g., "home", "user")
- `style` (string): The icon style (solid|regular|light|thin|duotone|brands)

**Returns:** Icon object with SVG content.

## 📄 Response Format

Icons are returned with the following structure:
```json
{
  "name": "house-signal",
  "style": "solid", 
  "label": "House Signal",
  "search": {
    "terms": ["abode", "building", "connect", "family", "home", "residence", "smart home", "wifi", "www"]
  },
  "unicode": "e012",
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\">...</svg>"
}
```

## 🏗️ Architecture

```
src/
├── server.ts          # Express server + MCP setup
├── fa/               # Font Awesome helpers
│   ├── types.ts      # TypeScript interfaces
│   └── loader.ts     # Metadata loading + SVG retrieval
└── methods/          # MCP method implementations
    ├── fuzzySearch.ts # Icon search functionality  
    └── getIcon.ts     # Icon retrieval functionality
```

## 🚢 Production Deployment

For production use, you'll want to run the server as a persistent service that automatically restarts on failure and survives system reboots. Here are the most common deployment approaches:

### ⚡ PM2 Process Manager (Recommended)
PM2 is a popular Node.js process manager that handles automatic restarts, logging, and clustering.

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start npm --name "fontawesome-mcp" -- start

# Save current PM2 processes
pm2 save

# Setup auto-restart on system reboot
pm2 startup

# Monitor the process
pm2 status
pm2 logs fontawesome-mcp
```

### 🐳 Docker
Containerized deployment for consistent environments and easy scaling.

First, create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Expose port
EXPOSE 8000

# Start server
CMD ["npm", "start"]
```

Then build and run:
```bash
# Build image
docker build -t fontawesome-mcp .

# Run container
docker run -d -p 8000:8000 --restart unless-stopped --name fontawesome-mcp fontawesome-mcp

# View logs
docker logs fontawesome-mcp
```

### 🐧 systemd Service (Linux)
For Linux servers, systemd provides robust service management.

Create `/etc/systemd/system/fontawesome-mcp.service`:
```ini
[Unit]
Description=Font Awesome MCP Server
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/fontawesome-mcp
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8000

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable fontawesome-mcp
sudo systemctl start fontawesome-mcp

# Check status
sudo systemctl status fontawesome-mcp
```

### 🔧 Environment Variables
Set these environment variables for production:
```bash
NODE_ENV=production
PORT=8000
LOG_LEVEL=info
```

## 🛠️ Development

### Scripts
- `npm run dev` - Development server with hot reload
- `npm run dev:mcp` - Start local MCP server in development mode
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Run production server
- `npm run start:mcp` - Run local MCP server from built files
- `npm run clean` - Remove build artifacts

### Testing
Run the comprehensive test suite to verify functionality:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

The test suite includes:
- **Unit Tests**: Core search and icon retrieval methods
- **Integration Tests**: Local MCP server functionality via stdio
- **HTTP API Tests**: All REST endpoints and MCP JSON-RPC interface
- **Error Handling**: Validation and edge case scenarios

Tests verify both the HTTP server and local MCP server implementations work correctly.

### Publishing

To publish this package to NPM:

```bash
# Ensure you're logged into NPM
npm login

# Publish the scoped package as public (required for @username/package-name format)
npm publish --access public
```

**Note:** This package uses a scoped name (`@chrisreedio/fontawesome-pro-mcp`), so the `--access public` flag is required to make it publicly accessible. Without this flag, NPM would try to publish it as a private package.

The package includes a `prepublishOnly` script that automatically builds the project before publishing.

### Key Dependencies
- **Express**: HTTP server framework
- **Fuse.js**: Fuzzy search implementation
- **js-yaml**: YAML parsing for FA metadata
- **zod**: Schema validation
- **@modelcontextprotocol/sdk**: MCP protocol support

## 📄 License

MIT

## 💎 Font Awesome Pro

This project requires Font Awesome Pro. Font Awesome Pro is a commercial product - ensure you have appropriate licensing for your use case.