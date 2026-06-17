import express from "express";
import cookieParser from 'cookie-parser';

import router from "./routes/index.js";

const app = express();

// Usa express.json
app.use(express.json());

// nose
app.use(express.urlencoded({ extended: true }))

// Para guardar las cookies
app.use(cookieParser());

// Usa el routing de ./routes
app.use('/api', router)

export default app;