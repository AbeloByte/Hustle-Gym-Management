import {
    createPlanService,
    getAllPlansService,
    getPlanByIdService,
    updatePlanService,
    deletePlanService
} from "../services/plan.service.js";


// create plan
const createPlan = async (req, res, next) => {
    try {
        const planData = req.body;
        console.log(planData);
        const plan = await createPlanService(planData);
        res.status(201).json({
            message: "Plan created successfully",
            plan,
        });
    } catch (error) {
        next(error);
    }
};

// get all plans
const getAllPlans = async (req, res, next) => {
    try {
        const plans = await getAllPlansService();
        res.status(200).json(plans);
    }
    catch (error) {
        next(error);
    }
};


// get plan by id
const getPlanById = async (req, res, next) => {
    try {
        const planId = req.params.id;
        const plan = await getPlanByIdService(planId);
        res.status(200).json(plan);
    }
    catch (error) {
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
            message: "Plan updated successfully",
            plan: updatedPlan,
        });
    }
    catch (error) {
        next(error);
    }
};

// delete plan
const deletePlan = async (req, res, next) => {
    try {
        const planId = req.params.id;
        await deletePlanService(planId);
        res.status(200).json({
            message: `Plan with ID ${planId} deleted successfully`,
        });
    }
    catch (error) {
        next(error);
    }
};

export {
    createPlan,
    getAllPlans,
    getPlanById,
    updatePlan,
    deletePlan
};
