// src/tests/setup.js
import { config } from "dotenv";

// Load .env file
config();

// Fallback for JWT_SECRET if not in .env (integration tests often run without local .env)
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
