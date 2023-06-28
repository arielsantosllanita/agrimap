import { useState, useRef, useEffect } from 'react';
import { Button, message, Popconfirm, Tag, Typography } from 'antd';
import { DownOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { getCategoryList } from '@/services/categorieslist';
import { editCategoryById } from '@/services/categorieslist';
import AddSubCategory from './components/AddSubCategory';
import PageTitleLabel from '@/services/utilities/PageTitleLabel';
const { Text } = Typography;

export default () => {
  let [primaryCategoriesFilter, setPrimaryCategories] = useState({});
  let [meta, setMeta] = useState(null);
  let actionRef = useRef();
  let [currentRow, setCurrentRow] = useState([]);
  let [updateVisble, handleUpdateVisible] = useState(false);

  useEffect(() => {
    const getPrimaryCategories = async () => {
      let res = await getCategoryList(
        {
          isPrimary: true,
          isStandAlone: false,
        },
        true,
      );

      if (res?.success) {
        res?.categories?.map((data) => {
          primaryCategoriesFilter[data._id] = { text: data.name };
        });
        setPrimaryCategories(primaryCategoriesFilter);
        console.log('CATEGORRRY', setPrimaryCategories);
      }
    };
    getPrimaryCategories();
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
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
      title: 'Primary Category Name',
      render: (_, record) => <Tag>{record?.parentId?.name}</Tag>,
      filters: true,
      filterMultiple: false,
      defaultFilteredValue: '6129ca033a1726fc45828e0f',
      valueEnum: primaryCategoriesFilter,
    },
    {
      title: 'Actions',

      dataIndex: 'Actions',

      render: (_, record) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(record);
              handleUpdateVisible(true);
            }}
          >
            Edit
          </a>
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
            let res = await getCategoryList(
              {
                ...params,
                parentId: filter?.['1']?.[0],
                isPrimary: false,
              },
              true,
            );
            if (res.success) {
              setMeta(res.meta);
              return {
                data: res.categories,
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
        headerTitle={<PageTitleLabel name={'Sub Categories'} />}
        toolBarRender={() => [<AddSubCategory actionRef={actionRef} key={'add'} />]}
      />
      {updateVisble && (
        <ModalForm
          title="Edit in Sub Categories"
          width="400px"
          visible={updateVisble}
          onVisibleChange={handleUpdateVisible}
          onFinish={async (values) => {
            const res = await editCategoryById(values.id, values);
            if (res.success) {
              message.success('Successfully Edited');
              handleUpdateVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            } else {
              message.error('Update failed.');
            }
          }}
        >
          <ProFormText name="id" hidden initialValue={currentRow && currentRow._id} />
          <ProFormText
            label="Name"
            name="name"
            initialValue={currentRow && currentRow.name}
            max="10"
          />
        </ModalForm>
      )}
    </>
  );
};
