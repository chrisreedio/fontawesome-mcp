# Font Awesome Pro MCP Server

A Model Context Protocol (MCP) server that provides fuzzy search and retrieval functionality for Font Awesome Pro icons. Built with Node.js, TypeScript, and Express.

## Features

- **Fuzzy Search**: Find icons using intelligent search with Fuse.js
- **Icon Retrieval**: Get complete icon data including SVG content
- **MCP Compatible**: Standard JSON-RPC interface for MCP clients
- **Multiple Access Methods**: HTTP API, MCP protocol, and direct SVG endpoints
- **Font Awesome Pro Support**: Access to all Pro icon styles (solid, regular, light, thin, duotone)

## Prerequisites

- Node.js 18+ 
- Font Awesome Pro license with NPM access token configured in `~/.npmrc`:
  ```
  @fortawesome:registry=https://npm.fontawesome.com/
  //npm.fontawesome.com/:_authToken=YOUR_TOKEN_HERE
  ```

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd fontawesome-mcp

# Install dependencies (uses your FA Pro token automatically)
npm install

# Build the project
npm run build
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server runs on `http://localhost:8000` by default. Set `PORT` environment variable to change.

## API Endpoints

### Health Check
```bash
GET /health
```
Returns server status and timestamp.

### Simple HTTP API

#### Search Icons
```bash
POST /api/search
Content-Type: application/json

{
  "query": "home",
  "limit": 5,
  "style": "solid"  // optional: solid|regular|light|thin|duotone|brands
}
```

#### Get Specific Icon
```bash
POST /api/icon
Content-Type: application/json

{
  "name": "house-signal",
  "style": "solid"
}
```

### MCP JSON-RPC Protocol

#### List Available Tools
```bash
POST /rpc
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

#### Call a Tool
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

### Direct SVG Access
```bash
GET /svg/:style/:name.svg
```
Example: `http://localhost:8000/svg/solid/house-signal.svg`

## Available Tools

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

## Response Format

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

## Architecture

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

## Development

### Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run clean` - Remove build artifacts

### Key Dependencies
- **Express**: HTTP server framework
- **Fuse.js**: Fuzzy search implementation
- **js-yaml**: YAML parsing for FA metadata
- **zod**: Schema validation
- **@modelcontextprotocol/sdk**: MCP protocol support

## License

MIT

## Font Awesome Pro

This project requires Font Awesome Pro. Font Awesome Pro is a commercial product - ensure you have appropriate licensing for your use case.