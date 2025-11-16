import React, { useContext } from "react";
import { Card, Button } from "antd";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthProvider";

export default function Profile() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Card title="Perfil de usuario" style={{ maxWidth: 700 }}>
      <p>
        <strong>Correo:</strong> {auth.user?.email || "-"}
      </p>
      <div style={{ marginTop: 12 }}>
        <Button type="primary" onClick={() => navigate("/profile/change-password")}>Cambiar contraseña</Button>
      </div>
    </Card>
  );
}
