import axios from "axios";

export const httpClient = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || "External API error";
    return Promise.reject(new Error(message));
  }
);