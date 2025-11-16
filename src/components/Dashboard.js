import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Widget from "./Widget";
import ChartPlaceholder from "./ChartPlaceholder";
import "./dashboard.css";
import { Routes, Route } from "react-router-dom";
import Analytics from "../pages/Analytics";
import Users from "../pages/Users";
import Teams from "../pages/Teams";
import Files from "../pages/Files";
import Profile from "../pages/Profile";
import ChangePassword from "../pages/ChangePassword";

const { Content, Footer } = Layout;

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  // Datos de ejemplo para widgets
  const widgets = [
    { id: 1, title: "Usuarios", value: "1,234" },
    { id: 2, title: "Sesiones", value: "8,901" },
    { id: 3, title: "Ingresos", value: "$12,345" },
    { id: 4, title: "Tasa de conversión", value: "4.2%" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }} className="dashboard-root">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout className="dashboard-main">
        <Topbar />
        <Content className="dashboard-content">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div className="widgets-grid">
                    {widgets.map((w) => (
                      <Widget key={w.id} title={w.title} value={w.value} />
                    ))}
                  </div>
                  <div className="chart-area">
                    <ChartPlaceholder title="Visitas (últimos 7 días)" />
                  </div>
                </>
              }
            />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/users/*" element={<Users />} />
            <Route path="/teams/*" element={<Teams />} />
            <Route path="/files" element={<Files />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: "center" }}>Screenio ©2025</Footer>
      </Layout>
    </Layout>
  );
}
