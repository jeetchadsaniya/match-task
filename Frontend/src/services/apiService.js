import { API_ENDPOINTS } from "../../config.js";

export const apiService = {
  getTeamList: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_TEAM_LIST);
      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Failed to fetch team list";

        if (data.message) {
          errorMessage = data.message;
        } else if (data.data && data.data.msg) {
          errorMessage = data.data.msg;
        }

        const error = new Error(errorMessage);
        error.statusCode = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        const networkError = new Error(
          "Network error: Unable to connect to server. Please check if the backend is running."
        );
        networkError.statusCode = 0;
        networkError.isNetworkError = true;
        throw networkError;
      }

      throw error;
    }
  },

  getTeams: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_TEAMS);
      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Failed to fetch teams";

        if (data.message) {
          errorMessage = data.message;
        } else if (data.data && data.data.msg) {
          errorMessage = data.data.msg;
        }

        const error = new Error(errorMessage);
        error.statusCode = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        const networkError = new Error(
          "Network error: Unable to connect to server. Please check if the backend is running."
        );
        networkError.statusCode = 0;
        networkError.isNetworkError = true;
        throw networkError;
      }

      throw error;
    }
  },

  calculateNRR: async (formData) => {
    try {
      const response = await fetch(API_ENDPOINTS.CALCULATE_NRR, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error formats from backend
        let errorMessage = "Failed to calculate NRR";

        if (data.message) {
          errorMessage = data.message;
        } else if (data.data && data.data.msg) {
          errorMessage = data.data.msg;
        } else if (data.error) {
          errorMessage = data.error;
        }

        const error = new Error(errorMessage);
        error.statusCode = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        const networkError = new Error(
          "Network error: Unable to connect to server. Please check if the backend is running."
        );
        networkError.statusCode = 0;
        networkError.isNetworkError = true;
        throw networkError;
      }

      throw error;
    }
  },
};
