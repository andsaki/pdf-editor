import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const link = new HttpLink({
  uri: 'http://localhost:4000/graphql'
});

export const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
});