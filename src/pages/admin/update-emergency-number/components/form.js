import React, { useState } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Modal, Button, Form, Input, Space, Spin, message } from 'antd';
import { updateContactNumbers } from '@/services/emergency';

export default ({ visible, close, data, id, trigger }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setIsSaving(true);
    try {
      let res = await updateContactNumbers({ id, updatedNumbers: values?.contacts });
      if (res.success) {
        message.success(res.message);
        trigger();
        close();
      }
    } catch (e) {
      console.log(e);
    }
    setIsSaving(false);
  };

  return (
    <Modal
      visible={visible}
      onCancel={() => close()}
      closable={false}
      title="Update Contact Numbers"
      footer={
        <Button type="primary" disabled={!isEditing} onClick={() => form.submit()}>
          SAVE
        </Button>
      }
    >
      <Spin spinning={isSaving}>
        <Form onFinish={onFinish} autoComplete="off" form={form}>
          <Form.List name="contacts" initialValue={data}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{
                      display: 'flex',
                      marginBottom: 8,
                    }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[
                        {
                          required: true,
                          message: 'Missing name',
                        },
                      ]}
                    >
                      <Input placeholder="Name...." onChange={() => setIsEditing(true)} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'number']}
                      rules={[
                        {
                          required: true,
                          message: 'Missing number',
                        },
                      ]}
                    >
                      <Input placeholder="Number..." onChange={() => setIsEditing(true)} />
                    </Form.Item>
                    <MinusCircleOutlined
                      onClick={() => {
                        remove(name);
                        setIsEditing(true);
                      }}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add field
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Spin>
    </Modal>
  );
};
