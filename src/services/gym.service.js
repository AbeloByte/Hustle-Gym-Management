import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createGymProfile = async (gymData) => {
    const { name, address, phone, email } = gymData;
    try {
        const gymProfile = await prisma.gymProfile.create({
            data: {
                name,
                address,
                phone,
                email,
            },
        });
        return gymProfile;
    } catch (error) {
        throw new Error(`Failed to create gym profile: ${error.message}`);
    }
};

const getGymProfile = async () => {
    try {
        const gymProfile = await prisma.gymProfile.findFirst();
        return gymProfile;
    } catch (error) {
        throw new Error(`Failed to retrieve gym profile: ${error.message}`);
    }
};

const updateGymProfile = async (gymData) => {
    const { name, address, phone, email } = gymData;
    try {
        const existingProfile = await prisma.gymProfile.findFirst();
        if (!existingProfile) {
            throw new Error("Gym profile not found");
        }

        const updatedProfile = await prisma.gymProfile.update({
            where: { id: existingProfile.id },
            data: {
                name,
                address,
                phone,
                email,
            },
        });
        return updatedProfile;
    } catch (error) {
        throw new Error(`Failed to update gym profile: ${error.message}`);
    }
};

export { createGymProfile, getGymProfile, updateGymProfile };
