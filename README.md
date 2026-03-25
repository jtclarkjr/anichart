# AniChart

A modern Vue.js application for browsing anime data using the AniList GraphQL API. Built with
TypeScript, Vue 3 Composition API, Apollo Client, and full Server-Side Rendering (SSR) support.

## Features

- **Search Anime**: Search through AniList's extensive anime database
- **Trending Anime**: View currently trending anime series
- **Detailed View**: Get comprehensive information about specific anime
- **Responsive Design**: Modern UI with SCSS styling
- **Fast Performance**: Built with Vite+ tooling for fast development and build performance
- **Server-Side Rendering**: Full SSR support with data prefetching for better SEO and performance
- **Mobile Friendly**: Responsive design that works on all devices
- **Hot Module Replacement**: Full HMR support even in SSR development mode

## Tech Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Runtime**: Bun (SSR development and production servers)
- **State Management**: Pinia with SSR state hydration
- **Routing**: Vue Router with auto-generated typed routes
- **GraphQL Client**: Apollo Client with SSR support
- **Build Tool**: Vite+ (`vp`) with SSR bundling
- **Styling**: SCSS
- **Server-Side Rendering**: Custom Bun-powered SSR with data prefetching
- **Testing**: Vite+ test runner with jsdom
- **Linting**: Oxlint via `vp lint`
- **Formatting**: Oxfmt via `vp fmt`
- **Type Checking**: `@typescript/native-preview` via `tsgo`
- **Auto Import**: Unplugin Auto Import for Vue composition functions

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── AnimeCard.vue    # Anime card component
│   ├── AnimeBanner.vue  # Anime banner component
│   ├── AnimeDescription.vue
│   └── SearchFilters.vue
├── pages/               # Auto-generated routes
│   ├── anime/
│   │   ├── index.vue    # Anime listing page
│   │   └── [id].vue     # Dynamic anime detail page
│   └── index.ts         # Router configuration
├── stores/              # Pinia stores
│   └── anime.ts         # Anime-related state management
├── utils/
│   ├── api/             # API related utilities
│   │   ├── queries.ts   # GraphQL queries
│   │   └── anime.api.ts # Anime API functions
│   ├── helpers/         # Utility functions
│   │   ├── debounce.ts
│   │   └── throttle.ts
│   └── types/           # TypeScript type definitions
│       ├── anilist.ts   # AniList API types
│       ├── ssr.ts       # SSR type definitions
│       └── index.ts
├── plugins/
│   └── apollo.ts        # Apollo Client configuration (SSR compatible)
├── App.vue              # Root component
├── main.ts              # Client-side entry point
├── entry-client.ts      # Client-side hydration entry
└── entry-server.ts      # Server-side rendering entry

# SSR Server Files (TypeScript)
dev-unified.ts           # Unified development server (SSR + HMR)
dev-ssr.ts              # Legacy SSR development server
server.ts               # Simple SSR development server
server-prod.ts          # Production SSR server
```

## Getting Started

### Prerequisites

- **Bun** (v1.3 or higher) - [Install Bun](https://bun.sh/)

### Installation

1. Install dependencies:

```bash
bun install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

The `.env` file should contain:

```
ANILIST_API_URL=https://graphql.anilist.co
```

## Development Modes

### SSR Development (Recommended)

Run the unified development server with full SSR, HMR, and asset serving:

```bash
bun run dev:ssr
```

- **URL**: `http://localhost:5174`
- **Features**: Server-side rendering, data prefetching, hot module replacement
- **Best for**: Production-like development experience with SEO benefits

### SPA Development

Run the client-only Vite+ development server:

```bash
vp dev
```

- **URL**: `http://localhost:5173`
- **Features**: Fast HMR, client-side routing
- **Best for**: Quick development iterations and component testing

## Architecture & Key Files

### Project Architecture

This is a **Universal Vue 3 application** that supports both Server-Side Rendering (SSR) and
Single-Page Application (SPA) modes.

