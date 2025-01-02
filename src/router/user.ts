import { Router } from "express";
import { blockSwitchById, getAll, getById, getSelf, updateSelf } from "../controllers/user";
import { guard, claimGuard } from "../services/guard";

const router = Router();

router.get("/list", claimGuard('admin'), getAll);
router.get("/self", guard, getSelf);
router.get("/:id", guard, getById);
router.put("/self", guard, updateSelf);
router.post("/block/:id", claimGuard('admin'), blockSwitchById);

export default router;