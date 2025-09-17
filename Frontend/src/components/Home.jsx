import { useState, useEffect } from "react";
import { apiService } from "../services/apiService.js";
import "./Home.css";

const Home = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getTeams();

      if (!response || !Array.isArray(response.data)) {
        throw new Error("Invalid API response format");
      }
      setTeams(response.data);
    } catch (err) {
      console.log(err);

      setError(err.message || "Failed to fetch team data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTeams();
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading team data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="header">
        <h2>Team Points Table</h2>
        <button onClick={handleRefresh} className="refresh-button">
          Refresh
        </button>
      </div>

      <div className="table-container">
        <table className="teams-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>Matches</th>
              <th>Won</th>
              <th>Lost</th>
              <th>NRR</th>
              <th>For</th>
              <th>Against</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {teams
              ?.sort((a, b) => b.points - a.points)
              ?.map((team, index) => (
                <tr key={team.id}>
                  <td>{index + 1}</td>
                  <td>{team.name}</td>
                  <td>{team.matchesPlayed}</td>
                  <td>{team.matchesWon}</td>
                  <td>{team.matchesLost}</td>
                  <td>{team.nrr}</td>
                  <td>{team.for}</td>
                  <td>{team.against}</td>
                  <td>{team.points}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
