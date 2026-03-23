import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";

const apiClient = axios.create({
  baseURL: baseURL ? `${baseURL.replace(/\/$/, "")}/carta-publica` : "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export default apiClient;
