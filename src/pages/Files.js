import React, { useState, useEffect } from "react";
import { Card, Form,  Button, Select, Upload, List, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

export default function Files() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:4000'}/api/files`);
      if (!res.ok) throw new Error('Error fetching files');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const onFinish = async (values) => {
    if (!values.file || values.file.fileList.length === 0) {
      message.error('Selecciona un archivo');
      return;
    }
    const fileObj = values.file.fileList[0].originFileObj;
    if (!fileObj) {
      message.error('Error al obtener el archivo');
      return;
    }
    const allowedExt = ['.pdf', '.docx', '.csv', '.txt'];
    const ext = fileObj.name.substring(fileObj.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExt.includes(ext)) {
      message.error('Tipos permitidos: pdf, docx, csv, txt');
      return;
    }
    const formData = new FormData();
    formData.append('file', fileObj);
    formData.append('type', values.type || '');
    setUploading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:4000'}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      message.success('Archivo subido correctamente');
      form.resetFields();
      loadFiles();
    } catch (err) {
      message.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return { fileList: e };
    }
    return e && e.fileList ? { fileList: e.fileList } : { fileList: [] };
  };

  return (
    <div>
      <h2>Archivos</h2>
      <Card style={{ maxWidth: 720 }}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="type" label="Tipo" rules={[{ required: true }]}>
            <Select placeholder="Selecciona el tipo">
              <Option value="pdf">pdf</Option>
              <Option value="docx">docx</Option>
              <Option value="csv">csv</Option>
              <Option value="txt">txt</Option>
            </Select>
          </Form.Item>

          <Form.Item name="file" label="Archivo" valuePropName="fileList" getValueFromEvent={normFile} rules={[{ required: true }]}>
            <Upload beforeUpload={() => false} maxCount={1} accept=".pdf,.docx,.csv,.txt">
              <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={uploading}>Subir</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Archivos subidos" style={{ marginTop: 16 }}>
        <List
          dataSource={files}
          renderItem={item => (
            <List.Item>
              <a href={`${process.env.REACT_APP_API_BASE || 'http://localhost:4000'}${item.url}`} target="_blank" rel="noreferrer">{item.filename}</a>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
