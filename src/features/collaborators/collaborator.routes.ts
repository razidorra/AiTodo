import { Router } from "express";
import * as collaboratorController from "./collaborator.controller";

const router = Router();

router.get("/", collaboratorController.listCollaborators);
router.post("/", collaboratorController.addCollaborator);

export default router;
