import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,   
} from "../controllers/task.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

router.post("/reorder", reorderTasks);

export default router;
