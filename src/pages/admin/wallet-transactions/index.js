import { useState, useEffect, useRef } from 'react';
import { Button, message, Popconfirm, Typography, Card, List } from 'antd';
import PageTitleLabel from '@/services/utilities/PageTitleLabel';
import ProTable from '@ant-design/pro-table';
import {
  getWalletTransations,
  remitToMerchantWallet,
  getCountWalletPending,
} from '@/services/wallet';
import moment from 'moment';
import store from 'store';
const { Text, Link } = Typography;
import { useModel } from 'umi';

export default () => {
  let actionRef = useRef();
  // let user = store.get('user-admin');
  const { initialState } = useModel('@@initialState');
  let { currentUser: user } = initialState;
  let [state, setState] = useState({ pendingToWallet: [] });

  let fetchRemitToMerchantWallet = async (id, params) => {
    let hide = message.loading('Please wait');
    let res = await remitToMerchantWallet(id, { ...params }, true);
    if (res.success) {
      hide();
      message.success('Amount remitted');
      actionRef.current.reload();
    } else {
      hide();
      message.error(res.message);
    }
  };

  let fetchCountWalletPending = async () => {
    let res = await getCountWalletPending({}, true);
    setState({ ...res });
  };

  useEffect(() => {
    fetchCountWalletPending();
    if (!user.roles.includes('admin')) {
      window.location = '/lgu-featured-places';
    }
  }, []);

  function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
  }

  const columns = [
    {
      title: 'Reference No.',
      dataIndex: 'referenceNo',
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionID',
    },
    {
      title: 'Transaction date',
      dataIndex: 'createdAt',
      valueType: 'date',
      render: (dom, entity) => moment(entity?.createdAt).format('MMM DD, YYYY | hh:mm A'),
    },
    {
      title: 'Amount',
      search: false,
      render: (dom, entity) => `₱${entity?.amount}`,
    },
    {
      title: 'Service Fee',
      render: (dom, entity) => `₱${entity?.booking?.serviceFee}`,
      search: false,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      search: false,
      render: (data, entity) => (
        <Text strong type={entity?.status === 'pending' ? 'warning' : 'success'}>
          {entity?.status?.toUpperCase()}
        </Text>
      ),
      filters: true,
      filterMultiple: false,
      defaultFilteredValue: '1',
      valueEnum: {
        1: { text: 'Pending' },
        0: {
          text: 'Success',
        },
      },
    },
    {
      title: 'Merchant',
      dataIndex: 'recipientId',
      search: false,
      render: (dom) => (
        <>
          {dom?.firstName} {dom?.lastName}
        </>
      ),
    },
    {
      title: 'Paid by',
      dataIndex: 'transactorId',
      search: false,
      render: (dom) => (
        <>
          {dom?.firstName} {dom?.lastName}
        </>
      ),
    },
    {
      title: 'Actions',
      fixed: 'right',
      search: false,
      render: (data, entity) => {
        return (
          entity?.status === 'pending' && (
            <Popconfirm
              placement="topRight"
              title={'Are you sure? '}
              okText="Yes"
              cancelText="No"
              onConfirm={() =>
                fetchRemitToMerchantWallet(entity?._id, {
                  placeId: entity?.booking?.place?._id,
                  placeName: entity?.booking?.place?.name,
                  amount: entity?.amount,
                  fee: entity?.booking?.serviceFee,
                  walletBalance: entity?.transactorId?.walletBalance,
                })
              }
            >
              <Button type="primary">Remit to Merchant</Button>
            </Popconfirm>
          )
        );
      },
    },
  ];

  return (
    <>
      <ProTable
        actionRef={actionRef}
        columns={columns}
        request={async (params, sorter, filter) => {
          try {
            let res = await getWalletTransations(
              {
                status: filter.status[0] === '1' ? 'pending' : 'success',
                ...params,
              },
              true,
            );
            if (res.success) {
              return {
                data: res.transactions,
                success: true,
              };
            } else {
              message.error(res.message);
            }
          } catch (error) {
            message.error('Fetching failed');
          }
        }}
        rowKey="key"
        pagination={{
          showQuickJumper: true,
        }}
        scroll={{ x: 1000 }}
        search={{ labelWidth: 150 }}
        dateFormatter="string"
        headerTitle={<PageTitleLabel name={'Wallet Transactions (Payment)'} />}
      />

      <Card
        title={
          <>
            <p>Waiting to be remitted to merchant wallet.</p>
          </>
        }
        style={{ marginTop: 20 }}
      >
        <List
          grid={{ gutter: 16, column: 4 }}
          itemLayout="horizontal"
          dataSource={state?.pendingToWallet}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={moment(item?._id).format('MMMM DD, YYYY')}
                description={<h1>{item?.count}</h1>}
              />
            </List.Item>
          )}
        />
      </Card>
    </>
  );
};
