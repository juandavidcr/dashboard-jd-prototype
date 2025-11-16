import React, { useState, useContext } from "react";
import { Form, Input, Button, Card, message } from "antd";
import AuthContext from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const auth = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await auth.changePassword(values.currentPassword, values.newPassword);
      message.success("Contraseña actualizada");
      navigate("/profile");
    } catch (err) {
      message.error(err.message || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <Card title="Cambiar contraseña">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="currentPassword" label="Contraseña actual" rules={[{ required: true }]}> 
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="Nueva contraseña" rules={[{ required: true }]}> 
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cambiar contraseña
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
