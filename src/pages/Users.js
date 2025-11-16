import React from "react";
import { useLocation } from "react-router-dom";

export default function Users() {
  const location = useLocation();
  return (
    <div>
      <h2>Usuarios</h2>
      <p>Ruta actual: {location.pathname}</p>
      <p>Listado / detalles de usuarios (placeholder).</p>
    </div>
  );
}
