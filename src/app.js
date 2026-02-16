import express from "express";
import errorMiddleware from "./middleware/error.middleware.js";
const app = express();

import routes from "./routes/index.js";

app.use(express.json());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid JSON in request body" });
    }
    next();
});

app.use("/api", routes);

app.use(errorMiddleware);

export default app;
