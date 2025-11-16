import React from "react";
import { useLocation } from "react-router-dom";

export default function Teams() {
  const location = useLocation();
  return (
    <div>
      <h2>Equipos</h2>
      <p>Ruta actual: {location.pathname}</p>
      <p>Detalles del equipo (placeholder).</p>
    </div>
  );
}
