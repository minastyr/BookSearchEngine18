import { ReactNode } from 'react';


import { ApolloClient, InMemoryCache, ApolloProvider as Provider } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_URI || 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  headers: {
    authorization: `Bearer ${localStorage.getItem('id_token') || ''}`,
  },
});


interface ApolloProviderProps {
  children: ReactNode;
}

const ApolloProvider: React.FC<ApolloProviderProps> = ({ children }) => {
  return <Provider client={client}>{children}</Provider>;
};

export default ApolloProvider;