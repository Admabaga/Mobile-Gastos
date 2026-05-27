import { apiClient } from "../lib/apiClient";

const BASE = "/finanzas";

export const financeService = {
  getSummary:       ()             => apiClient.get(BASE).then(r => r.data),
  saveSettings:     (data)         => apiClient.put(`${BASE}/configuracion`, data).then(r => r.data),
  listIncomes:      ()             => apiClient.get(`${BASE}/ingresos`).then(r => r.data),
  addIncome:        (data)         => apiClient.post(`${BASE}/ingresos`, data).then(r => r.data),
  deleteIncome:     (id)           => apiClient.delete(`${BASE}/ingresos/${id}`),
  sendWaReport:     ()             => apiClient.post(`${BASE}/reporte-wa`).then(r => r.data),
  getTrend:         ()             => apiClient.get(`${BASE}/tendencia`).then(r => r.data),
  getCalendarSpents: (year, month) => apiClient.get(`/gastos/calendario?year=${year}&month=${month}`).then(r => r.data),
};
