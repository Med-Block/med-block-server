import { Router } from "express";
import { blockSwitchById, getById, getSelf, updateSelf } from "../controllers/user";
import { guard } from "../services/guard";

const router = Router();

router.get("/self", guard, getSelf);
router.get("/:id", guard, getById);
router.put("/self", guard, updateSelf);
router.post("/block/:id", guard, blockSwitchById);

export default router;