import React, { useId } from "react";

/**
 * Campo de formulario accesible (label + input/select/textarea).
 * Soporta type="textarea" y type="select".
 */
export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
  hint,
  children,
  ...rest
}) {
  const id = useId();
  const commonProps = {
    id,
    name,
    value,
    onChange,
    required,
    placeholder,
    className: "form-control",
    "aria-describedby": hint ? `${id}-hint` : undefined,
    ...rest,
  };

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-medium">
        {label}
        {required && <span className="text-danger ms-1" aria-hidden="true">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea rows={3} {...commonProps} />
      ) : type === "select" ? (
        <select {...commonProps}>{children}</select>
      ) : (
        <input type={type} {...commonProps} />
      )}

      {hint && (
        <small id={`${id}-hint`} className="text-muted">
          {hint}
        </small>
      )}
    </div>
  );
}
