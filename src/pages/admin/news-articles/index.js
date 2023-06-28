import React, { useState, useRef } from 'react';
import { Button, Tag, Popconfirm, Typography, Space, message, DatePicker } from 'antd';
import ProTable from '@ant-design/pro-table';
import { UsergroupAddOutlined } from '@ant-design/icons';
import DynamicForm from './components/DynamicForm';
import PageTitleLabel from '@/services/utilities/PageTitleLabel';
import { getNews, removeNews } from '@/services/featuredplaces';
import _ from 'lodash';
import moment from 'moment';
export default () => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [total, setTotal] = useState(0);
  // const [sortOrder, setSortOrder] = useState('ascend');
  const [mode, setMode] = useState('');
  const [data, setData] = useState({});
  const [dateCreationRange, setDateCreationRange] = useState({ start: null, end: null });
  const [place, setPlace] = useState();
  const [selected, setSelected] = useState('featuredPlace');
  let actionRef = useRef();

  const ColoredTag = (type) => (
    <Tag
      color={
        type == 'featuredPlace'
          ? 'green'
          : type == 'featuredTraditions'
          ? 'cyan'
          : type == 'featuredIntangibleHeritage'
          ? 'blue'
          : null
      }
    >
      {type == 'featuredPlace'
        ? 'Featured Place'
        : type == 'featuredTraditions'
        ? 'Featured Traditions'
        : type == 'featuredIntangibleHeritage'
        ? 'Featured Intangible Heritage'
        : type}
    </Tag>
  );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      render: (_, row) => {
        console.log('e', _);
        return row.title;
      },
    },
    {
      title: 'Type',
      render: (_, row) => ColoredTag(row.articleType),
      dataIndex: 'type',
      // width: '33.33%',
      filters: true,
      filterMultiple: true,
      valueType: 'select',
      valueEnum: {
        featuredPlace: 'Featured Place',
        featuredTraditions: 'Featured Traditions',
        featuredIntangibleHeritage: 'Featured Intangible Heritage',
      },
    },
    {
      title: 'Date Created',
      // width: '33.33%',
      render: (_, row) => moment(row?.createdAt).format('MMM DD, YYYY | hh:mm A'),
    },
    {
      title: 'Action',
      fixed: 'right',
      // width: '33.33%',
      render: (_, row) => (
        <Space>
          <Popconfirm
            placement="topRight"
            title="Are you sure? "
            okText="Yes"
            cancelText="Decline"
            onConfirm={() => _removeNews(row._id)}
          >
            <Typography.Text type="danger" style={{ cursor: 'pointer' }}>
              Remove
            </Typography.Text>
          </Popconfirm>
          <Button
            type="primary"
            onClick={() => {
              setVisibleModal(true);
              setData(row);
              setMode('edit');
              setSelected(row.articleType);
            }}
          >
            Update
          </Button>
        </Space>
      ),
    },
  ];
  const _removeNews = async (id) => {
    let res = await removeNews({ _id: id }, true);

    if (res.success) {
      message.success(res.message);
      actionRef?.current?.reload();
    } else message.error(res.message);
  };

  return (
    <>
      <ProTable
        actionRef={actionRef}
        columns={columns}
        toolBarRender={() => [
          <Button
            key="set"
            onClick={() => {
              setVisibleModal(true);
              setMode('add');
            }}
          >
            <UsergroupAddOutlined /> Add News/Articles
          </Button>,
          <DatePicker.RangePicker
            key="dateFilter"
            onChange={(_, valueStr) => {
              setDateCreationRange({ start: valueStr[0], end: valueStr[1] });
              actionRef.current?.reload();
            }}
          />,
        ]}
        request={async (params, sorter, filter) => {
          try {
            let query = {};

            if (_.isNil(filter?.type)) query = { ...query, ...params };
            if (!_.values(dateCreationRange).some((v) => _.isEmpty(v)))
              query = { ...query, ...dateCreationRange };

            let res = await getNews(query);

            if (res.success) {
              let data = _.isNil(filter?.type)
                ? res.data
                : res.data?.filter((v) => {
                    return filter?.type?.includes(v?.articleType);
                  });

              if (sorter?.name) {
                let sorted = _.orderBy(
                  data,
                  ['title'],
                  [sorter?.name == 'descend' ? 'desc' : 'asc'],
                );
                data = sorted;
              }

              setTotal(_.isNil(filter?.type) ? res.total : data?.length);
              return {
                data: data,
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
          total,
          pageSize: 10,
        }}
        search={false}
        scroll={{ x: 700 }}
        dateFormatter="string"
        headerTitle={<PageTitleLabel name={'News/Articles List'} />}
      />
      {/* <PageTitleLabel name={'News/Articles List'} style={{ marginLeft: '0px' }} /> */}
      {visibleModal && (
        <DynamicForm
          visible={visibleModal}
          onClose={() => setVisibleModal(false)}
          actionRef={actionRef}
          mode={mode}
          data={data}
          place={place}
          selected={selected}
          setSelected={setSelected}
        />
      )}
    </>
  );
};
