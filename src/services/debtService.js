import { apiClient } from "../lib/apiClient";

const BASE = "/deudas";

export const debtService = {
  list:       (params = {})  => apiClient.get(BASE, { params }).then(r => r.data),
  create:     (data)          => apiClient.post(BASE, data).then(r => r.data),
  get:        (id)            => apiClient.get(`${BASE}/${id}`).then(r => r.data),
  addPayment: (id, data)      => apiClient.post(`${BASE}/${id}/pagos`, data).then(r => r.data),
  settle:     (id)            => apiClient.patch(`${BASE}/${id}/saldar`).then(r => r.data),
};
