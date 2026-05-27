import { apiClient } from "../lib/apiClient";

const RESOURCE = "/gastos";

export const expenseService = {
  list:    ()        => apiClient.get(RESOURCE).then((r) => r.data),
  getById: (id)      => apiClient.get(`${RESOURCE}/${id}`).then((r) => r.data),
  create:  (payload) => apiClient.post(RESOURCE, payload).then((r) => r.data),
};
