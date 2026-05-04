# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build       # Compile TypeScript to dist/
npm run dev         # Run directly with ts-node (no build needed)
npm start           # Run compiled output from dist/
npm test            # Run all tests
npm run lint        # ESLint
```

Run a single test file:
```bash
npm test -- tests/test_server.ts
```

## Architecture

This is an MCP (Model Context Protocol) server that bridges AI assistants (Claude, etc.) with the [Noko time tracking API](https://api.nokotime.com/v2).

**Entry point:** `src/index.ts` → calls `runServer()` from `src/nokotime/server.ts`

**Core components:**
- `NokoServer` (`server.ts`) — creates the MCP server, validates `NOKO_API_TOKEN`, and wires up all tools and resources
- `NokoApi` (`noko-api.ts`) — axios-based HTTP client for Noko API v2; all API calls go through `NokoApi.request()`; handles pagination via Link headers
- `tools/entries.ts` — 8 tools for time entry CRUD plus date-range convenience queries
- `tools/projects.ts` — project listing/search
- `tools/users.ts` — user listing
- `resources/index.ts` — MCP resources providing URI-based read access (`noko://users`, `noko://projects`, `noko://entries`, etc.)
- `utils/date-ranges.ts` — helpers for preset date ranges (`past_week`, `past_month`, `current_week`, `current_month`)

**Data flow:** MCP client → `NokoServer` (Zod-validated tool call) → `NokoApi.request()` → Noko API → formatted MCP response

**Key patterns:**
- All tool inputs are validated with Zod schemas defined inline alongside each tool registration
- Destructive operations (edit, delete entries) require explicit confirmation parameters
- ESM (`"type": "module"`), targeting ES2022/NodeNext — use `.js` extensions in relative imports even for `.ts` source files
- `NOKO_API_TOKEN` env var is required; validated at startup with a clear error message

## Releasing

`dist/` is intentionally committed to git — it's required for `npx github:Lullabot/mcp-nokotime` to work without users needing to build from source. Always run `npm run build` and commit the updated `dist/` alongside any source changes.
