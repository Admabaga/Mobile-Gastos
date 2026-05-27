import { useCallback, useState } from "react";
import { getErrorMessage } from "../lib/apiClient";

/**
 * Hook para operaciones de escritura (POST/PUT/DELETE).
 * Mantiene estado de carga, éxito y error.
 */
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const mutate = useCallback(
    async (variables) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const data = await mutationFn(variables);
        setSuccess(true);
        return { ok: true, data };
      } catch (err) {
        setError(getErrorMessage(err, "No fue posible completar la operación"));
        return { ok: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return { mutate, loading, error, success, reset };
}
