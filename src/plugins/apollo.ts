import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { HttpLink } from '@apollo/client/link/http'

// Determine the GraphQL endpoint based on environment
const getGraphQLUri = (): string => {
  // In production (or server-side), use the direct AniList URL
  // For runtime access (like in production), use process.env
  // For build-time access (like in development), use import.meta.env
  // For client-side in production SSR, use window.__ENV__ passed from server
  const apiUrl =
    (typeof process !== 'undefined' ? process.env.ANILIST_API_URL : undefined) ||
    import.meta.env.ANILIST_API_URL ||
    (typeof window !== 'undefined' && window.__ENV__ ? window.__ENV__.ANILIST_API_URL : undefined)

  if (!apiUrl) {
    throw new Error('ANILIST_API_URL environment variable is not set')
  }

  // In development on client-side, use the proxy to avoid CORS issues
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return '/api/graphql'
  }

  // For server-side (SSR) or production, use the direct URL
  // console.log('ANILIST_API_URL:', apiUrl)
  return apiUrl
}

const graphqlUri = getGraphQLUri()
// console.log('Using GraphQL URI:', graphqlUri)

// AniList GraphQL endpoint - use proxy in development, direct in production
const httpLink = new HttpLink({
  uri: graphqlUri,
  fetch: (uri, options) => {
    // console.log('Making GraphQL request to:', uri)
    return fetch(uri, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Add User-Agent for server-side requests
        ...(typeof window === 'undefined' && {
          'User-Agent': 'AniChart SSR/1.0'
        }),
        ...options?.headers
      }
    }).catch((error) => {
      console.error('GraphQL fetch error:', error)
      throw error
    })
  }
})

// Create the Apollo Client instance
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          Page: {
            // Always replace Page data instead of merging
            merge: false
          }
        }
      },
      Page: {
        keyFields: false,
        fields: {
          media: {
            // Always replace media array instead of merging
            merge: false
          }
        }
      },
      Media: {
        keyFields: ['id']
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all'
    }
  }
})
