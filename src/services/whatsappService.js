import { apiClient } from "../lib/apiClient";

const BASE = "/usuarios/perfil/whatsapp";

export const whatsappService = {
  status:       () => apiClient.get(`${BASE}/status`).then((r) => r.data),
  generateCode: () => apiClient.post(`${BASE}/code`).then((r) => r.data),
  unlink:       () => apiClient.delete(BASE).then((r) => r.data),
};
