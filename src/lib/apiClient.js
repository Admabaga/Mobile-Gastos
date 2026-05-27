import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "";

export const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Adjunta el token de sesión en cada petición
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// Redirige al login si el token expiró o es inválido
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = "Ha ocurrido un error inesperado") {
  if (!error) return fallback;
  return (
    error.response?.data?.message ||
    error.response?.data ||
    error.message ||
    fallback
  );
}
