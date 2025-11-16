import React from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Sider } = Layout;
const { SubMenu } = Menu;

export default function Sidebar({ collapsed, onCollapse }) {
  const location = useLocation();
  const selectedKey = location.pathname === "/" ? "/" : location.pathname;

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div className="logo" style={{ height: 48, margin: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={process.env.PUBLIC_URL + '/logo-synesiss.png'}
          alt="Synesiss"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://synesiss.info/img/logo.jpg'; }}
          style={{ maxHeight: 36, maxWidth: '50px', objectFit: 'contain', display: 'block' }}
        />
      </div>
      <Menu theme="dark" selectedKeys={[selectedKey]} mode="inline">
        <Menu.Item key="/">
          <Link to="/">Panel</Link>
        </Menu.Item>
        <Menu.Item key="/analytics">
          <Link to="/analytics">Analytics</Link>
        </Menu.Item>
        <SubMenu key="sub1" title="Usuarios">
          <Menu.Item key="/users/tom"><Link to="/users/tom">Tom</Link></Menu.Item>
          <Menu.Item key="/users/bill"><Link to="/users/bill">Bill</Link></Menu.Item>
          <Menu.Item key="/users/alex"><Link to="/users/alex">Alex</Link></Menu.Item>
        </SubMenu>
        <SubMenu key="sub2" title="Equipos">
          <Menu.Item key="/teams/1"><Link to="/teams/1">Team 1</Link></Menu.Item>
          <Menu.Item key="/teams/2"><Link to="/teams/2">Team 2</Link></Menu.Item>
        </SubMenu>
        <Menu.Item key="/files">
          <Link to="/files">Archivos</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}
