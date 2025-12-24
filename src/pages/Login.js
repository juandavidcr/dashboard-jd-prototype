import React, { useState, useContext } from "react";
import { Form, Input, Button, Card, Alert, Modal, Checkbox, Select, message } from "antd";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthProvider";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setError(null);
    setLoading(true);
    try {
      await auth.login(values.email, values.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset password modal
  const [resetVisible, setResetVisible] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetResult, setResetResult] = useState(null);
  const [isAdminBypass, setIsAdminBypass] = useState(false);

  const openReset = () => {
    setResetVisible(true);
    setResetError(null);
    setResetResult(null);
  };

  // Register modal
  const [regVisible, setRegVisible] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);
  const [regResult, setRegResult] = useState(null);

  const openRegister = () => {
    setRegVisible(true);
    setRegError(null);
    setRegResult(null);
  };

  const doRegister = async (values) => {
    setRegError(null);
    setRegLoading(true);
    try {
      const payload = {
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email,
        telefono: values.telefono || null,
      };
      const res = await fetch(`${process.env.REACT_APP_API_BASE || "http://localhost:4000"}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Error ${res.status}`);
      setRegResult(body);
      message.success('Usuario creado (o ya existe). Revise respuesta.');
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  const doReset = async (values) => {
    setResetError(null);
    setResetLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE || "http://localhost:4000"}/api/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // If admin bypass is checked, treat not-found as success (no validation)
        if (res.status === 404 && isAdminBypass) {
          setResetResult({ info: "Solicitud recibida (bypass admin). Revisa instrucciones." });
        } else {
          throw new Error(body.error || `Error ${res.status}`);
        }
      } else {
        const data = await res.json();
        // For demo we show the reset token (in prod you'd email it)
        setResetResult({ token: data.resetToken, info: 'Token simulado (en producción se enviaría por email).' });
      }
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card title="Iniciar sesión" style={{ width: 360 }}>
        {error && <Alert type="error" message={error} style={{ marginBottom: 12 }} />}
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item name="email" label="Correo" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Contraseña" rules={[{ required: true }]}> 
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Entrar
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={openReset}>¿Olvidaste tu contraseña?</Button>
            <Button type="link" onClick={openRegister}>¿No tienes cuenta? Regístrate</Button>
          </div>
        </Form>
      </Card>

      <Modal title="Restablecer contraseña" visible={resetVisible} onCancel={() => setResetVisible(false)} footer={null}>
        {resetError && <Alert type="error" message={resetError} style={{ marginBottom: 12 }} />}
        {resetResult ? (
          <div>
            <Alert type="success" message={resetResult.info} style={{ marginBottom: 12 }} />
            {resetResult.token && (
              <div>
                <strong>Reset token (demo):</strong>
                <pre style={{ whiteSpace: 'break-spaces', background: '#f6f6f6', padding: 8 }}>{resetResult.token}</pre>
              </div>
            )}
          </div>
        ) : (
          <Form layout="vertical" onFinish={doReset}>
            <Form.Item name="email" label="Correo registrado" rules={[{ required: true }]}> 
              <Input />
            </Form.Item>
            <Form.Item>
              <Checkbox checked={isAdminBypass} onChange={(e) => setIsAdminBypass(e.target.checked)}>Soy admin (omitir validación de registro)</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={resetLoading} block>Enviar</Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal title="Registro de usuario" visible={regVisible} onCancel={() => setRegVisible(false)} footer={null}>
        {regError && <Alert type="error" message={regError} style={{ marginBottom: 12 }} />}
        {regResult ? (
          <div>
            <Alert type="success" message={regResult.success ? 'Usuario creado' : 'Usuario existente'} style={{ marginBottom: 12 }} />
            {regResult.password && (
              <div>
                <strong>Contraseña generada (entregar al usuario):</strong>
                <pre style={{ whiteSpace: 'break-spaces', background: '#f6f6f6', padding: 8 }}>{regResult.password}</pre>
              </div>
            )}
          </div>
        ) : (
          <Form layout="vertical" onFinish={doRegister}>
            <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Nombre requerido' }]}> 
              <Input />
            </Form.Item>
            <Form.Item name="apellido" label="Apellido" rules={[{ required: true, message: 'Apellido requerido' }]}> 
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Correo" rules={[{ required: true, message: 'Correo requerido' }, { type: 'email', message: 'Correo inválido' }]}> 
              <Input />
            </Form.Item>
            <Form.Item name="telefono" label="Teléfono" rules={[{ required: false }]}> 
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={regLoading} block>Crear usuario</Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
