
import { Router } from "express";
import { createSupportTicket } from "../controllers/supportController.js";

const router = Router();

router.post("/", createSupportTicket);

export default router;
