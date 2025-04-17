import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getmessage, sendmessage } from "../controllers/message.controller.js";
const router = express.Router();
router.route('/send/:id').post(isAuthenticated,sendmessage);
router.route('/all/:id').get(isAuthenticated,getmessage);

export default router;