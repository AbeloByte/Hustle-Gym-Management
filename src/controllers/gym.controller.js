import express from "express";
const router = express.Router();
import {
    createGymProfile,
    getGymProfile,
    updateGymProfile,
} from "../services/gym.service.js";

// Create a new gym profile
const createGymInfo = async (req, res) => {
    try {
        const { name, address, phone, email } = req.body;

        const gymData = { name, address, phone, email };
        const gymProfile = await createGymProfile(gymData);

        res.status(201).json(gymProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get the gym profile
const getGymInfo = async (req, res) => {
    try {
        const gymProfile = await getGymProfile();
        res.status(200).json(gymProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update the gym profile
const updateGymInfo = async (req, res) => {
    try {
        const { name, address, phone, email } = req.body;
        const gymData = { name, address, phone, email };
        const updatedGymProfile = await updateGymProfile(gymData);
        res.status(200).json(updatedGymProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { createGymInfo, getGymInfo, updateGymInfo };
