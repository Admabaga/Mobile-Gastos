import { apiClient } from "../lib/apiClient";

const BASE = "/grupos";

export const groupService = {
  list:         ()              => apiClient.get(BASE).then(r => r.data),
  create:       (data)          => apiClient.post(BASE, data).then(r => r.data),
  get:          (id)            => apiClient.get(`${BASE}/${id}`).then(r => r.data),
  addMember:    (id, data)      => apiClient.post(`${BASE}/${id}/miembros`, data).then(r => r.data),
  addExpense:   (id, data)      => apiClient.post(`${BASE}/${id}/gastos`, data).then(r => r.data),
  settleSplit:  (id, splitId)   => apiClient.patch(`${BASE}/${id}/splits/${splitId}/saldar`).then(r => r.data),
};
