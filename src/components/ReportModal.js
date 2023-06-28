import React, { useState } from 'react';
import {
  Modal,
  Typography,
  Select,
  Checkbox,
  Tag,
  Form,
  Input,
  Upload,
  Button,
  message,
  Spin,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { createReport } from '@/services/provinces';
import { getBase64, b64toBlob } from '@/services/utilities';
import { useModel } from 'umi';
import store from 'store';

export default ({ visible, close }) => {
  // const user = store.get('user');
  const [isUploading, setIsUploading] = useState(false);
  const [form] = Form.useForm();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser: user } = initialState;

  //assets
  const color = {
    bug: 'volcano',
    suggestion: 'cyan',
  };

  return (
    <Modal
      visible={visible}
      onCancel={() => {
        close();
        form.resetFields();
      }}
      closable={false}
      footer={
        <Button type="primary" onClick={() => form.submit()} disabled={isUploading}>
          SUBMIT
        </Button>
      }
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography.Text>Report</Typography.Text>
        </div>
      }
      destroyOnClose
    >
      <Spin spinning={isUploading}>
        <Form
          form={form}
          style={{ marginTop: 25 }}
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 18,
          }}
          layout="horizontal"
          onFinish={async (e) => {
            let type = e.type;

            let formData = new FormData();
            let data = {};
            let photosBlob = [];

            for (let i = 0; i < e.imgs?.fileList?.length; i++) {
              const src = await getBase64(e.imgs?.fileList[i].originFileObj);
              const block = src.split(';');
              const contentType = block[0].split(':')[1],
                realData = block[1].split(',')[1];
              let blob = b64toBlob({ b64Data: realData, contentType });
              photosBlob.push(blob);
            }

            data.type = type;
            data.title = e.title;
            data.senderId = user._id;
            if (e.description) data.description = e.description;
            for (let i = 0; i < photosBlob.length; i++) formData.append('photos', photosBlob[i]);
            formData.append('data', JSON.stringify(data));

            try {
              setIsUploading(true);
              let res = await createReport(formData);

              if (res.success) {
                await setInitialState((prev) => ({ ...prev, refresh: 0 }));
                message.success(res.message);
                form.resetFields();
                close();
                setIsUploading(false);
              }
            } catch (err) {
              console.log(err);
              message.error('Error in the server.');
              setIsUploading(false);
            }
          }}
        >
          <Form.Item label="Type" name="type" rules={[{ required: true }]} initialValue={['bug']}>
            <Select
              mode="multiple"
              defaultValue={['bug']}
              options={[
                {
                  value: 'bug',
                  label: 'Bug',
                },
                {
                  value: 'suggestion',
                  label: 'Suggestion',
                },
              ]}
              tagRender={({ label, value, closable, onClose }) => {
                return (
                  <Tag
                    color={color[value]}
                    closable={closable}
                    onClose={onClose}
                    style={{
                      marginRight: 3,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {label}
                  </Tag>
                );
              }}
            />
          </Form.Item>
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Upload" name="imgs">
            <Upload.Dragger maxCount={5} multiple>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                You can support your description by adding a photo here. (maximum of 5 photo)
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};
