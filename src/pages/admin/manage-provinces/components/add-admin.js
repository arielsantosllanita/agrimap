import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, List, Image, Card, message, Typography } from 'antd';
import { getLGUAdmins, addAdmin, removeAdmin } from '@/services/provinces';
import { DeleteFilled } from '@ant-design/icons';
const { Search } = Input;

export default ({ isModalVisible, setIsModalVisible, city, province, type, trigger }) => {
  let [lguAdmins, setLGUAdmins] = useState([]);
  let [state, setState] = useState({
    isFetchingAdmins: false,
  });

  const fetchRemoveLGUAdmin = async (email) => {
    let hide = message.loading('Removing admin.');
    try {
      let res = await removeAdmin(
        {
          email,
          role: type == 'municipal' ? 'lgu-admin' : 'lgu-province',
        },
        true,
      );
      if (res.success) {
        hide();
        message.success(res.message);
        if (type == 'municipal') fetchLGUAdmins('municipal', city?._id);
        else fetchLGUAdmins('province', province?._id);
      } else {
        hide();
        message.error('An error occurred');
      }
    } catch (error) {
      message.error('Fetching failed.');
    }
  };

  const fetchAddLGUAdmin = async (email) => {
    let hide = message.loading('Searching email.');
    try {
      let query;
      if (type == 'municipal') query = { email, cityId: city?._id, role: 'lgu-admin' };
      else query = { email, provinceId: province?._id, role: 'lgu-province' };

      let res = await addAdmin(query, true);
      if (res.success) {
        if (type == 'municipal') fetchLGUAdmins('municipal', city?._id);
        else fetchLGUAdmins('province', province?._id);
        hide();
        message.success('User added');
      } else {
        message.error(res.message);
        hide();
      }
    } catch (error) {
      message.error('Fetching failed.');
    }
  };

  const fetchLGUAdmins = async (type, id) => {
    setState({ ...state, isFetchingAdmins: true });
    try {
      let res = await getLGUAdmins({ type, id }, true);
      if (res.success) {
        setLGUAdmins(res.lguAdmins);
        setState({ ...state, isFetchingAdmins: false });
      } else {
        message.error('Fetching failed.');
      }
    } catch (error) {
      setState({ ...state, isFetchingAdmins: false });
      message.error('Fetching failed.');
    }
  };

  useEffect(() => {
    if (type == 'municipal') fetchLGUAdmins('municipal', city?._id);
    else fetchLGUAdmins('province', province?._id);
  }, [city, province, trigger]);

  return (
    <>
      <Modal
        onCancel={() => setIsModalVisible(false)}
        title={`LGU Admins in ${type == 'municipal' ? city?.name : province.name}`}
        visible={isModalVisible}
        footer={false}
      >
        <Search
          placeholder="Enter email"
          enterButton="Add"
          size="large"
          onSearch={(e) => fetchAddLGUAdmin(e)}
        />
        <Card loading={state.isFetchingAdmins} style={{ marginTop: 20 }}>
          <List
            itemLayout="horizontal"
            dataSource={lguAdmins}
            preview={false}
            renderItem={(item, i) => (
              <List.Item
                key={i}
                actions={[
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteFilled />}
                    onClick={() => fetchRemoveLGUAdmin(item.email)}
                  >
                    Remove
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Image
                      width={50}
                      height={50}
                      style={{
                        objectFit: 'cover',
                      }}
                      src={item?.photo?.small}
                    />
                  }
                  title={`${item.firstName} ${item.lastName}`}
                  description={
                    <Typography.Text type="secondary" copyable>
                      {item?.email}
                    </Typography.Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Modal>
    </>
  );
};
