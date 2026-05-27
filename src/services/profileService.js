import { apiClient } from "../lib/apiClient";

export const profileService = {
  get:    ()        => apiClient.get("/usuarios/perfil").then((r) => r.data),
  update: (payload) => apiClient.put("/usuarios/perfil", payload).then((r) => r.data),
};
