import { fetchFeedbacks, seenFeedback } from '@/services/provinces';
import ProTable from '@ant-design/pro-table';
import {
  Button,
  Empty,
  Image,
  Badge,
  Space,
  Tag,
  Typography,
  Modal,
  Tooltip,
  message,
  Checkbox,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

import { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import { resolveReport } from '@/services/provinces';
import { PageContainer } from '@ant-design/pro-layout';
import store from 'store';

export default () => {
  const { initialState } = useModel('@@initialState');
  const actionRef = useRef();
  const [showModal, setShowModal] = useState({ show: false, data: null });
  const [paginateMeta, setPaginateMeta] = useState(0);
  const [totalData, setTotalData] = useState({});
  const [activeKey, setActiveKey] = useState('all');
  const [viewUnread, setViewUnread] = useState(false);

  if (!initialState.currentUser.roles.includes('super-admin')) {
    history.back();
  }
  console.log(totalData);
  const renderBadge = (count) => {
    return (
      <Badge
        count={count}
        style={{
          marginTop: -2,
          marginLeft: 4,
          color: '#1890FF',
          backgroundColor: '#E6F7FF',
        }}
      />
    );
  };

  const columns = [
    {
      title: 'ID',
      width: 100,
      render: (_, row) => (
        <Typography.Link>
          <Tag color="blue">#{row._id.substr(row?._id.length - 6, row?._id.length)}</Tag>
        </Typography.Link>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 250,
      render: (text, data) => (
        <Typography.Text
          type={!data?.unreadStatus?.isUnread ? 'secondary' : ''}
          strong={data?.unreadStatus?.isUnread}
          style={{ cursor: 'pointer', width: 230 }}
          ellipsis
        >
          {text}
        </Typography.Text>
      ),
    },
    {
      title: 'Types',
      width: 300,
      dataIndex: 'type',
      render: (types) => (
        <>
          {types?.map((type, i) => (
            <Tag key={i} color={type === 'bug' ? 'volcano' : 'green'}>
              {type.toUpperCase()}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Is resolve ?',
      align: 'center',
      width: 150,
      render: (_, row) => {
        if (row.type.includes('personal')) {
          return (
            <Typography.Text italic disabled>
              Not Applicable
            </Typography.Text>
          );
        }

        return (
          <Typography.Text
            style={{ color: row.resolveStatus?.isResolve ? 'green' : 'red', fontSize: 25 }}
          >
            {row.resolveStatus?.isResolve ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Seen by',
      width: 250,
      align: 'center',
      render: (_, row) => (
        <Typography.Text>
          {row?.unreadStatus?.seenId?.firstName} {row?.unreadStatus?.seenId?.lastName}
        </Typography.Text>
      ),
    },
  ];

  return (
    <PageContainer title="Feedbacks">
      <FeedbackViewer {...showModal} formRef={actionRef} closer={setShowModal} />
      <ProTable
        actionRef={actionRef}
        columns={columns}
        request={async (params, sorter, filter) => {
          try {
            const res = await fetchFeedbacks(
              { ...params, key: activeKey, unread: viewUnread },
              true,
            );
            if (res.success) {
              setPaginateMeta(res.total.total);
              setTotalData(res.total);
              return {
                data: res.feedbacks,
                success: true,
              };
            } else {
              message.error('Fetching failed');
            }
          } catch (error) {
            message.error('Fetching failed');
          }
        }}
        onRow={(data, index) => {
          return {
            onClick: () => {
              setShowModal({ show: true, data });
            },
          };
        }}
        pagination={{
          total: paginateMeta,
          pageSize: 10,
        }}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey,
            items: [
              {
                key: 'all',
                label: <span>All {renderBadge(totalData.total)}</span>,
              },
              {
                key: 'bug',
                label: <span>Bug {renderBadge(totalData.totalBug)}</span>,
              },
              {
                key: 'suggestion',
                label: <span>Suggestions {renderBadge(totalData?.totalSuggestion)}</span>,
              },
            ],
            onChange: (key) => {
              setActiveKey(key);
              actionRef?.current.reload();
            },
          },
        }}
        toolBarRender={() => [
          <Checkbox
            key={'unreadFilter'}
            onChange={(e) => {
              setViewUnread(e.target.checked);
              actionRef?.current.reload();
            }}
          >
            View Unread only
          </Checkbox>,
        ]}
        cardBordered
        rowKey="key"
        search={false}
        scroll={{ x: 700 }}
        style={{ width: 1000 }}
        dateFormatter="string"
      />
    </PageContainer>
  );
};

function FeedbackViewer({ data, show, closer, formRef }) {
  // const user = store.get('user-admin');
  const { initialState, setInitialState } = useModel('@@initialState');
  let { currentUser: user } = initialState;

  const roleTypo = (role) => {
    if (role?.includes('super-admin')) return 'Superadmin';
    if (role?.includes('admin')) return 'Admin';
    if (role?.includes('lgu-admin')) return 'LGU-Admin';
    return 'User';
  };

  const handleResolveReport = async () => {
    try {
      let res = await resolveReport({ id: data?._id });
      if (res.success) {
        message.success(res.message);
        closer({ show: false, data: null });
      }
    } catch {
      message.error(res.message);
    }
  };

  useEffect(() => {
    (async () => {
      if (data?._id && user?._id) {
        await seenFeedback({ id: data?._id, userId: user._id }, true);
      }
    })();
  }, [data?._id, user?._id]);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography.Text>
            Report{' '}
            <Typography.Link>
              #{data?._id.substr(data?._id.length - 6, data?._id.length)}
            </Typography.Link>
          </Typography.Text>
          {!data?.resolveStatus?.isResolve && (
            <Button
              type="primary"
              onClick={() => {
                Modal.confirm({
                  title: 'Confirm resolve ?',
                  icon: <ExclamationCircleOutlined />,
                  okText: 'Confirm',
                  cancelText: 'Cancel',
                  onOk: handleResolveReport,
                });
              }}
            >
              RESOLVE
            </Button>
          )}
          {data?.resolveStatus?.isResolve && (
            <Tooltip title="This bug or suggestion has been resolved">
              <Typography.Text style={{ color: 'green' }}>
                <CheckCircleOutlined /> Resolve
              </Typography.Text>
            </Tooltip>
          )}
        </div>
      }
      footer={null}
      width={900}
      visible={show}
      closable={false}
      onCancel={async () => {
        await setInitialState((prev) => ({ ...prev, refresh: prev?.refresh + 1 || 23 }));
        closer({ show: false, data: null });
      }}
    >
      <Typography.Title level={3}>{data?.title}</Typography.Title>
      <Typography.Text italic type="secondary">
        Sent by {data?.senderId?.firstName} {data?.senderId?.lastName} (
        {roleTypo(data?.senderId.roles)})
      </Typography.Text>
      <br />
      <br />
      <Typography.Text style={{ marginTop: 50 }}>Description</Typography.Text>
      <br />
      <Typography.Paragraph>
        {data?.description ? (
          data?.description
        ) : (
          <Typography.Text italic type="secondary">
            No description.
          </Typography.Text>
        )}
      </Typography.Paragraph>

      <Space direction="vertical" style={{ width: '100%' }}>
        <label htmlFor="photos">Photos</label>
        {data?.photos?.length > 0 ? (
          <Image.PreviewGroup>
            {data?.photos?.map((v) => (
              <Image width={200} src={v?.large} key={v?.large} alt={v} />
            ))}
          </Image.PreviewGroup>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Space>
    </Modal>
  );
}
