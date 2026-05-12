import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import clientRoutes from "./modules/clients/client.routes";
import stocksRoutes from "./modules/stocks/stocks.routes";
import quotesRoutes from "./modules/quotes/quotes.routes";
import newsRoutes from "./modules/news/news.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/clients", clientRoutes);
app.use("/stocks", stocksRoutes);
app.use("/quotes", quotesRoutes);
app.use("/news", newsRoutes);

app.use(errorMiddleware);

export default app;