import React, { useState, useEffect } from "react";
import "./HowToAchieveGoal.css";
import { apiService } from "../services/apiService.js";

const HowToAchieveGoal = () => {
  const [formData, setFormData] = useState({
    yourTeam: "",
    oppositionTeam: "",
    overs: "",
    desiredPosition: "",
    tossResult: "",
    runsScored: "",
    runsToChase: "",
  });
  const [result, setResult] = useState(null);
  const [teamList, setTeamList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeamList = async () => {
      try {
        setLoading(true);
        const response = await apiService.getTeamList();
        setTeamList(response.data || []);
      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamList();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateNRR = async () => {
    try {
      setLoading(true);

      const baseFields = [
        "yourTeam",
        "oppositionTeam",
        "overs",
        "desiredPosition",
        "tossResult",
      ];
      let requiredFields = [...baseFields];

      if (formData.tossResult === "batting_first") {
        requiredFields.push("runsScored");
      } else if (formData.tossResult === "bowling_first") {
        requiredFields.push("runsToChase");
      }

      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        return;
      }

      const apiData = {
        yourTeam: formData.yourTeam,
        oppositionTeam: formData.oppositionTeam,
        overs: parseFloat(formData.overs),
        desiredPosition: parseInt(formData.desiredPosition),
        tossResult: formData.tossResult,
      };

      if (formData.tossResult === "batting_first") {
        apiData.runsScored = parseInt(formData.runsScored);
      } else if (formData.tossResult === "bowling_first") {
        apiData.runsToChase = parseInt(formData.runsToChase);
      }

      const response = await apiService.calculateNRR(apiData);
      setResult(response);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      yourTeam: "",
      oppositionTeam: "",
      overs: "",
      desiredPosition: "",
      tossResult: "",
      runsScored: "",
      runsToChase: "",
    });
    setResult(null);
  };

  return (
    <div className="goal-container">
      <div className="header">
        <h2>NRR Calculator</h2>
        <p>Calculate Net Run Rate performance for your team</p>
      </div>

      <div className="form-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            calculateNRR();
          }}
        >
          <div className="form-group">
            <label htmlFor="yourTeam">Your Team:</label>
            <select
              id="yourTeam"
              value={formData.yourTeam}
              onChange={(e) => handleInputChange("yourTeam", e.target.value)}
              required
            >
              <option value="">Select your team</option>
              {teamList.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="oppositionTeam">Opposition Team:</label>
            <select
              id="oppositionTeam"
              value={formData.oppositionTeam}
              onChange={(e) =>
                handleInputChange("oppositionTeam", e.target.value)
              }
              required
            >
              <option value="">Select opposition team</option>
              {teamList.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="overs">Overs:</label>
            <input
              type="number"
              id="overs"
              value={formData.overs}
              onChange={(e) => handleInputChange("overs", e.target.value)}
              placeholder="Enter overs (e.g., 20 or 20.3)"
              min="1"
              max="50"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="desiredPosition">Desired Position:</label>
            <select
              id="desiredPosition"
              value={formData.desiredPosition}
              onChange={(e) =>
                handleInputChange("desiredPosition", e.target.value)
              }
              required
            >
              <option value="">Select desired position</option>
              <option value="1">1st Position</option>
              <option value="2">2nd Position</option>
              <option value="3">3rd Position</option>
              <option value="4">4th Position</option>
              <option value="5">5th Position</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tossResult">Toss Result:</label>
            <select
              id="tossResult"
              value={formData.tossResult}
              onChange={(e) => handleInputChange("tossResult", e.target.value)}
              required
            >
              <option value="">Select toss result</option>
              <option value="batting_first">Batting First</option>
              <option value="bowling_first">Bowling First</option>
            </select>
          </div>

          {formData.tossResult === "batting_first" && (
            <div className="form-group">
              <label htmlFor="runsScored">Runs Scored:</label>
              <input
                type="number"
                id="runsScored"
                value={formData.runsScored}
                onChange={(e) =>
                  handleInputChange("runsScored", e.target.value)
                }
                placeholder="Enter runs scored"
                min="0"
                max="500"
                required
              />
            </div>
          )}

          {formData.tossResult === "bowling_first" && (
            <div className="form-group">
              <label htmlFor="runsToChase">Runs to Chase:</label>
              <input
                type="number"
                id="runsToChase"
                value={formData.runsToChase}
                onChange={(e) =>
                  handleInputChange("runsToChase", e.target.value)
                }
                placeholder="Enter runs to chase"
                min="0"
                max="500"
                required
              />
            </div>
          )}

          <div className="button-group">
            <button
              type="submit"
              className="calculate-button"
              disabled={loading}
            >
              {loading ? "Calculating..." : "Calculate NRR"}
            </button>
            <button type="button" onClick={resetForm} className="reset-button">
              Reset
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="result-container">
          <h3>NRR Calculation Result</h3>
          
          {result.data && (
            <div className="result-content">
              {/* Batting First Results */}
              {result.data.battingFirst && (
                <div className="result-lines">
                  <div className="result-line">
                    <strong>Scenario:</strong> {result.data.battingFirst.scenario}
                  </div>
                  <div className="result-line">
                    <strong>Answer:</strong> {result.data.battingFirst.answer}
                  </div>
                  <div className="result-line">
                    <strong>Revised NRR:</strong> {result.data.battingFirst.revisedNRR}
                  </div>
                </div>
              )}

              {/* Bowling First Results */}
              {result.data.bowlingFirst && (
                <div className="result-lines">
                  <div className="result-line">
                    <strong>Scenario:</strong> {result.data.bowlingFirst.scenario}
                  </div>
                  <div className="result-line">
                    <strong>Answer:</strong> {result.data.bowlingFirst.answer}
                  </div>
                  <div className="result-line">
                    <strong>Revised NRR:</strong> {result.data.bowlingFirst.revisedNRR}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HowToAchieveGoal;

