import { teams } from "../constants/teams.js";
import { ApiError } from "../utils/apiError.js";

const convertOversToDecimal = (oversString) => {
  if (typeof oversString === "number") return oversString;
  const parts = oversString.toString().split(".");
  const overs = parseInt(parts[0]);
  const balls = parts[1] ? parseInt(parts[1]) : 0;
  return overs + balls / 6;
};

const convertDecimalToOvers = (decimalOvers) => {
  const overs = Math.floor(decimalOvers);
  const balls = Math.round((decimalOvers - overs) * 6);

  if (balls === 6) {
    return `${overs + 1}.0`;
  }

  return `${overs}.${balls}`;
};

const calculateNRR = (runsFor, oversFor, runsAgainst, oversAgainst) => {
  const runRateFor = runsFor / oversFor;
  const runRateAgainst = runsAgainst / oversAgainst;
  return runRateFor - runRateAgainst;
};

const getTeamByName = (teamName) => {
  const team = teams.find(
    (t) => t.name.toLowerCase() === teamName.toLowerCase()
  );
  if (!team) {
    throw new ApiError(404, `Team ${teamName} not found`);
  }
  return team;
};

const canReachPosition = (yourTeam, desiredPosition) => {
  const yourTeamData = getTeamByName(yourTeam);
  const targetTeamData = teams.find((t) => t.position === desiredPosition);

  if (!targetTeamData)
    throw new ApiError(404, `No team found at position ${desiredPosition}`);

  const currentPosition = yourTeamData.position;
  const currentPoints = yourTeamData.points;
  const targetPoints = targetTeamData.points;
  const maxPossiblePoints = currentPoints + 2;

  const result = {
    canReach: true,
    reason: null,
    currentPosition,
    currentPoints,
    targetPoints,
    maxPossiblePoints,
    pointsGap: 0,
    nrrCheck: false,
  };

  // Check if target position is equal to or less than current position
  if (desiredPosition >= currentPosition) {
    result.canReach = false;
    result.reason = `Cannot reach position ${desiredPosition}. Your team is currently at position ${currentPosition}, and you can only target positions higher than your current position. Please select a position between 1 and ${
      currentPosition - 1
    }.`;
    return result;
  }

  // Check if points are sufficient
  if (maxPossiblePoints < targetPoints) {
    result.canReach = false;
    result.pointsGap = targetPoints - maxPossiblePoints;
    result.reason = `Cannot reach position ${desiredPosition}. Even after winning, your team will have ${maxPossiblePoints} points, but position ${desiredPosition} requires at least ${targetPoints} points. You need ${result.pointsGap} more points to reach this position.`;
    return result;
  }
  return result;
};

const calculateRunsToRestrict = (params) => {
  const { yourTeam, oppositionTeam, overs, desiredPosition, runsScored } =
    params;

  const yourTeamData = getTeamByName(yourTeam);
  const targetTeamData = teams.find((t) => t.position === desiredPosition);

  if (!targetTeamData) {
    throw new ApiError(404, `No team found at position ${desiredPosition}`);
  }

  const oversDecimal = convertOversToDecimal(overs);
  const currentRunsFor = yourTeamData.runsFor;
  const currentOversFor = convertOversToDecimal(yourTeamData.oversFor);
  const currentRunsAgainst = yourTeamData.runsAgainst;
  const currentOversAgainst = convertOversToDecimal(yourTeamData.oversAgainst);

  // new totals after the match
  const newRunsFor = currentRunsFor + runsScored;
  const newOversFor = currentOversFor + oversDecimal;

  // required NRR to reach desired position
  const targetNRR = targetTeamData.nrr;

  // minimum runs to restrict (for maximum NRR)
  const minRunsToRestrict = Math.floor(
    (newRunsFor / newOversFor - targetNRR) *
      (currentOversAgainst + oversDecimal) -
      currentRunsAgainst
  );

  // maximum runs to restrict (for minimum NRR to reach position)
  const maxRunsToRestrict = Math.ceil(
    (newRunsFor / newOversFor - targetNRR) *
      (currentOversAgainst + oversDecimal) -
      currentRunsAgainst
  );

  // Ensure runs are not negative
  const finalMinRuns = Math.max(0, minRunsToRestrict);
  const finalMaxRuns = Math.max(finalMinRuns, maxRunsToRestrict);

  // Calculate NRR ranges
  const minNRR = calculateNRR(
    newRunsFor,
    newOversFor,
    currentRunsAgainst + finalMaxRuns,
    currentOversAgainst + oversDecimal
  );

  const maxNRR = calculateNRR(
    newRunsFor,
    newOversFor,
    currentRunsAgainst + finalMinRuns,
    currentOversAgainst + oversDecimal
  );

  return {
    runsRange: {
      min: finalMinRuns,
      max: finalMaxRuns,
    },
    nrrRange: {
      min: parseFloat(minNRR.toFixed(3)),
      max: parseFloat(maxNRR.toFixed(3)),
    },
    overs: overs,
  };
};

