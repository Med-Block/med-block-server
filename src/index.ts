import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
dotenv.config();
import { db, init } from "./services/db";
import express from "express";
import cors from "cors";

const app = express();
const ROUTERS_PATH = path.join(__dirname, "router");

init();

app.use(cors({
    origin: [process.env.CORS_ORIGIN || 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

fs.readdirSync(ROUTERS_PATH).forEach((file) => {
    const router = require(path.join(ROUTERS_PATH, file)).default;
    app.use(`/api/${file.replace(".ts", "").replace(".js", "")}`, router);
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});