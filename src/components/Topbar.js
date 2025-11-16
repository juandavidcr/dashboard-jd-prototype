import React, { useContext } from "react";
import { Layout, Avatar, Space, Dropdown, Menu } from "antd";
import { UserOutlined } from "@ant-design/icons";
import AuthContext from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

export default function Topbar() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => auth.logout();

  const goProfile = () => navigate("/profile");
  const goChangePassword = () => navigate("/profile/change-password");

  const menu = (
    <Menu>
      <Menu.Item key="profile" onClick={goProfile}>
        Perfil
      </Menu.Item>
      <Menu.Item key="change" onClick={goChangePassword}>
        Cambiar contraseña
      </Menu.Item>
      <Menu.Item key="logout" onClick={onLogout}>
        Cerrar sesión
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="topbar" style={{ padding: "0 16px", background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Dashboard</div>
        <Space>
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <div style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} />
            </div>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
}
