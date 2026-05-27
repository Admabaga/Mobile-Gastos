import React from "react";
import "./Card.css";

export default function Card({ icon, title, subtitle, footer, children }) {
  return (
    <article className="app-card h-100 shadow-sm rounded-4 border-0">
      <div className="card-body d-flex flex-column">
        {icon && (
          <div className="app-card__icon mb-3">
            <img src={icon} alt="" aria-hidden="true" />
          </div>
        )}
        {title && <h3 className="app-card__title mb-1">{title}</h3>}
        {subtitle && <p className="app-card__subtitle mb-3">{subtitle}</p>}
        <div className="flex-grow-1">{children}</div>
        {footer && <div className="app-card__footer mt-3">{footer}</div>}
      </div>
    </article>
  );
}
