import { apiClient } from "../lib/apiClient";

export const categoryService = {
  list: () => apiClient.get("/categorias").then((r) => r.data),
};
