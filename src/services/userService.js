import { apiClient } from "../lib/apiClient";

export const userService = {
  list:   ()        => apiClient.get("/usuarios").then((r) => r.data),
  create: (payload) => apiClient.post("/usuarios", payload).then((r) => r.data),
};
