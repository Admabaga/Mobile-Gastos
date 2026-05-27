import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../lib/apiClient";

/**
 * Hook genérico para llamadas GET.
 * @param {Function} fetcher - función async sin argumentos que retorna data.
 * @param {Array} deps      - dependencias para refetch automático.
 * @param {Object} options  - { enabled, initialData }.
 */
export function useFetch(fetcher, deps = [], options = {}) {
  const { enabled = true, initialData = null } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err, "No fue posible cargar la información"));
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (enabled) run();
  }, [run, enabled]);

  return { data, loading, error, refetch: run, setData };
}
