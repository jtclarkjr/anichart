import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { HttpLink } from '@apollo/client/link/http'

// AniList GraphQL endpoint - use proxy in development, direct in production
const httpLink = new HttpLink({
  uri: import.meta.env.DEV ? '/api/graphql' : 'https://graphql.anilist.co'
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
