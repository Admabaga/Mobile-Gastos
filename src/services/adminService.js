import { apiClient } from "../lib/apiClient";

export const adminService = {
  whatsappStatus: () => apiClient.get("/admin/whatsapp/status").then((r) => r.data),
  claudeUsage:    () => apiClient.get("/admin/claude-usage").then((r) => r.data),
};
