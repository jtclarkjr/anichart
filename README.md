# AniChart

A modern Vue.js frontend application for browsing anime data using the AniList GraphQL API. Built with TypeScript, Vue 3 Composition API, and Apollo Client.

## Features

- 🔍 **Search Anime**: Search through AniList's extensive anime database
- 📊 **Trending Anime**: View currently trending anime series
- 🎯 **Detailed View**: Get comprehensive information about specific anime
- 🎨 **Responsive Design**: Modern UI with SCSS styling
- ⚡ **Fast Performance**: Built with Vite for optimal development and build performance
- 📱 **Mobile Friendly**: Responsive design that works on all devices

## Tech Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **State Management**: Pinia
- **Routing**: Vue Router with auto-generated typed routes
- **GraphQL Client**: Apollo Client
- **Build Tool**: Vite
- **Styling**: SCSS
- **Testing**: Vitest with jsdom
- **Linting**: ESLint with Prettier integration
- **Auto Import**: Unplugin Auto Import for Vue composition functions

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── AnimeCard.vue    # Anime card component
│   ├── AnimeBanner.vue  # Anime banner component
│   ├── AnimeDescription.vue
│   └── SearchFilters.vue
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
│       └── index.ts
├── plugins/
│   └── apollo.ts        # Apollo Client configuration
├── App.vue              # Root component
└── main.ts              # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
bun install
```

2. Start the development server:

```bash
bun dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `bun dev` - Start development server with hot reload
- `bun build` - Build the application for production (includes linting, testing, and formatting)
- `bun build-only` - Build without pre-build checks
- `bun pre-build` - Run tests, linting, and formatting
- `bun test:unit` - Run unit tests with Vitest
- `bun lint` - Run ESLint and Stylelint
- `bun lint:es` - Run ESLint only
- `bun lint:style` - Run Stylelint with auto-fix
- `bun prettier:fix` - Format code with Prettier

## GraphQL Queries

The application uses several GraphQL queries to interact with the AniList API:

- **GET_ANIME_LIST** - Fetch paginated list of anime with filtering options
- **GET_ANIME_DETAILS** - Get detailed information about a specific anime
- **SEARCH_ANIME** - Search for anime by title
- **GET_TRENDING_ANIME** - Fetch currently trending anime

## Configuration

### TypeScript Configuration

- Modern ES2022 target with strict type checking
- Path aliases configured for clean imports
- Separate configurations for app, Node.js, and Vitest

### ESLint Configuration

- Vue 3 and TypeScript rules
- Prettier integration for consistent formatting
- Vitest plugin for test file linting

### Stylelint Configuration

- SCSS support with rational ordering
- Vue SFC style block support
- Recommended configurations for modern CSS

## Build and Deployment

The production build process includes:

1. Unit test execution
2. ESLint and Stylelint checks
3. Prettier code formatting
4. Vite production build with optimizations

Build output will be in the `dist/` directory, ready for deployment to any static hosting service.

## Development Guidelines

- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Utilize auto-imports for common Vue functions
- Write unit tests for critical functionality
- Follow the established linting and formatting rules

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the development guidelines
4. Run the pre-build checks: `npm run pre-build`
5. Submit a pull request

## License

This project is private and not licensed for public use.

## API Attribution

This application uses data from [AniList](https://anilist.co/), a community-driven anime and manga database.
