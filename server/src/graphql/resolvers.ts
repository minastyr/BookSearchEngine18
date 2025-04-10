import User from '../models/User.js';
import { AuthenticationError } from 'apollo-server';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { Context } from './context.js'; // Define a context type if not already defined
dotenv.config();

const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      try {
        const user = await User.findById(context.user.id).populate('savedBooks');
        return user;
      } catch (err) {
        console.error('Error fetching user:', err);
        throw new Error('Failed to fetch user');
      }
    },
  },
  Mutation: {
    login: async (_parent: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const isValid = await user.isCorrectPassword(password);
      if (!isValid) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = jwt.sign({ _id: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET_KEY || 'default_secret', { expiresIn: '1h' });
      return { token, user };
    },
    addUser: async (_: unknown, { username, email, password }: { username: string; email: string; password: string }) => {
      const user = await User.create({ username, email, password });
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY || '', { expiresIn: '2h' });
      return { token, user };
    },
    saveBook: async (
      _: unknown,
      { bookId, title, authors, description, image, link }: { bookId: string; title: string; authors: string[]; description: string; image: string; link: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      const updatedUser = await User.findByIdAndUpdate(
        context.user.id,
        { $addToSet: { savedBooks: { bookId, title, authors, description, image, link } } },
        { new: true }
      ).populate('savedBooks');
      return updatedUser;
    },
    removeBook: async (_: unknown, { bookId }: { bookId: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      const updatedUser = await User.findByIdAndUpdate(
        context.user.id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      ).populate('savedBooks');
      return updatedUser;
    },
  },
};

export default resolvers;