import { apiClient } from "../lib/apiClient";

export const paymentMethodService = {
  list:   ()        => apiClient.get("/metodoPagos").then((r) => r.data),
  create: (payload) => apiClient.post("/metodoPagos", payload).then((r) => r.data),
};
