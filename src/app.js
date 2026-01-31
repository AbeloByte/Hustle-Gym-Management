import express from 'express';
import errorMiddleware from './middleware/error.middleware.js';
const app = express();

import routes from './routes/index.js';

app.use(express.json());


app.use('/api', routes);


app.use(errorMiddleware);

export default app;
