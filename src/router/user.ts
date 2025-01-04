import { Router } from "express";
import { blockSwitchById, deleteUser, getAll, getById, getSelf, updateById, updateSelf } from "../controllers/user";
import { guard, claimGuard } from "../services/guard";

const router = Router();

router.get("/list", claimGuard(['admin', 'doctor']), getAll);
router.get("/self", guard, getSelf);
router.get("/:id", guard, getById);

router.put("/self", guard, updateSelf);
router.put("/:id", claimGuard(['admin', 'doctor']), updateById);

router.post("/block/:id", claimGuard('admin'), blockSwitchById);

router.delete("/:id", claimGuard('admin'), deleteUser);

export default router;