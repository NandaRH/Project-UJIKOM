import api from "./api";

export const registerApi = (data) => api.post("/auth/register", data);
export const loginUserApi = (data) =>
  api.post("/auth/login", { ...data, role: "user" });
export const loginAdminApi = (data) =>
  api.post("/auth/login", { ...data, role: "admin" });
export const forgotPasswordApi = (data) =>
  api.post("/auth/forgot-password", data);

