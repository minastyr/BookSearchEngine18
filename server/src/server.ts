import express, { Application, Request } from 'express';
//import * as Express from 'express';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';
import jwt from 'jsonwebtoken';
import db from './config/connection.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Catch-all route to serve the React app
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'));
});

// Middleware for authentication
app.use((req, _res, next) => {
  const token = req.headers.authorization || '';
  //console.log('Token from server.ts middleware:', token);

  if (token) {
    try {
      if (!process.env.JWT_SECRET_KEY) {
        throw new Error('JWT_SECRET_KEY is not defined in environment variables');
      }

      // Remove "Bearer " prefix if it exists
      const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

      const user = jwt.verify(actualToken, process.env.JWT_SECRET_KEY as string);
      (req as any).user = user; // Temporary cast if needed
      //console.log('Authenticated user from server.ts middleware call:', user);
    } catch (err) {
      console.warn('Invalid token-generated from server.ts middleware:', err);
      console.log('invalid user from server.ts middleware call:', (req as any).user);
    }
  }
  next();
});

// Function to verify token
const verifyToken = (token: string) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not defined in environment variables');
  }
  return jwt.verify(token, process.env.JWT_SECRET_KEY as string);
};

// Function to start the server
const startServer = async () => {
  // Initialize Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {

      // Use the correct type for the request
      const request = req as Request;
      
      // Get the token from the request headers
      const authHeader = request.headers.authorization || '';
      
      // Split only if authHeader is not empty
      let token = '';
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
      
      if (!token) {
        console.log('No authentication token provided');
        return { user: null };
      }

      try {
        console.log('Token being verified:', token);
        const user = verifyToken(token);
        console.log('User from token verification:', JSON.stringify(user));
        
        // Check if the user object has an _id property
        if (user && typeof user === 'object' && '_id' in user) {
          console.log('User has _id property:', user._id);
        } else {
          console.log('User object structure:', user);
          // If user doesn't have _id, create a modified user object with _id
          if (user && typeof user === 'object' && 'id' in user) {
            (user as any)._id = (user as any).id;
            console.log('Modified user object:', user);
          }
        }
        
        return { user };
      } catch (err) {
        console.error('Error verifying token in context:', err);
        return { user: null };
      }
    },
    cache: "bounded",
  });

  // Start Apollo Server
  await server.start();
  server.applyMiddleware({ app });

  // Start the Express server
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}${server.graphqlPath}`);
  });
};

// Connect to the database and start the server
db.once('open', () => {
  console.log('Connected to MongoDB');
  startServer();
});