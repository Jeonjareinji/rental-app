import dotenv from 'dotenv';
dotenv.config();

import { db } from "./index";
import * as schema from "@shared/schema";
import bcrypt from "bcryptjs";

// Mock data for seeding
async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Check if users already exist to avoid duplicates
    const existingUsers = await db.query.users.findMany({
      limit: 1
    });

    if (existingUsers.length === 0) {
      // Hash passwords
      const saltRounds = 10;
      const ownerPassword = await bcrypt.hash("password123", saltRounds);
      const tenantPassword = await bcrypt.hash("password123", saltRounds);

      // Insert users
      console.log("Inserting users...");
      const [owner] = await db.insert(schema.users).values({
        username: "propertyowner",
        fullName: "Property Owner",
        email: "owner@example.com",
        password: ownerPassword,
        role: "owner"
      }).returning();

      const [tenant] = await db.insert(schema.users).values({
        username: "propertytenant",
        fullName: "Property Tenant",
        email: "tenant@example.com",
        password: tenantPassword,
        role: "tenant"
      }).returning();

      console.log(`Created owner: ${owner.email} and tenant: ${tenant.email}`);

      // Check if properties already exist
      const existingProperties = await db.query.properties.findMany({
        limit: 1
      });

      if (existingProperties.length === 0) {
        console.log("Inserting properties...");
        // Insert mock properties
        const propertiesData = [
          {
            ownerId: owner.id,
            name: "Skyline Apartment",
            description: "Modern apartment with 2 bedrooms, fully furnished with city views and close to public transportation.",
            price: 3500000, // Rp 3,500,000
            location: "Central Jakarta",
            type: "apartment",
            imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          },
          {
            ownerId: owner.id,
            name: "Family Villa",
            description: "Spacious 3-bedroom house with garden, perfect for families. Includes garage and security.",
            price: 7000000, // Rp 7,000,000
            location: "South Jakarta",
            type: "house",
            imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          },
        ];

        await db.insert(schema.properties).values(propertiesData);
        console.log(`Created ${propertiesData.length} properties`);
      } else {
        console.log("Properties already exist, skipping property seeding.");
      }
    } else {
      console.log("Users already exist, skipping user seeding.");
    }

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

seed();
