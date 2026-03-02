import {
    registerService,
    loginService,
    getCurrentUserService,
} from "../services/auth.service.js";

// register req
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await registerService({ name, email, password, role });
        res.status(201).json({
            message: "User Registered Successfully",
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// login req
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await loginService({ email, password });

        res.cookie("token", result.token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.status(200).json({
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
};

const getCurrentUserController = async (req, res, next) => {
    try {
        const user = await getCurrentUserService(req.user.id);

        res.json(user);
    } catch (error) {
        next(error);
    }
};

export { register, login, getCurrentUserController };
