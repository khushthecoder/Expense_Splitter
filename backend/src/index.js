import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma/client.js";
import router from "./routes/routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.send("OK"));

app.use("/", router);

prisma
  .$connect()
  .then(() => {
    console.log("Prisma connected");

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
      console.log(`Server accessible at http://localhost:${PORT}`);
    });
  })
  .catch(console.error);
