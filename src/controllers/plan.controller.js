import { success } from "zod";
import {
    createPlanService,
    getAllPlansService,
    getPlanByIdService,
    updatePlanService,
    deletePlanService,
} from "../services/plan.service.js";

// create plan
const createPlan = async (req, res, next) => {
    try {
        console.log(req.body);
        const plan = await createPlanService(req.body);
        res.status(201).json({
            success: true,
            message: "Plan created successfully",
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};

// get all plans
const getAllPlans = async (req, res, next) => {
    try {
        const plans = await getAllPlansService();
        res.status(200).json({
            success: true,
            data: plans,
        });
    } catch (error) {
        next(error);
    }
};

// get plan by id
const getPlanById = async (req, res, next) => {
    try {
        const planId = req.params.id;
        const plan = await getPlanByIdService(planId);
        res.status(200).json({
            success: true,
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};

// update plan
const updatePlan = async (req, res, next) => {
    try {
        const planId = req.params.id;
        const planData = req.body;
        const updatedPlan = await updatePlanService(planId, planData);
        res.status(200).json({
            success: true,
            message: "Plan updated successfully",
            plan: updatedPlan,
        });
    } catch (error) {
        next(error);
    }
};

// delete plan
const deletePlan = async (req, res, next) => {
    try {
        const planId = req.params.id;
        const deletedPlan = await deletePlanService(planId);
        const planName = deletedPlan;

        res.status(200).json({
            message: `${planName} Plan deleted successfully`,
            data: deletedPlan,
        });
    } catch (error) {
        next(error);
    }
};

export { createPlan, getAllPlans, getPlanById, updatePlan, deletePlan };
