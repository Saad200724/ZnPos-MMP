import { Router, type IRouter } from "express";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import customersRouter from "./routes/customers";
import transactionsRouter from "./routes/transactions";
import dashboardRouter from "./routes/dashboard";
import suppliersRouter from "./routes/suppliers";
import purchasesRouter from "./routes/purchases";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(customersRouter);
router.use(transactionsRouter);
router.use(dashboardRouter);
router.use(suppliersRouter);
router.use(purchasesRouter);

export default router;
