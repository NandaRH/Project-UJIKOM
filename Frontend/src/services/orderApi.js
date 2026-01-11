import api from "./api";

// Fetch checkout history for the authenticated user
export const getOrderHistoryApi = (params) =>
  api.get("/order/history", { params });

