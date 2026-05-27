import { apiClient } from "../lib/apiClient";

export const summaryService = {
  get:     ()             => apiClient.get("/resumen").then((r) => r.data),
  history: (meses = 6)    => apiClient.get("/resumen/historial", { params: { meses } }).then((r) => r.data),
};
