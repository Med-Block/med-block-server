import { Router } from "express";
import { claimGuard } from "../services/guard";
import { addRecord, getRecord, getRecordList, updateRecord } from "../controllers/record";

const router = Router();

router.get("/list", claimGuard("user"), getRecordList);
router.get("/list/:userId", claimGuard("doctor"), getRecordList);

router.post("/", claimGuard("doctor"), addRecord);
router.put("/:recordId", claimGuard("doctor"), updateRecord);
router.get("/:recordId", claimGuard(["doctor", "user"]), getRecord);

export default router;