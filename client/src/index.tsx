import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import { onError } from '@apollo/client/link/error';
import { setLogVerbosity } from '@apollo/client';

setLogVerbosity('debug');

const httpLink = createHttpLink({
  uri: 'https://booksearchengine18.onrender.com/graphql',
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const authLink = setContext((_, { headers }) => {
  // Get the token from localStorage or another storage mechanism
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create Apollo Client
const client = new ApolloClient({
 // Ensure this matches your server's GraphQL endpoint
 link: authLink.concat(errorLink).concat(httpLink), 
  //link: errorLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>

  </React.StrictMode>
);