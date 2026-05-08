import { Router } from "express";
import * as todoController from "./todo.controller";

const router = Router();

router.get("/", todoController.listTodos);
router.get("/:id", todoController.getTodo);
router.post("/", todoController.createTodo);
router.patch("/:id", todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);

export default router;