```
┌─────────────────────────────────────────────────────────────┐
│                    AniChart Application                     │
├─────────────────┬───────────────────┬─────────────────────┤
│   Development   │    Production     │   Client Only       │
│                 │                   │                     │
│ ┌─────────────┐ │ ┌───────────────┐ │ ┌─────────────────┐ │
│ │Unified Dev  │ │ │Production SSR │ │ │Vite+ Dev Server │ │
│ │Server       │ │ │Server         │ │ │(SPA Mode)       │ │
│ │:5174        │ │ │:8080          │ │ │:5173            │ │
│ │             │ │ │               │ │ │                 │ │
│ │• SSR + HMR  │ │ │• Static Assets│ │ │• Hot Reload     │ │
│ │• Asset Srv  │ │ │• SSR Rendering│ │ │• Client Routing │ │
│ │• GraphQL    │ │ │• GraphQL API  │ │ │• Dev Tools      │ │
│ └─────────────┘ │ └───────────────┘ │ └─────────────────┘ │
└─────────────────┴───────────────────┴─────────────────────┘
```

### Key Files Explained

#### Server Files (SSR)

- **`server-prod.ts`** - Production SSR server using Bun
  - Serves static assets from `dist/client/`
  - Handles SSR for all non-asset routes
  - Binds to `0.0.0.0:8080` for external access
- **`dev-unified.ts`** - Development server with SSR + HMR
  - Proxy setup for seamless development experience
  - Combines the `vp dev` server with the Bun SSR server
- **`server.ts`** - Simple SSR development server
  - Basic SSR without HMR integration

#### Entry Points

- **`src/main.ts`** - Standard Vue 3 client-side entry (SPA mode)
- **`src/entry-client.ts`** - Client-side hydration entry (SSR mode)
- **`src/entry-server.ts`** - Server-side rendering entry
  - Creates Vue app instance for each request
  - Handles data prefetching with `onServerPrefetch`
  - Manages Pinia store hydration

#### Configuration Files

- **`vite.config.mts`** - Vite+ configuration with SSR support
  - Defines build-time environment variables
  - Configures separate client/server builds
  - Sets up development proxy for GraphQL
- **`Dockerfile`** - Multi-stage Docker build
  - Build stage: Installs deps, sets env vars, builds app
  - Runtime stage: Copies artifacts, exposes port, runs server

#### API Layer

- **`src/plugins/apollo.ts`** - Apollo Client configuration
  - **Hybrid environment variable access** (critical for deployment)
  - Development proxy vs production direct API calls
  - SSR-compatible client setup
- **`src/utils/api/`** - API abstraction layer
  - GraphQL queries and mutations
  - Type-safe API functions
  - Error handling and caching

### How SSR Works

This application uses a **hybrid rendering approach** that supports both client-side (SPA) and
server-side rendering (SSR):

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │   Production    │    │   Client Side   │
│                 │    │                 │    │                 │
│  Unified Server │    │  Production     │    │  Vite+ Dev      │
│  (dev-unified)  │    │  SSR Server     │    │  Server (SPA)   │
│                 │    │  (server-prod)  │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Vite+ Dev    │ │    │ │Static Assets│ │    │ │Hot Reload   │ │
│ │Server       │ │    │ │Serving      │ │    │ │Client Routes│ │
│ │:5173        │ │    │ │             │ │    │ │:5173        │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │                 │
│ │SSR Server   │ │    │ │SSR Rendering│ │    │                 │
│ │:5174        │ │    │ │:3000        │ │    │                 │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **SSR Request**: Browser requests a page (e.g., `/anime/123`)
2. **Server Processing**:
   - Server creates fresh Vue app instance
   - Router navigates to the requested route
   - `onServerPrefetch()` runs and fetches data from AniList API
   - Pinia store is populated with fetched data
   - Vue renders the component to HTML string
3. **HTML Response**: Server sends complete HTML with:
   - Rendered content (visible immediately)
   - Serialized Pinia state (for hydration)
   - Client-side script references
4. **Client Hydration**:
   - Client-side JavaScript loads
   - Vue app rehydrates using server state
   - Full interactivity is restored

### Benefits of This Approach

