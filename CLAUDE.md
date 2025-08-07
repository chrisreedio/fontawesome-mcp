# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload using tsx watch
- `npm run build` - Compile TypeScript to JavaScript in dist/ directory
- `npm start` - Run production server from dist/server.js
- `npm run clean` - Remove build artifacts from dist/ directory

## Architecture Overview

This is a Font Awesome Pro MCP (Model Context Protocol) server that provides icon search and retrieval functionality through multiple interfaces.

### Core Components

**FontAwesome Loader (`src/fa/loader.ts`)**
- Singleton class that manages Font Awesome Pro metadata and SVG loading
- Loads metadata from `@fortawesome/fontawesome-pro/metadata/icons.yml` using js-yaml
- Provides methods: `getAllIcons()`, `getIcon(name, style)`, `searchIcons(query)`
- Uses lazy loading for SVG files from FA Pro package
- Handles path resolution for ES modules environment

**MCP Methods (`src/methods/`)**
- `fuzzySearch.ts` - Uses Fuse.js for intelligent icon searching with configurable options
- `getIcon.ts` - Retrieves specific icons with complete SVG content
- Each method exports a standardized object with `name`, `description`, `inputSchema`, and `handler`
- Uses Zod schemas for parameter validation

**Server (`src/server.ts`)**
- Express server providing three interfaces:
  1. Simple HTTP API (`/api/search`, `/api/icon`) 
  2. MCP JSON-RPC protocol (`/rpc`) for MCP clients
  3. Direct SVG access (`/svg/:style/:name.svg`)
- Port configurable via PORT environment variable (default: 8000)

### Key Dependencies

**Font Awesome Pro Requirement**
- Requires `@fortawesome/fontawesome-pro` and all style packages
- Needs `.npmrc` configuration with FA Pro registry and auth token
- Metadata loaded from YAML files, SVGs from individual files

**Search Implementation**
- Fuse.js provides fuzzy search with weighted scoring on name, label, and search terms
- Single Fuse instance created lazily and reused for performance
- Configurable search options: query, limit, style filtering

### Types and Data Flow

**FAIcon Interface**
- `name`, `style` (required)
- `label`, `search.terms`, `unicode`, `svg` (optional)
- SVG field populated only when explicitly requested

**Icon Styles**
- Supports all FA Pro styles: solid, regular, light, thin, duotone, brands
- Style filtering available in search operations

### Testing Endpoints

**Health Check**: `GET /health`
**Search**: `POST /api/search` with `{query, limit?, style?}`
**Get Icon**: `POST /api/icon` with `{name, style}`
**MCP Tools List**: `POST /rpc` with `{method: "tools/list"}`
**MCP Tool Call**: `POST /rpc` with `{method: "tools/call", params: {name, arguments}}`