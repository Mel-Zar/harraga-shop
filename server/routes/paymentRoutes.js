import express from "express";

import {
    stripeWebhook,
} from "../controllers/orderController.js";

const router = express.Router();

// =====================================================

// STRIPE WEBHOOK

// OBS: express.raw() läggs i index.js före denna route.

// =====================================================

router.post(

    "/",

    stripeWebhook

);

export default router;