- ** Fast Initial Load**: Content is visible immediately (no loading spinners)
- ** SEO Friendly**: Search engines see fully rendered HTML
- ** Better UX**: Works even with JavaScript disabled initially
- ** Progressive Enhancement**: Enhances to full SPA after hydration
- ** Development DX**: HMR works seamlessly in SSR mode

## Available Scripts

### Development Commands

- **`vp dev:ssr`** - **Unified SSR development** (recommended)
  - Starts the Bun SSR server and the `vp dev` asset server together
  - Full HMR, asset serving, and server-side rendering
  - Visit `http://localhost:5174`

- **`vp dev`** - **SPA development**
  - Runs `vp dev` for client-only development
  - Visit `http://localhost:5173`

- **`vp dev:ssr:simple`** - 🔨 **Simple SSR** (requires separate asset server)
  - SSR server only, requires running `bun run dev` separately
  - Visit `http://localhost:5174`

### Production Commands

- **`bun run build`** - **Full SSR build with checks**
  - Runs tests, lint, format checks, native-preview typechecks, and SSR builds

- **`bun run build:ssr`** - **Build for SSR production**
  - Builds both client bundle and SSR server bundle
  - Outputs to `dist/client/` and `dist/server/`

- **`bun run build:client`** - Build the client bundle only
- **`bun run build:server`** - Build the SSR entry bundle only

- **`bun run start`** - **Production SSR server**
  - Serves static assets and handles SSR
  - Visit `http://localhost:3000`

- **`bun run preview:ssr`** - Build SSR bundles and start the Bun production server
- **`bun run build-only`** - Build the client bundle without running checks

### Quality Commands

- **`vp test:unit`** - Run unit tests with the Vite+ test runner
- **`vp lint`** - Run oxlint
- **`vp fmt`** - Format the repo with oxfmt
- **`vp fmt:check`** - Verify formatting without writing changes
- **`vp typecheck`** - Run native-preview typechecks for app and node targets
- **`vp pre-build`** - Run tests, lint, format checks, and typechecks

## GraphQL Queries

The application uses several GraphQL queries to interact with the AniList API:

- **GET_ANIME_LIST** - Fetch paginated list of anime with filtering options
- **GET_ANIME_DETAILS** - Get detailed information about a specific anime
- **SEARCH_ANIME** - Search for anime by title
- **GET_TRENDING_ANIME** - Fetch currently trending anime

## Configuration

### TypeScript Configuration

- Native-preview typechecking through `@typescript/native-preview` and `tsgo`
- Modern ES2022 target with strict type checking
- Path aliases configured through `paths` (no `baseUrl`)
- Separate configurations for app, Bun/node-side scripts, and Vitest

### Tooling Configuration

- `vp lint` runs oxlint with Vue and TypeScript rules
- `vp fmt` runs oxfmt for repository formatting
- `vp test` handles unit tests in `jsdom`

## Production Deployment

### SSR Deployment (Recommended)

This application uses a hybrid approach where both **build-time** and **runtime** environment
variables are needed for proper operation.

#### Understanding Environment Variable Requirements

**Critical**: This app requires `ANILIST_API_URL` at TWO different stages:

1. **Build-time**: For the client bundle (Vite+ processes `import.meta.env`)
2. **Runtime**: For server-side rendering on Bun

#### Step-by-Step Deployment

1. **Prepare Environment Variables**:

   **For Build Process** (required during `bun run build:ssr`):

   ```bash
   export ANILIST_API_URL=https://graphql.anilist.co
   ```

   **For Runtime** (required when running the server):

   ```bash
   export ANILIST_API_URL=https://graphql.anilist.co
   export PORT=8080  # or your preferred port
   ```

2. **Build the application**:

   ```bash
   # Ensure build-time env vars are available
   export ANILIST_API_URL=https://graphql.anilist.co

   # Build both client and server bundles
   bun run build:ssr
   ```

   This creates:
   - `dist/client/` - Static assets and client-side JavaScript
   - `dist/server/` - Server-side rendering bundle (entry-server.js)

3. **Deploy and run the SSR server**:

   ```bash
   # Runtime environment variables
   export ANILIST_API_URL=https://graphql.anilist.co
   export PORT=8080
   export NODE_ENV=production

   # Start the production server
   bun run start
   ```

