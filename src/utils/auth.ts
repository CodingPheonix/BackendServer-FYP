import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import 'dotenv/config'

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
  throw new Error("MONGO_URL environment variable is required for auth");
}

const client = new MongoClient(mongoUrl);
// Better Auth connects to the primary database
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 1
  },
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173"
  ]
});
