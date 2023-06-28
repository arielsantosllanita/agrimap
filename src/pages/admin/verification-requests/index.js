import { useState, useEffect, useRef } from 'react';
import { Button, Input, message, Popconfirm, Select, Tag, Typography } from 'antd';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { getVerificationRequests, verifyPlace, declineRequest } from '@/services/establishments';
import ViewModal from './components/view';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import PageTitleLabel from '@/services/utilities/PageTitleLabel';
import store from 'store';
import moment from 'moment';
import { useModel } from 'umi';
const { Text } = Typography;

export default () => {
  let [place, setPlace] = useState([]);
  let [meta, setMeta] = useState(null);
  let [drawer, setDrawer] = useState(false);
  let [selectedPlace, setSelectedPlace] = useState({});
  let [declineModal, HandleDeclineModal] = useState(false);
  let actionRef = useRef();
  // let user = store.get('user-admin');
  const { initialState } = useModel('@@initialState');
  let { currentUser: user } = initialState;

  const [primaryCategories, setPrimaryCategories] = useState([]);

  const [establishmentFilter, setEstablishmentFilter] = useState({ type: 'name', value: null });

  const fetchVerifyPlace = async (placeId, isVerified) => {
    let hide = message.loading('Please wait');
    try {
      let res = await verifyPlace({ placeId, isVerified }, true);
      hide();
      if (res.success) {
        message.success('Successfully verified');
        actionRef.current.reload();
      } else {
        message.error(res.message);
      }
    } catch (error) {
      hide();
      message.error('An error occurred');
    }
  };

  useEffect(() => {
    if (!user.roles.includes('admin')) {
      window.location = '/lgu-featured-places';
    }
  }, [user.roles]);

  const columns = [
    {
      title: 'Is verified?',
      dataIndex: 'isVerified',
      render: (data, entity) => (
        <span>
          {entity?.isVerified ? (
            <Tag color="green">Verified</Tag>
          ) : (
            <Tag color="red">Not Verified</Tag>
          )}
        </span>
      ),
      filters: true,
      filterMultiple: false,
      defaultFilteredValue: '0',
      valueEnum: {
        1: { text: 'Verified' },
        0: {
          text: 'Not verified',
        },
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      render: (_, record) => (
        <a
          onClick={() => {
            setPlace(record);
            setDrawer(true);
          }}
        >
          {_}
        </a>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'primaryCategoryName',
      filters: true,
      filterMultiple: true,
      valueType: 'select',
      valueEnum: primaryCategories?.reduce((a, c) => {
        return { ...a, [c?._id]: { text: c?.name } };
      }, {}),
      render: (data, entity) => {
        return <Tag color="green">{entity?.primaryCategory?.name}</Tag>;
      },
    },
    {
      title: 'City',
      dataIndex: 'cityId',
      render: (data) => <span>{data.name}</span>,
    },
    {
      title: 'Province',
      dataIndex: 'provinceId',
      render: (data) => <span>{data.name}</span>,
    },
    {
      title: 'Registration date',
      dataIndex: 'createdAt',
      sorter: true,
      render: (data, entity) => moment(entity?.createdAt).format('MMM DD, YYYY | hh:mm A'),
    },
    // {
    //   title: 'Actions',
    //   dataIndex: 'isVerified',
    //   fixed: 'right',
    //   render: (data, entity) => {
    //     return !data ? (
    //       <Popconfirm
    //         placement="topRight"
    //         title={'Are you sure? '}
    //         okText="Yes"
    //         cancelText="Decline"
    //         onConfirm={() => fetchVerifyPlace(entity?._id, true)}
    //         onCancel={() => {
    //           setSelectedPlace(entity);
    //           HandleDeclineModal(true);
    //         }}
    //       >
    //         <Text type="success" underline={true} style={{ cursor: 'pointer' }}>
    //           VERIFY
    //         </Text>
    //       </Popconfirm>
    //     ) : (
    //       <Popconfirm
    //         placement="topRight"
    //         title={'Are you sure? '}
    //         okText="Yes"
    //         cancelText="No"
    //         onConfirm={() => fetchVerifyPlace(entity?._id, false)}
    //       >
    //         <Text type="danger" underline={true} style={{ cursor: 'pointer' }}>
    //           UNVERIFY
    //         </Text>
    //       </Popconfirm>
    //     );
    //   },
    // },
  ];

  return (
    <>
      <ProTable
        actionRef={actionRef}
        columns={columns}
        request={async (params, sorter, filter) => {
          try {
            let res = await getVerificationRequests(
              {
                ...params,
                isVerified: filter?.isVerified?.[0] === '1' ? true : false,
                ...(filter?.primaryCategoryName?.length > 0
                  ? { primaryCategory: filter?.primaryCategoryName }
                  : {}),
                ...(establishmentFilter.value
                  ? { filter: JSON.stringify(establishmentFilter) }
                  : {}),
                ...(sorter?.createdAt ? { sort: sorter?.createdAt } : {}),
              },
              true,
            );

            if (res.success) {
              setMeta(res.meta);
              setPrimaryCategories(res.primaryCategoryList);
              let newTableDate = null;

              // console.clear();
              // console.log('FILTER', filter);
              // console.log('PARAMAS', params);
              // console.log('PLACES', res.places);
              // console.log('SORTER', sorter);

              if (sorter?.name) {
                let newOrder = _.orderBy(
                  res.places,
                  ['name'],
                  [sorter?.name == 'descend' ? 'desc' : 'asc'],
                );
                newTableDate = newOrder;
              } else {
                newTableDate = null;
              }

              // console.log('TABLE_DATA', res);
              // console.log(
              //   'ENUM',
              //   res.places?.reduce((a, c) => {
              //     return { ...a, [c.primaryCategory._id]: { text: c.primaryCategory.name } };
              //   }, {}),
              // );

              return {
                data: newTableDate || res.places,
                success: true,
              };
            } else {
              message.error('Fetching failed');
            }
          } catch (error) {
            console.log(error);
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
        headerTitle={<PageTitleLabel name={'Establishments'} />}
        toolBarRender={() => [
          <form
            key="filter"
            onSubmit={(e) => {
              e.preventDefault();

              // console.clear();
              // console.log('SEARCH_SUBMIT', establishmentFilter);
              actionRef.current.reload();
            }}
          >
            <Input
              type={establishmentFilter.type === 'registration_date' ? 'date' : 'text'}
              value={establishmentFilter.value}
              onChange={(e) =>
                setEstablishmentFilter({ type: establishmentFilter.type, value: e.target.value })
              }
              addonBefore={
                <Select
                  defaultValue="name"
                  onChange={(filter) => setEstablishmentFilter({ type: filter, value: '' })}
                >
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                  <option value="city">City</option>
                  <option value="province">Province</option>
                  <option value="registration_date">Registration Date</option>
                </Select>
              }
              addonAfter={
                <Button onClick={() => actionRef.current.reload()} type="text">
                  Filter
                </Button>
              }
              allowClear
            />
            <input type="submit" hidden />
          </form>,
        ]}
      />
      {/* <ModalForm
        title={`Decline Request | ${selectedPlace?.name}`}
        width="400px"
        submitter={{ searchConfig: { submitText: 'Submit' } }}
        visible={declineModal}
        onVisibleChange={HandleDeclineModal}
        onFinish={async (values) => {
          let res = await declineRequest({
            merchantId: selectedPlace?.merchantID,
            establishmentId: selectedPlace?._id,
            establishmentName: selectedPlace?.name,
            ...values,
          });

          if (res.success) {
            message.success(res.message);
            HandleDeclineModal(false);
            actionRef.current.reload();
          } else {
            message.error(res.message);
          }
        }}
      >
        <ProFormTextArea
          name={'reason'}
          placeholder="Reason for declination of request"
          rows={4}
          rules={[
            {
              required: true,
            },
          ]}
        />
      </ModalForm> */}

      <ViewModal drawer={drawer} setDrawer={setDrawer} place={place} actionRef={actionRef} />
    </>
  );
};
