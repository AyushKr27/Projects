import express from "express";
import { saveMessage, getMessages } from "../controllers/chatController.js";

const router = express.Router();

router.post("/send", saveMessage);    
router.get("/history", getMessages);  

export default router;
