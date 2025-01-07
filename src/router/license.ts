import { Router } from "express";
import { claimGuard, guard } from "../services/guard";
import { activateLicense, deactivateLicense, getLicenseLogs, getLicenses, getSelfLicenseLogs, getUserLicenses } from "../controllers/license";

const router = Router();

router.get("/list", guard, getLicenses);
router.get("/self/logs/:id", guard, getSelfLicenseLogs);
router.get("/logs/:id", guard, getLicenseLogs);
router.get("/user/:id", claimGuard('admin'), getUserLicenses);

router.post("/activate", claimGuard('user'), activateLicense);
router.post("/deactivate", claimGuard('user'), deactivateLicense);

export default router;