import express from "express";
import {
    createPlan,
    getAllPlans,
    getPlanById,
    updatePlan,
    deletePlan,
} from "../controllers/plan.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
    createPlanSchema,
    updatePlanSchema,
} from "../validation/plan.schema.js";
const router = express.Router();

router.post(
    "/createPlan",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(createPlanSchema),
    createPlan,
);
router.get("/getAllPlans", authMiddleware, getAllPlans);
// router.get("/getPlanById/:id", authMiddleware, getPlanById);
router.put(
    "/updatePlan/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(updatePlanSchema),
    updatePlan,
);
router.delete(
    "/deletePlan/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deletePlan,
);

export default router;
