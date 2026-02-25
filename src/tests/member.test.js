import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import * as memberService from "../services/member.service.js";

// Mock the member service
vi.mock("../services/member.service.js");

describe("Member Endpoints (Protected)", () => {
    // Create valid JWT tokens for testing
    const adminToken = jwt.sign(
        { id: 1, role: "ADMIN" },
        process.env.JWT_SECRET || "test-secret",
        { expiresIn: "1h" },
    );
    const staffToken = jwt.sign(
        { id: 2, role: "STAFF" },
        process.env.JWT_SECRET || "test-secret",
        { expiresIn: "1h" },
    );
    const memberToken = jwt.sign(
        { id: 3, role: "MEMBER" },
        process.env.JWT_SECRET || "test-secret",
        { expiresIn: "1h" },
    );

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("POST /api/gym-members/members", () => {
        const newMemberData = {
            fullName: "John Doe",
            email: "john.doe@example.com",
            phone: "1234567890",
            dateOfBirth: "1990-01-01",
            gender: "MALE",
            status: "ACTIVE",
        };

        it("should create a member successfully when user is ADMIN", async () => {
            // Mock service response
            const serviceResponse = {
                id: 101,
                ...newMemberData,
            };

            // Mock the exported function
            vi.mocked(memberService.createMemberService).mockResolvedValue(
                serviceResponse,
            );

            const res = await request(app)
                .post("/api/gym-members/members")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(newMemberData);

            expect(res.statusCode).toBe(201);
            expect(res.body.fullName).toBe("John Doe");
            expect(memberService.createMemberService).toHaveBeenCalled();
        });

        it("should allow STAFF to create member", async () => {
            vi.mocked(memberService.createMemberService).mockResolvedValue({
                id: 102,
                ...newMemberData,
            });

            const res = await request(app)
                .post("/api/gym-members/members")
                .set("Authorization", `Bearer ${staffToken}`)
                .send(newMemberData);

            expect(res.statusCode).toBe(201);
        });

        it("should DENY access to regular MEMBER role (403)", async () => {
            const res = await request(app)
                .post("/api/gym-members/members")
                .set("Authorization", `Bearer ${memberToken}`)
                .send(newMemberData);

            expect(res.statusCode).toBe(403);
        });

        it("should return 401 if no token provided", async () => {
            const res = await request(app)
                .post("/api/gym-members/members")
                .send(newMemberData);

            expect(res.statusCode).toBe(401);
        });

        it("should return 400 validation error for invalid data", async () => {
            const invalidData = { firstName: "John" }; // Missing required phone/gender/fullName

            const res = await request(app)
                .post("/api/gym-members/members")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(invalidData);

            expect(res.statusCode).toBe(400);
        });
    });

    describe("GET /api/gym-members/members", () => {
        it("should get all members for ADMIN", async () => {
            memberService.getAllMembersService.mockResolvedValue([
                { id: 1, firstName: "User1" },
                { id: 2, firstName: "User2" },
            ]);

            const res = await request(app)
                .get("/api/gym-members/members")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
        });

        // According to route definition: router.get("/members", authMiddleware, roleMiddleware("ADMIN"), getMembers);
        // It seems STAFF is NOT allowed to get all members? Let's test that assumption.
        it("should DENY access to STAFF for getting ALL members list", async () => {
            const res = await request(app)
                .get("/api/gym-members/members")
                .set("Authorization", `Bearer ${staffToken}`); // Only ADMIN allowed in routes

            expect(res.statusCode).toBe(403);
        });
    });
});
