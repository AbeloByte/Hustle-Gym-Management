import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";
import bcryptjs from "bcryptjs";

// Mock the prisma client
vi.mock("../config/prisma.js", () => ({
    default: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn().mockResolvedValue("hashedPassword123"),
        compare: vi.fn().mockResolvedValue(true),
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("Auth Endpoints", () => {
    describe("POST /api/auth/register", () => {
        it("should register a new user successfully", async () => {
            // Mock findUnique to return null (user not found)
            prisma.user.findUnique.mockResolvedValue(null);

            // Mock create to return the user
            prisma.user.create.mockResolvedValue({
                id: 1,
                name: "Test User",
                email: "test@example.com",
                role: "MEMBER",
            });

            const res = await request(app).post("/api/auth/register").send({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                role: "ADMIN", // Schema might require valid role
            });

            expect(res.statusCode).toBe(201);
            expect(res.body.user).toEqual({
                id: 1,
                name: "Test User",
                role: "MEMBER",
            });
        });

        it("should return 500 if user already exists", async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: 1,
                email: "test@example.com",
            });

            const res = await request(app).post("/api/auth/register").send({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                role: "ADMIN",
            });

            // Service throws generic Error -> 500
            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe("User already exists");
        });

        it("should return 400 for validation errors", async () => {
            const res = await request(app).post("/api/auth/register").send({}); // Empty body

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Validation failed");
        });
    });

    describe("POST /api/auth/login", () => {
        it("should log in successfully", async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: 1,
                name: "Test User",
                email: "test@example.com",
                password: "hashedPassword123",
                role: "MEMBER",
            });

            // bcrypt.compare is mocked to return true by default above

            const res = await request(app).post("/api/auth/login").send({
                email: "test@example.com",
                password: "password123",
            });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("token");
        });

        it("should return 500 for invalid credentials", async () => {
            // Mock user not found
            prisma.user.findUnique.mockResolvedValue(null);

            const res = await request(app).post("/api/auth/login").send({
                email: "wrong@example.com",
                password: "password123",
            });

            // Current service implementation throws generic Error("Invalid credentials") -> 500
            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe("Invalid credentials");
        });
    });
});
