import { apiClient } from "../lib/apiClient";

export const authService = {
  register:       (payload) => apiClient.post("/auth/register",        payload).then((r) => r.data),
  login:          (payload) => apiClient.post("/auth/login",           payload).then((r) => r.data),
  forgotPassword: (email)   => apiClient.post("/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword:  (payload) => apiClient.post("/auth/reset-password",  payload).then((r) => r.data),
};
