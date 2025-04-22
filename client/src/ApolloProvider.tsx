import { ReactNode } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider as Provider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "https://booksearchengine18.onrender.com/graphql",
});

console.log("HTTP Link Created at:", process.env.REACT_APP_GRAPHQL_URI); // Debugging line

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  console.log("AuthLink Middleware Executed"); // Debugging line
  console.log("Token:", token); // Debugging line
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

interface ApolloProviderProps {
  children: ReactNode;
}

const ApolloProvider: React.FC<ApolloProviderProps> = ({ children }) => {
  return <Provider client={client}>{children}</Provider>;
};

export default ApolloProvider;
