import express, { Application } from 'express';
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
  if (token) {
    try {
      if (!process.env.JWT_SECRET_KEY) {
        throw new Error('JWT_SECRET_KEY is not defined in environment variables');
      }
      const user = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
      (req as any).user = user; // Temporary cast if needed
      console.log('Authenticated user from server.ts middleware call:', user);
    } catch (err) {
      console.warn('Invalid token');
    }
  }
  next();
});

// Function to start the server
const startServer = async () => {
  // Initialize Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }: { req: Express.Request }) => {
      // Pass the authenticated user to the context
      return { user: req.user };
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