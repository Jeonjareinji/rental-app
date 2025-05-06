import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, AuthTokenPayload } from "./storage";
import * as schema from "./../shared/schema";
import { z } from "zod";
import { db } from "./../db";
import { and, eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

// Middleware to verify JWT token and authenticate user
const authenticateJWT = async (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];
  const payload = storage.verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  req.user = payload;
  next();
};

// Middleware to check if user is a property owner
const isPropertyOwner = (req: Request, res: Response, next: Function) => {
  if (!req.user || req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Forbidden: Only property owners can perform this action' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const apiPrefix = '/api';

  // Auth routes
  // In your routes.ts
  app.post(`${apiPrefix}/auth/register`, async (req, res) => {
    try {
      // Validate input
      const userData = schema.insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({
          message: 'Email already registered',
          field: 'email'
        });
      }

      // Register new user
      const user = await storage.registerUser(userData);
      const token = storage.generateToken(user);

      // Return success response
      return res.status(201).json({
        message: 'Registration successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      });

    } catch (error) {
      console.error('Registration error:', error);

      // Handle validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }

      // Handle database errors
      if (error instanceof Error && error.message.includes('unique constraint')) {
        return res.status(400).json({
          message: 'Username or email already exists'
        });
      }

      // Generic error response
      return res.status(500).json({
        message: 'Registration failed. Please try again.'
      });
    }
  });

  app.post(`${apiPrefix}/auth/login`, async (req, res) => {
    try {
      const credentials = schema.userSignInSchema.parse(req.body);
      const user = await storage.validateUser(credentials.email, credentials.password);

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = storage.generateToken(user);

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get(`${apiPrefix}/auth/me`, authenticateJWT, async (req, res) => {
    try {
      const user = await storage.getUserById(req.user!.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.patch(`${apiPrefix}/users/:id`, authenticateJWT, async (req, res) => {
    try {
      // Validate the user can only update their own profile
      if (Number(req.params.id) !== req.user?.userId) {
        return res.status(403).json({
          message: 'Forbidden: You can only update your own profile'
        });
      }

      // Validate input
      const updateSchema = z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters"),
        email: z.string().email("Must be a valid email"),
      });

      const validatedData = updateSchema.parse(req.body);

      // Check if email is already taken by another user
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser && existingUser.id !== req.user.userId) {
        return res.status(400).json({
          message: 'Email already in use by another account',
          field: 'email'
        });
      }

      // Update user in database
      const updatedUser = await db.update(schema.users)
        .set({
          fullName: validatedData.fullName,
          email: validatedData.email,
          updatedAt: new Date()
        })
        .where(eq(schema.users.id, req.user.userId))
        .returning();

      if (!updatedUser[0]) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return updated user data (excluding sensitive fields)
      return res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser[0].id,
          username: updatedUser[0].username,
          fullName: updatedUser[0].fullName,
          email: updatedUser[0].email,
          role: updatedUser[0].role
        }
      });

    } catch (error) {
      console.error('Update user error:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }

      return res.status(500).json({
        message: 'Failed to update profile. Please try again.'
      });
    }
  });

  // Properties routes
  app.get(`${apiPrefix}/properties`, async (req, res) => {
    try {
      const location = req.query.location as string | undefined;
      const type = req.query.type as string | undefined;
      const minPriceStr = req.query.minPrice as string | undefined;
      const maxPriceStr = req.query.maxPrice as string | undefined;

      const minPrice = minPriceStr ? parseInt(minPriceStr) : undefined;
      const maxPrice = maxPriceStr ? parseInt(maxPriceStr) : undefined;

      const properties = await storage.searchProperties({
        location,
        type,
        minPrice,
        maxPrice
      });

      return res.status(200).json({ properties });
    } catch (error) {
      console.error('Get properties error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get(`${apiPrefix}/properties/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }

      const property = await storage.getPropertyById(id);

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      return res.status(200).json({ property });
    } catch (error) {
      console.error('Get property error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get(`${apiPrefix}/my-properties`, authenticateJWT, isPropertyOwner, async (req, res) => {
    try {
      const properties = await storage.getPropertiesByOwner(req.user!.userId);
      return res.status(200).json({ properties });
    } catch (error) {
      console.error('Get my properties error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post(`${apiPrefix}/properties`, authenticateJWT, isPropertyOwner, async (req, res) => {
    try {
      const propertyData = schema.insertPropertySchema.parse({
        ...req.body,
        ownerId: req.user!.userId
      });

      const property = await storage.createProperty(propertyData);

      return res.status(201).json({
        message: 'Property created successfully',
        property
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      console.error('Create property error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put(`${apiPrefix}/properties/:id`, authenticateJWT, isPropertyOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }

      // Only validate the fields that are provided
      const propertyData = req.body;

      const updatedProperty = await storage.updateProperty(id, req.user!.userId, propertyData);

      if (!updatedProperty) {
        return res.status(404).json({
          message: 'Property not found or you do not have permission to update it'
        });
      }

      return res.status(200).json({
        message: 'Property updated successfully',
        property: updatedProperty
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      console.error('Update property error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete(`${apiPrefix}/properties/:id`, authenticateJWT, isPropertyOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }

      const success = await storage.deleteProperty(id, req.user!.userId);

      if (!success) {
        return res.status(404).json({
          message: 'Property not found or you do not have permission to delete it'
        });
      }

      return res.status(200).json({
        message: 'Property deleted successfully'
      });
    } catch (error) {
      console.error('Delete property error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Messages routes
  app.get(`${apiPrefix}/messages`, authenticateJWT, async (req, res) => {
    try {
      const messages = await storage.getMessagesByUser(req.user!.userId);
      return res.status(200).json({ messages });
    } catch (error) {
      console.error('Get messages error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Di routes.ts (backend)
  app.get(`${apiPrefix}/messages/unread-count`, authenticateJWT, async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.user!.userId);
      res.json({ count });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post(`${apiPrefix}/messages/mark-as-read`, authenticateJWT, async (req, res) => {
    try {
      const { senderId } = req.body;
      await db.update(schema.messages)
        .set({ read: true })
        .where(
          and(
            eq(schema.messages.senderId, senderId),
            eq(schema.messages.receiverId, req.user!.userId),
            eq(schema.messages.read, false)
          )
        );
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ message: 'Failed to mark messages as read' });
    }
  });

  app.get(`${apiPrefix}/messages/conversation/:userId/:propertyId`, authenticateJWT, async (req, res) => {
    try {
      const otherUserId = parseInt(req.params.userId);
      const propertyId = parseInt(req.params.propertyId);

      if (isNaN(otherUserId) || isNaN(propertyId)) {
        return res.status(400).json({ message: 'Invalid user ID or property ID' });
      }

      const conversation = await storage.getConversation(req.user!.userId, otherUserId, propertyId);

      // Tetap pertahankan mark as read di endpoint ini
      await storage.markMessagesAsRead(otherUserId, req.user!.userId); // Perhatikan urutan parameter

      return res.status(200).json({ messages: conversation });
    } catch (error) {
      console.error('Get conversation error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete(`${apiPrefix}/messages/conversation/:userId/:propertyId`, authenticateJWT, async (req, res) => {
    try {
      const otherUserId = parseInt(req.params.userId);
      const propertyId = parseInt(req.params.propertyId);

      if (isNaN(otherUserId) || isNaN(propertyId)) {
        return res.status(400).json({ message: 'Invalid user ID or property ID' });
      }

      const success = await storage.deleteConversation(req.user!.userId, otherUserId, propertyId);

      if (success) {
        return res.status(200).json({ message: 'Conversation deleted successfully' });
      } else {
        return res.status(500).json({ message: 'Failed to delete conversation' });
      }
    } catch (error) {
      console.error('Delete conversation error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post(`${apiPrefix}/messages`, authenticateJWT, async (req, res) => {
    try {
      const messageData = schema.insertMessageSchema.parse({
        ...req.body,
        senderId: req.user!.userId
      });

      // Validate that receiver and property exist
      const receiverId = Number(messageData.receiverId);
      const receiver = await storage.getUserById(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: 'Recipient not found' });
      }

      const propertyId = Number(messageData.propertyId);
      const property = await storage.getPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      const message = await storage.sendMessage(messageData);

      return res.status(201).json({
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      console.error('Send message error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  return httpServer;
}