4. **Server Configuration Details**:
   - **Runtime**: Bun (v1.3+)
   - **Port**: Defaults to 8080, configurable via `PORT` env var
   - **Host Binding**: Binds to `0.0.0.0` for external access
   - **Static Assets**: Serves from `dist/client/` directory
   - **SSR**: Handles server-side rendering for all non-asset routes

#### Docker Deployment

A complete `Dockerfile` is included in the project root with multi-stage build configuration:

- **Build stage**: Installs dependencies, sets build-time environment variables, and builds the SSR
  bundle
- **Runtime stage**: Copies built artifacts and runs the production server on port 8080

**Docker commands**:

```bash
# Build image
docker build -t anichart .

# Run container with runtime env vars
docker run -p 8080:8080 \
  -e ANILIST_API_URL=https://graphql.anilist.co \
  -e PORT=8080 \
  anichart
```

#### Platform-Specific Deployment Examples

**Cloud Platforms** (Railway, Render, Digital Ocean App Platform, etc.):

```bash
# Set both build-time and runtime environment variables:
# ANILIST_API_URL=https://graphql.anilist.co
# PORT=8080 (or auto-provided by platform)
```

**VPS / Traditional Server**:

```bash
# 1. Set up environment file
echo "ANILIST_API_URL=https://graphql.anilist.co" > .env.production
echo "PORT=8080" >> .env.production

# 2. Load environment and build
source .env.production
bun run build:ssr

# 3. Run with process manager (PM2, systemd, etc.)
PORT=8080 ANILIST_API_URL=https://graphql.anilist.co bun run start
```

**Vercel** (SSR Functions):

```typescript
// api/index.ts - Serverless function
export default async function handler(req, res) {
  // Your SSR server code here
  // Environment variables available via process.env
}
```

### SPA Deployment (Static)

1. **Build for static hosting**:

   ```bash
   bun run build-only
   ```

2. **Deploy static files**:
   - Upload `dist/` directory to any static hosting service
   - Works with Netlify, Vercel, GitHub Pages, etc.
   - Configure routing to serve `index.html` for all routes

### Environment Variables

| Variable          | Required | Build-Time | Runtime | Description              | Default                      |
| ----------------- | -------- | ---------- | ------- | ------------------------ | ---------------------------- |
| `ANILIST_API_URL` | Yes      | Yes        | Yes     | AniList GraphQL endpoint | `https://graphql.anilist.co` |
| `PORT`            | No       | No         | Yes     | Server port (production) | `8080`                       |
| `NODE_ENV`        | No       | Yes        | Yes     | Environment mode         | `development`                |

**Important Notes**:

- `ANILIST_API_URL` must be available at **both** build-time and runtime
- Build-time variables are compiled into the client bundle by Vite+
- Runtime variables are accessed by the SSR server via `process.env`
- Missing build-time variables will cause client-side errors
- Missing runtime variables will cause SSR errors

## Troubleshooting

### Common Deployment Checklist

- **Environment variables**: Ensure `ANILIST_API_URL` is set at both build-time and runtime
- **Port configuration**: Server should bind to `0.0.0.0` for external access
- **Build artifacts**: Verify `dist/client/` and `dist/server/` directories exist after build
- **Network access**: Ensure the application can reach the AniList GraphQL API

### Debugging Steps

1. **Test locally first**:

   ```bash
   bun run build:ssr
   bun run start
   # Visit http://localhost:8080
   ```

2. **Check environment variables**:

   ```bash
   echo $ANILIST_API_URL
   echo $PORT
   ```

3. **Review server logs** for any runtime errors

4. **Verify the build output** contains both client and server bundles

## Development Guidelines

- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Utilize auto-imports for common Vue functions
- Write unit tests for critical functionality
- Follow the established linting and formatting rules
- Always test SSR builds locally before deploying
- Verify environment variables at both build-time and runtime

## License

This project is private and not licensed for public use.

## API Attribution

This application uses data from [AniList](https://anilist.co/), a community-driven anime and manga
database.
