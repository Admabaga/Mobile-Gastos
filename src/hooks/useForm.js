import { useCallback, useState } from "react";

/**
 * Hook minimal de formularios controlados.
 * - values: estado del form
 * - handleChange: setter genérico por name
 * - setValues / setField / reset
 */
export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setField = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback(() => setValues(initialValues), [initialValues]);

  return { values, handleChange, setField, setValues, reset };
}
