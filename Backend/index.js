import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import teamRoute from "./routes/team.route.js";

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config({
    path: "./.env",
});

app.get("/", (_, res) => {
    res.send("Server Working Fine !!");
});

app.use("/api/v1/team", teamRoute);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running at port : ${(process.env.PORT || 3000)}...`);
});