import { updateDescription } from '@/services/provinces';
import ProForm, { DrawerForm, ProFormTextArea } from '@ant-design/pro-form';
import { message, Spin, Typography } from 'antd';
import { useEffect } from 'react';
import { useState } from 'react';

export default function ({ closeHandler, data, show, type, reloadPage }) {
  const [savingData, setSavingData] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    setDescription(data?.description || '');

    return () => {
      setDescription('');
    };
  }, [data?._id, data?.description]);

  const submitHandler = async (formData) => {
    try {
      setSavingData(true);
      const response = await updateDescription({
        type,
        id: data?._id,
        description,
      });

      if (response?.success) {
        message.success('Updated successfully!');
        closeHandler();
        reloadPage();
      } else {
        message.error('Problem occurred while updating');
      }
      setSavingData(false);
    } catch (error) {
      message.error('Internal error');
      setSavingData(false);
    }
  };

  return (
    <DrawerForm
      visible={show}
      title={`Description for ${data?.name}`}
      onFinish={submitHandler}
      drawerProps={{
        placement: 'right',
        width: 500,
        closable: false,
        onClose: closeHandler,
      }}
    >
      <Spin spinning={savingData}>
        <ProFormTextArea
          name="description"
          fieldProps={{
            rows: 20,
            value: description,
            onChange: (e) => setDescription(e.target.value),
          }}
        />
      </Spin>
    </DrawerForm>
  );
}
