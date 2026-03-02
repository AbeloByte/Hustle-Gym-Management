import { ZodError } from "zod";

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        console.error("Validation Error:", error);

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors:
                    error.errors?.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })) || [],
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export default validate;
