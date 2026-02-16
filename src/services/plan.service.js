import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



async function createPlanService(planData) {
    const { name, price, duration } = planData;
    // check if there is already a plan with the same name
    const existingPlan = await prisma.plan.findUnique({
        where: { name },
    });
    if (existingPlan) {
        throw new Error("A plan with the same name already exists");
    }


    try {
        const plan = await prisma.plan.create({
            data: {
                name,
                // description,
                price,
                duration: duration || 30, // Default duration of 30 days if not provided
            },
        });
        return plan;
    } catch (error) {
        throw new Error(`Failed to create plan: ${error.message}`);
    }

}


async function getAllPlansService() {
    try {
        const plans = await prisma.plan.findMany();
        return plans;
    } catch (error) {
        throw new Error(`Failed to retrieve plans: ${error.message}`);
    }
}

async function getPlanByIdService(planId) {
    try {
        const plan = await prisma.plan.findUnique({
            where: { id: Number(planId) },
        });
        if (!plan) {
            throw new Error('Plan not found');
        }
        return plan;
    } catch (error) {
        throw new Error(`Failed to retrieve plan: ${error.message}`);
    }
}

async function updatePlanService(planId, planData) {
    const { name, description, price } = planData;
    try {
        const existingPlan = await prisma.plan.findUnique({
            where: { id: Number(planId) },
        });
        if (!existingPlan) {
            throw new Error('Plan not found');
        }
        const updatedPlan = await prisma.plan.update({
            where: { id: Number(planId) },
            data: {
                name,
// description,
                price,
            },
        });
        return updatedPlan;
    } catch (error) {
        throw new Error(`Failed to update plan: ${error.message}`);
    }
}

async function deletePlanService(planId) {

    try {
        const existingPlan = await prisma.plan.findUnique({
            where: { id: Number(planId) },
        });
        if (!existingPlan) {
            throw new Error('Plan not found');
        }
        await prisma.plan.delete({
            where: { id: Number(planId) },
        });
    }

    catch (error) {
        if (error.code === 'P2025') {
            throw new Error('Plan not found');
        }
        throw new Error(`Failed to delete plan: ${error.message}`);
    }

}


export {
    createPlanService,
    getAllPlansService,
    getPlanByIdService,
    updatePlanService,
    deletePlanService
};
