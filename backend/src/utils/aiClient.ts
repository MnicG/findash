import axios from "axios";

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL ?? "http://localhost:8000",
  headers: {
    "X-Internal-Key": process.env.INTERNAL_API_KEY ?? "",
  },
  timeout: 300000, // 5 minutos
});

export default aiClient;