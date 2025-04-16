import { gql } from '@apollo/client';

// Queries
export const GET_ME = gql`
  query GetMe {
    me {
      _id
      username
      email
      savedBooks {
        _id
        title
        authors
        description
        image
        link
      }
    }
  }
`;

// Mutations
export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const ADD_USER = gql`
  mutation AddUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const SAVE_BOOK = gql`
  mutation SaveBook($bookId: String!, $title: String!, $authors: [String], $description: String, $image: String, $link: String) {
    saveBook(bookId: $bookId, title: $title, authors: $authors, description: $description, image: $image, link: $link) {
      _id
      username
      email
      savedBooks {
        bookId
        title
        authors
        description
        image
        link
      }
    }
  }
`;

export const REMOVE_BOOK = gql`
  mutation RemoveBook($bookId: String!) {
    removeBook(bookId: $bookId) {
      _id
      username
      email
      savedBooks {
        bookId
        title
        authors
        description
        image
        link
      }
    }
  }
`;