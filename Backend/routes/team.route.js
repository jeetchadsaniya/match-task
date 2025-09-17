import { Router } from "express";
import {
  getPointsTableTeams,
  getTeamList,
  calculateNRRPerformance,
} from "../controllers/team.controller.js";
import { validateRequest, nrrCalculationSchema } from "../utils/validation.js";

const router = Router();

router.route("/").get(getPointsTableTeams);

router.route("/list").get(getTeamList);

router
  .route("/calculate-nrr")
  .post(validateRequest(nrrCalculationSchema), calculateNRRPerformance);

export default router;
