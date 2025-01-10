import { Router } from "express";
import { claimGuard, guard } from "../services/guard";
import { activateLicense, deactivateLicense, forceDeactivateLicense, getDoctorsWithLicense, getLicenseLogs, getLicenses, getUserLicenses } from "../controllers/license";

const router = Router();

router.get("/list", guard, getLicenses);
router.get("/logs", claimGuard('admin'), getLicenseLogs);
router.get("/user/:id", claimGuard('admin'), getUserLicenses);
router.get("/doctors", claimGuard('user'), getDoctorsWithLicense);


router.post("/activate", claimGuard('user'), activateLicense);
router.post("/deactivate", claimGuard('user'), deactivateLicense);
router.post("/force_deactivate/:id", claimGuard('admin'), forceDeactivateLicense);

export default router;