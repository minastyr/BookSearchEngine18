import User from '../models/User.js';
import { AuthenticationError } from 'apollo-server';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { Context } from './context.js'; // Define a context type if not already defined
import { handleError } from '../utils/errorHandler.js'; // Adjust the import path as necessary

dotenv.config();

const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      try {
        const user = await User.findById(context.user._id).populate('savedBooks');
        if (!user) {
          throw new Error(`User not found with ID: ${context.user._id}`);
        }
        return user;
      } catch (err) {
        handleError(err, 'Failed to fetch user');
        return null;
      }
    },
  },

  Mutation: {
    login: async (_parent: any, { email, password }: { email: string; password: string }) => {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new AuthenticationError('Invalid credentials');
        }

        const isValid = await user.isCorrectPassword(password);
        if (!isValid) {
          throw new AuthenticationError('Invalid credentials');
        }

        const token = jwt.sign(
          { _id: user._id, email: user.email, username: user.username },
          process.env.JWT_SECRET_KEY || 'default_secret',
          { expiresIn: '10h' }
        );
        return { token, user };
      } catch (err) {
        handleError(err, 'Failed to log in');
        return null;
      }
    },

    addUser: async (_: unknown, { username, email, password }: { username: string; email: string; password: string }) => {
      if (!username || !email || !password) {
        throw new Error('All fields are required');
      }
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('Email is already in use');
        }

        const user = await User.create({ username, email, password });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY || '', { expiresIn: '10h' });
        return { token, user };
      } catch (err) {
        handleError(err, 'Failed to create user');
        return null;
      }
    },

    saveBook: async (
      _: unknown,
      { bookId, title, authors, description, image, link }: { bookId: string; title: string; authors: string[]; description: string; image: string; link: string },
      context: Context
    ) => {
      try {
        console.log('Context user:', context.user); // Debugging line
        console.log('Input variables:', { bookId, title, authors, description, image, link }); // Debugging line

        if (!context.user) {
          throw new AuthenticationError('Not logged in');
        }

        // Ensure HTTPS for image and link
        const ensureHttps = (url: string): string => {
          if (url && url.startsWith('http://')) {
            return url.replace('http://', 'https://');
          }
          return url;
        };

        const secureImage = ensureHttps(image);
        const secureLink = ensureHttps(link);

        // Check if the user exists
        const user = await User.findById(context.user._id).populate('savedBooks');
        console.log('User found in database:', user); // Debugging line
        if (!user) {
          throw new Error(`User not found with ID: ${context.user._id}`);
        }

        // Save the book to the user's savedBooks array
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          {
            $addToSet: {
              savedBooks: {
                bookId,
                title,
                authors,
                description,
                image: secureImage, // Use HTTPS-secured image
                link: secureLink,   // Use HTTPS-secured link
              },
            },
          },
          { new: true }
        );

        console.log('Updated user:', updatedUser); // Debugging line
        if (!updatedUser) {
          throw new Error('Failed to save book');
        }

        return updatedUser;
      } catch (err) {
        console.error('Error in saveBook resolver:', err); // Debugging line
        throw new Error('Failed to save book');
      }
    },

    removeBook: async (_: unknown, { bookId }: { bookId: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      if (!bookId) {
        throw new Error('Book ID is required');
      }
      try {
        const user = await User.findById(context.user._id).populate('savedBooks');
        if (!user) {
          throw new Error('User not found');
        }

        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');
        if (!updatedUser) {
          throw new Error('Failed to remove book');
        }
        return updatedUser;
      } catch (err) {
        handleError(err, 'Failed to remove book');
        return null;
      }
    },
  },
};

export default resolvers;