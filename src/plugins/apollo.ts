import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { HttpLink } from '@apollo/client/link/http'

// Determine the GraphQL endpoint based on environment
const getGraphQLUri = (): string => {
  // In development, use the proxy to avoid CORS issues
  if (import.meta.env.DEV) {
    return '/api/graphql'
  }
  
  // In production, use the environment variable or fallback
  const apiUrl = import.meta.env.ANILIST_API_URL
  console.log('ANILIST_API_URL:', apiUrl)
  
  if (!apiUrl) {
    throw new Error('ANILIST_API_URL environment variable is not set')
  }
  
  return apiUrl
}

const graphqlUri = getGraphQLUri()
console.log('Using GraphQL URI:', graphqlUri)

// AniList GraphQL endpoint - use proxy in development, direct in production
const httpLink = new HttpLink({
  uri: graphqlUri,
  fetch: (uri, options) => {
    console.log('Making GraphQL request to:', uri)
    return fetch(uri, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers
      }
    }).catch(error => {
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
