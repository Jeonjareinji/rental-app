import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, or, desc, sql, like } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "homeFinderSecretKey";
const SALT_ROUNDS = 10;

export interface AuthTokenPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
}

export const storage = {
  // Auth methods
  async registerUser(userData: schema.InsertUser): Promise<schema.User> {
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const [user] = await db.insert(schema.users)
      .values({
        ...userData,
        password: hashedPassword
      })
      .returning();

    return user;
  },

  async validateUser(email: string, password: string): Promise<schema.User | null> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });

    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;

    return user;
  },

  generateToken(user: schema.User): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  },

  verifyToken(token: string): AuthTokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    } catch (error) {
      return null;
    }
  },

  async getUserById(id: number): Promise<schema.User | null> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
    return user ?? null; // Convert undefined to null
  },

  async getUserByEmail(email: string): Promise<schema.User | null> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });
    return user ?? null; // Convert undefined to null
  },

  async updateUser(
    userId: number,
    updateData: { fullName?: string; email?: string }
  ): Promise<schema.User | null> {
    const [updatedUser] = await db.update(schema.users)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();

    return updatedUser || null;
  },

  // Property methods
  async getAllProperties(): Promise<schema.Property[]> {
    return await db.query.properties.findMany({
      orderBy: [desc(schema.properties.createdAt)]
    });
  },

  async getPropertyById(id: number): Promise<schema.Property | null> {
    const property = await db.query.properties.findFirst({
      where: eq(schema.properties.id, id)
    });
    return property ?? null; // Convert undefined to null
  },

  async getPropertiesByOwner(ownerId: number): Promise<schema.Property[]> {
    return await db.query.properties.findMany({
      where: eq(schema.properties.ownerId, ownerId),
      orderBy: [desc(schema.properties.createdAt)]
    });
  },

  async searchProperties(query: {
    location?: string,
    type?: string,
    minPrice?: number,
    maxPrice?: number
  }): Promise<schema.Property[]> {
    let conditions = [];

    if (query.location && query.location.trim() !== '') {
      conditions.push(like(schema.properties.location, `%${query.location}%`));
    }

    if (query.type && query.type !== 'all') {
      conditions.push(eq(schema.properties.type, query.type));
    }

    if (query.minPrice && query.minPrice > 0) {
      conditions.push(sql`${schema.properties.price} >= ${query.minPrice}`);
    }

    if (query.maxPrice && query.maxPrice > 0) {
      conditions.push(sql`${schema.properties.price} <= ${query.maxPrice}`);
    }

    if (conditions.length === 0) {
      return await db.query.properties.findMany({
        orderBy: [desc(schema.properties.createdAt)]
      });
    }

    // Combine all conditions with AND
    return await db.query.properties.findMany({
      where: and(...conditions),
      orderBy: [desc(schema.properties.createdAt)]
    });
  },

  async createProperty(propertyData: schema.InsertProperty): Promise<schema.Property> {
    const [property] = await db.insert(schema.properties)
      .values(propertyData)
      .returning();

    return property;
  },

  async updateProperty(id: number, ownerId: number, data: Partial<schema.InsertProperty>): Promise<schema.Property | null> {
    // First check if property exists and belongs to owner
    const property = await db.query.properties.findFirst({
      where: and(
        eq(schema.properties.id, id),
        eq(schema.properties.ownerId, ownerId)
      )
    });

    if (!property) return null;

    const [updatedProperty] = await db.update(schema.properties)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(schema.properties.id, id))
      .returning();

    return updatedProperty;
  },

  async deleteProperty(id: number, ownerId: number): Promise<boolean> {
    // First make sure property exists and belongs to owner
    const property = await db.query.properties.findFirst({
      where: and(
        eq(schema.properties.id, id),
        eq(schema.properties.ownerId, ownerId)
      )
    });

    if (!property) return false;

    // Delete related messages first to avoid foreign key constraints
    await db.delete(schema.messages)
      .where(eq(schema.messages.propertyId, id));

    // Delete the property
    const result = await db.delete(schema.properties)
      .where(eq(schema.properties.id, id))
      .returning();

    return result.length > 0;
  },

  // Message methods
  async getMessagesByUser(userId: number): Promise<schema.Message[]> {
    return await db.query.messages.findMany({
      where: or(
        eq(schema.messages.senderId, userId),
        eq(schema.messages.receiverId, userId)
      ),
      orderBy: [desc(schema.messages.createdAt)],
      with: {
        sender: true,
        receiver: true,
        property: true
      }
    });
  },

  async getConversation(userId1: number, userId2: number, propertyId: number): Promise<schema.Message[]> {
    return await db.query.messages.findMany({
      where: and(
        eq(schema.messages.propertyId, propertyId),
        or(
          and(
            eq(schema.messages.senderId, userId1),
            eq(schema.messages.receiverId, userId2)
          ),
          and(
            eq(schema.messages.senderId, userId2),
            eq(schema.messages.receiverId, userId1)
          )
        )
      ),
      orderBy: [schema.messages.createdAt],
      with: {
        sender: true,
        receiver: true,
        property: true
      }
    });
  },

  async sendMessage(messageData: schema.InsertMessage): Promise<schema.Message> {
    const [message] = await db.insert(schema.messages)
      .values(messageData)
      .returning();

    return message;
  },

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<void> {
    await db.update(schema.messages)
      .set({ read: true })
      .where(
        and(
          eq(schema.messages.senderId, senderId),
          eq(schema.messages.receiverId, receiverId),
          eq(schema.messages.read, false)
        )
      );
  },

  async getUnreadMessageCount(userId: number): Promise<number> {
    const result = await db.select({
      count: sql<number>`cast(count(*) as integer)`
    })
      .from(schema.messages)
      .where(
        and(
          eq(schema.messages.receiverId, userId),
          eq(schema.messages.read, false)
        )
      );

    return result[0]?.count || 0;
  },

  async deleteConversation(userId: number, otherUserId: number, propertyId: number): Promise<boolean> {
    try {
      // Delete messages between users for a specific property
      await db.delete(schema.messages)
        .where(
          and(
            eq(schema.messages.propertyId, propertyId),
            or(
              and(
                eq(schema.messages.senderId, userId),
                eq(schema.messages.receiverId, otherUserId)
              ),
              and(
                eq(schema.messages.senderId, otherUserId),
                eq(schema.messages.receiverId, userId)
              )
            )
          )
        );

      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      return false;
    }
  },

  async checkDatabaseConnection(): Promise<boolean> {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }
};
