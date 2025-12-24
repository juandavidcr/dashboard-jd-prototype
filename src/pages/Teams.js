import React, { useState, useEffect } from "react";
import { Card, List, Button, Modal, Form, Input, Select, message } from "antd";

export default function Teams() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:4000'}/api/groups`);
      if (!res.ok) throw new Error('Error fetching groups');
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error(err);
      message.error('Unable to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const onCreate = async (values) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:4000'}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Error ${res.status}`);
      message.success('Group created');
      setVisible(false);
      loadGroups();
    } catch (err) {
      message.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Teams</h2>
      <Card style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Groups</h3>
          <Button type="primary" onClick={() => setVisible(true)}>Create Group</Button>
        </div>

        <List
          loading={loading}
          dataSource={groups}
          renderItem={item => (
            <List.Item>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{item.nombre}</strong>
                  <div style={{ color: '#666' }}>Consecutivo: {item.consecutivo || '-'}</div>
                </div>
                <div style={{ color: '#333' }}>{item.clasificacion}</div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      <Modal title="Create Group" open={visible} onCancel={() => setVisible(false)} footer={null}>
        <Form layout="vertical" onFinish={onCreate}>
          <Form.Item name="consecutivo" label="Consecutive" rules={[{ pattern: /^\d*$/, message: 'Must be a number' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nombre" label="Group Name" rules={[{ required: true, message: 'Required' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="clasificacion" label="Classification" rules={[{ required: true, message: 'Required' }]}> 
            <Select>
              <Select.Option value="mando gerente">Mando gerente</Select.Option>
              <Select.Option value="mando medio">Mando medio</Select.Option>
              <Select.Option value="empleado">Empleado</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>Create</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
