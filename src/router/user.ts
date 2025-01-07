import { Router } from "express";
import { deleteUser, getAll, getById, getSelf, restPassword, updateById, updateSelf, updateSelfPassword } from "../controllers/user";
import { guard, claimGuard } from "../services/guard";

const router = Router();

router.get("/list", claimGuard(['admin', 'doctor']), getAll);
router.get("/self", guard, getSelf);
router.get("/:id", guard, getById);

router.put("/self", guard, updateSelf);
router.put("/:id", claimGuard(['admin', 'doctor']), updateById);

router.post("/:id/reset-password", claimGuard('admin'), restPassword);
router.post("/self/update-password", guard, updateSelfPassword);

router.delete("/:id", claimGuard('admin'), deleteUser);

export default router;