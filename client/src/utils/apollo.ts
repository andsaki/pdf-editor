import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const link = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  fetchOptions: {
    timeout: 30000, // 30秒のタイムアウト (Playwright起動時間を考慮)
  },
});

export const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: {
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
    },
  },
});