import { useState, useRef, useEffect } from 'react';
import { Button, message, Popconfirm, Tag, Typography, Input, Card, List, Modal } from 'antd';
import { DownOutlined, QuestionCircleOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { getadmins, addAdmin } from '@/services/adimlists';
import PageTitleLabel from '@/services/utilities/PageTitleLabel';
import Avatar from 'antd/lib/avatar/avatar';
import ToolbarRender from '@ant-design/pro-table/lib/components/ToolBar';
const { Search } = Input;
import { removeAdmins } from '@/services/adimlists';

const { Text } = Typography;

export default () => {
  let [meta, setMeta] = useState(null);
  let actionRef = useRef();
  let [currentRow, setCurrentRow] = useState([]);
  const [createModalVisible, handleModalVisible] = useState(false);
  let [isModalVisible, setIsModalVisible] = useState(false);
  let [admins, setAdmins] = useState([]);
  let [state, setState] = useState({
    isFetchingAdmins: false,
  });

  const fetchAdmins = async (email) => {
    console.log(email);
    let hide = message.loading('Searching email.');
    try {
      let res = await addAdmin({ email, role: 'admin' }, true);
      if (res.success) {
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

  const fetchRemoveAdmin = async (email) => {
    let hide = message.loading('Loading');
    try {
      let res = await removeAdmins({ email, role: 'admin' }, true);
      if (res.success) {
        hide();
        message.success('Admin Successfully Removed');
        actionRef.current.reload();
      } else {
        hide();
        message.error(res.message);
      }
    } catch (error) {
      message.error('Fetching failed.');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'photo',
      render: (data) => <Avatar src={data?.small} alt={data?.small} />,
    },
    {
      title: 'Full-name',
      dataIndex: 'firstName:',
      render: (dom, entity) => {
        return entity.firstName + ' ' + entity.lastName + '';
      },
    },

    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      fixed: 'right',
      render: (item, entity) => (
        <Popconfirm
          placement="topRight"
          title="Are you sure? "
          okText="Yes"
          cancelText="Decline"
          onConfirm={() => fetchRemoveAdmin(entity?.email)}
        >
          <Text type="danger" style={{ cursor: 'pointer' }}>
            Remove
          </Text>
        </Popconfirm>
      ),
    },
  ];
  return (
    <>
      <ProTable
        actionRef={actionRef}
        columns={columns}
        toolBarRender={() => [
          <Button
            key="set"
            onClick={() => {
              setIsModalVisible(true);
            }}
          >
            <UsergroupAddOutlined /> Add Admin
          </Button>,
        ]}
        request={async (params, sorter, filter) => {
          try {
            let res = await getadmins(
              {
                ...params,
                isPrimary: true,
              },
              true,
            );
            if (res.success) {
              setMeta(res.admins);
              console.log(res.admins);
              return {
                data: res.admins,
                success: true,
              };
            } else {
              message.error('Fetching failed');
            }
          } catch (error) {
            message.error('Fetching failed');
          }
        }}
        rowKey="key"
        pagination={{
          total: meta?.total ? meta?.total : 0,
        }}
        search={false}
        scroll={{ x: 700 }}
        dateFormatter="string"
        headerTitle={<PageTitleLabel name={'Admin List'} />}
      />

      <Modal
        onCancel={() => setIsModalVisible(false)}
        title="Add Admin"
        width={400}
        visible={isModalVisible}
        footer={false}
      >
        <Search
          placeholder="Enter email"
          enterButton="Add"
          size="large"
          onSearch={(e) =>
            fetchAdmins(e).then(() => {
              actionRef.current.reload();
              setIsModalVisible(false);
            })
          }
        />
      </Modal>
    </>
  );
};