const calculateOversToChase = (params) => {
  const { yourTeam, oppositionTeam, overs, desiredPosition, runsToChase } =
    params;

  const yourTeamData = getTeamByName(yourTeam);
  const targetTeamData = teams.find((t) => t.position === desiredPosition);

  if (!targetTeamData) {
    throw new ApiError(404, `No team found at position ${desiredPosition}`);
  }

  const oversDecimal = convertOversToDecimal(overs);
  const currentRunsFor = yourTeamData.runsFor;
  const currentOversFor = convertOversToDecimal(yourTeamData.oversFor);
  const currentRunsAgainst = yourTeamData.runsAgainst;
  const currentOversAgainst = convertOversToDecimal(yourTeamData.oversAgainst);

  // new totals after the match
  const newRunsFor = currentRunsFor + runsToChase;
  const newRunsAgainst = currentRunsAgainst + runsToChase;

  // required NRR to reach desired position
  const targetNRR = targetTeamData.nrr;

  // maximum overs to chase (for minimum NRR)
  const maxOversToChase =
    newRunsFor /
      (targetNRR + newRunsAgainst / (currentOversAgainst + oversDecimal)) -
    currentOversFor;

  // minimum overs to chase (for maximum NRR)
  const minOversToChase = Math.max(0.1, maxOversToChase - 5); // Allow some buffer

  // overs are within reasonable limits
  const finalMinOvers = Math.max(0.1, Math.min(minOversToChase, oversDecimal));
  const finalMaxOvers = Math.max(
    finalMinOvers,
    Math.min(maxOversToChase, oversDecimal)
  );

  // Calculate NRR ranges
  const minNRR = calculateNRR(
    newRunsFor,
    currentOversFor + finalMaxOvers,
    newRunsAgainst,
    currentOversAgainst + oversDecimal
  );

  const maxNRR = calculateNRR(
    newRunsFor,
    currentOversFor + finalMinOvers,
    newRunsAgainst,
    currentOversAgainst + oversDecimal
  );

  return {
    oversRange: {
      min: convertDecimalToOvers(finalMinOvers),
      max: convertDecimalToOvers(finalMaxOvers),
    },
    nrrRange: {
      min: parseFloat(minNRR.toFixed(3)),
      max: parseFloat(maxNRR.toFixed(3)),
    },
    runsToChase: runsToChase,
  };
};

const calculateNRRPerformance = (params) => {
  const {
    yourTeam,
    oppositionTeam,
    overs,
    desiredPosition,
    tossResult,
    runsScored,
    runsToChase,
  } = params;

  try {
    const results = {};

    // Batting First
    if (tossResult === "batting_first" && runsScored) {
      const battingFirstResult = calculateRunsToRestrict({
        yourTeam,
        oppositionTeam,
        overs,
        desiredPosition,
        runsScored,
        tossResult,
      });

      results.battingFirst = {
        scenario: `If ${yourTeam} score ${runsScored} runs in ${overs} overs`,
        answer: `${yourTeam} need to restrict ${oppositionTeam} between ${battingFirstResult.runsRange.min} to ${battingFirstResult.runsRange.max} runs in ${overs} overs.`,
        revisedNRR: `Revised NRR of ${yourTeam} will be between ${battingFirstResult.nrrRange.min} to ${battingFirstResult.nrrRange.max}.`,
        details: battingFirstResult,
      };
    }

    // Bowling First
    if (tossResult === "bowling_first" && runsToChase !== undefined) {
      const bowlingFirstResult = calculateOversToChase({
        yourTeam,
        oppositionTeam,
        overs,
        desiredPosition,
        runsToChase,
        tossResult,
      });

      results.bowlingFirst = {
        scenario: `If ${oppositionTeam} score ${runsToChase} runs in ${overs} overs`,
        answer: `${yourTeam} need to chase ${runsToChase} runs between ${bowlingFirstResult.oversRange.min} and ${bowlingFirstResult.oversRange.max} overs.`,
        revisedNRR: `Revised NRR for ${yourTeam} will be between ${bowlingFirstResult.nrrRange.min} to ${bowlingFirstResult.nrrRange.max}.`,
        details: bowlingFirstResult,
      };
    }

    // Additional analysis
    const yourTeamData = getTeamByName(yourTeam);
    const targetTeamData = teams.find((t) => t.position === desiredPosition);

    results.analysis = {
      currentNRR: yourTeamData.nrr,
      targetNRR: targetTeamData.nrr,
      nrrGap: parseFloat((targetTeamData.nrr - yourTeamData.nrr).toFixed(3)),
      currentPosition: yourTeamData.position,
      targetPosition: desiredPosition,
    };

    return results;
  } catch (error) {
    throw new ApiError(500, `NRR Calculation Error: ${error.message}`);
  }
};

export {
  calculateNRRPerformance,
  calculateRunsToRestrict,
  calculateOversToChase,
  calculateNRR,
  convertOversToDecimal,
  convertDecimalToOvers,
  canReachPosition,
};
