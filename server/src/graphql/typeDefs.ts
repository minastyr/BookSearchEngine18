import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Book {
    
    _id: ID
    bookId: String!
    title: String!
    authors: [String]
    description: String
    image: String
    link: String
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedBooks: [Book]
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookId: String!, title: String!, authors: [String], description: String, image: String, link: String): User
    removeBook(bookId: String!): User
  }
`;

export default typeDefs;