import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("App Health Check", () => {
    it("should return 404 for unknown routes", async () => {
        const res = await request(app).get("/api/unknown-route");
        expect(res.statusCode).toBe(404);
    });

    it("should return 200 for health check and confirm", async () => {
        const res = await request(app).get("/api/health");
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Server is healthy");
    });
});
