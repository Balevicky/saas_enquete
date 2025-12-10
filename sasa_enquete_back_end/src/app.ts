import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { tenantExtractor } from "./middlewares/tenantMiddleware";

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Extract tenant from host (subdomain)
app.use(tenantExtractor);

app.use("/api", routes);

// health
app.get("/", (_, res) => res.send({ ok: true }));

export default app;
