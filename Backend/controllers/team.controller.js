import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { errorStatusCode, resSuccess } from "../constants/object.js";
import { teams } from "../constants/teams.js";
import { 
  calculateNRRPerformance as calculateNRR,
  canReachPosition 
} from "../services/nrrCalculation.service.js";

const getPointsTableTeams = async (req, res) => {
  try {
    const teamsData = teams;
    const formattedTeams = [];

    for (let i = 0; i < teamsData.length; i++) {
      const team = teamsData[i];
      const tempObj = {
        id: team.id,
        position: team.position,
        name: team.name,
        matchesPlayed: team.matchesPlayed,
        matchesWon: team.matchesWon,
        matchesLost: team.matchesLost,
        nrr: team.nrr,
        for: `${team.runsFor} / ${team.oversFor}`,
        against: `${team.runsAgainst} / ${team.oversAgainst}`,
        points: team.points,
      };
      formattedTeams.push(tempObj);
    }

    return res
      .status(resSuccess.OK)
      .json(
        new ApiResponse(
          resSuccess.OK,
          formattedTeams,
          "Teams retrieved successfully"
        )
      );
  } catch (error) {
    console.log("Get all teams error : ", error);
    return res
      .status(errorStatusCode.InternalServerError)
      .json(
        new ApiError(
          errorStatusCode.InternalServerError,
          error.message || "Failed to retrieve teams"
        )
      );
  }
};

const getTeamList = async (req, res) => {
  try {
    const teamsData = teams;
    const teamList = teamsData.map((team) => ({
      id: team.id,
      name: team.name,
      position: team.position,
    }));

    return res
      .status(resSuccess.OK)
      .json(
        new ApiResponse(
          resSuccess.OK,
          teamList,
          "Team list retrieved successfully"
        )
      );
  } catch (error) {
    console.log("Get team list error : ", error);
    return res
      .status(errorStatusCode.InternalServerError)
      .json(
        new ApiError(
          errorStatusCode.InternalServerError,
          error.message || "Failed to retrieve team list"
        )
      );
  }
};

const calculateNRRPerformance = async (req, res) => {
  try {
    const {
      yourTeam,
      oppositionTeam,
      overs,
      desiredPosition,
      tossResult,
      runsScored,
      runsToChase,
    } = req.body;

    if (yourTeam === oppositionTeam) {
      return res
        .status(errorStatusCode.BadRequest)
        .json(
          new ApiError(
            errorStatusCode.BadRequest,
            "Your team and opposition team cannot be the same"
          )
        );
    }

    // Check if team can reach desired position even after winning
    try {
      const positionCheck = canReachPosition(yourTeam, desiredPosition);
      if (!positionCheck.canReach) {
        return res
          .status(errorStatusCode.BadRequest)
          .json(
            new ApiError(
              errorStatusCode.BadRequest,
              positionCheck.reason
            )
          );
      }
    } catch (error) {
      return res
        .status(error.statusCode || errorStatusCode.BadRequest)
        .json(error);
    }

    const result = calculateNRR({
      yourTeam,
      oppositionTeam,
      overs,
      desiredPosition,
      tossResult,
      runsScored,
      runsToChase,
    });

    return res
      .status(resSuccess.OK)
      .json(
        new ApiResponse(
          resSuccess.OK,
          result,
          "NRR calculation completed successfully"
        )
      );
  } catch (error) {
    console.log("NRR calculation error : ", error);
    return res
      .status(errorStatusCode.InternalServerError)
      .json(
        new ApiError(
          errorStatusCode.InternalServerError,
          error.message || "Failed to calculate NRR"
        )
      );
  }
};

export { getPointsTableTeams, getTeamList, calculateNRRPerformance };
