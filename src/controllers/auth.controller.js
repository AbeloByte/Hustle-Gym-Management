import express from "express"

import { registerService, loginService } from "../services/auth.service"


// register req
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const user = await registerService({ name, email, password, role });

        res.status(201).json({
            message: "User Registerd Successfuly",
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            },
        });
    } catch (error) {
        next(err);
    }
}


// login req

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const result = await loginService({ email, password })
        res.status(201).json(result)
    } catch (error) {
        next(error);
    }
}


export default {register , login}
