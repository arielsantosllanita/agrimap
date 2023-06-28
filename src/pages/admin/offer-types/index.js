import { useState, useRef } from 'react';
import { Button, Card, message, Popconfirm, Tag, List, Typography, Image, Select } from 'antd';
import {
  DownOutlined,
  QuestionCircleOutlined,
  DeleteFilled,
  PlusOutlined,
} from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import ProForm, {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { getOfferTypes, editOfferTypeId } from '@/services/Types';
import { removeCategory } from '@/services/Types';
import PageTitleLabel from '@/services/utilities/PageTitleLabel';
import { useEffect } from 'react';
import { getAllCategories } from '@/services/categorieslist';
const { Text } = Typography;

export default () => {
  let [place, setPlace] = useState([]);
  let [meta, setMeta] = useState(null);
  let [currentRow, setCurrentRow] = useState([]);
  let [updateVisble, handleUpdateVisible] = useState(false);
  let [declineModal, HandleDeclineModal] = useState(false);
  let [drawer, setDrawer] = useState(false);
  let actionRef = useRef();

  const [isAddingApplicableCategory, setAddApplicableCategory] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedApplicableCategories, setSelectedApplicableCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllCategories();
        setCategories(data?.categories);
      } catch (err) {
        message.error('Problem occurred while fetching categories');
      }
    })();
  }, []);

  // const hadleUpdate = async (fields) => {
  //   console.log(fields);
  //   message.success('Successfully Edited');
  //   try {

  //   } catch (error) {
  //     message.error('Update Failed');
  //   }
  // };
  const applicableCategories = async (data) => {
    let hide = message.loading('Please wait');
    try {
      let res = await removeCategory(data, true);
      hide();
      if (res.success) {
        let temp = currentRow.applicableCategories;
        temp.splice(data.index, 1);
        message.success(res.message);
        setCurrentRow({
          ...currentRow,
          applicableCategories: temp,
        });
        actionRef.current.reload();
      } else {
        message.error(res.message);
      }
    } catch (error) {
      hide();
      message.error('An error occurred');
    }
  };

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
      title: 'Actions',
      dataIndex: 'Actions',
      render: (_, record) => {
        return (
          <a
            onClick={() => {
              setSelectedApplicableCategories(
                record?.applicableCategories?.map((v) => ({ value: v?._id, label: v?.name })),
              );
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
            let res = await getOfferTypes({}, true);
            console.log(res.offerTypes);
            if (res.success) {
              setMeta(res.offerTypes);

              return {
                data: res.offerTypes,

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
        headerTitle={<PageTitleLabel name={'Offer Types'} />}
      />

      {updateVisble && (
        <ModalForm
          title="Edit Offer Types"
          width="600px"
          visible={updateVisble}
          onVisibleChange={handleUpdateVisible}
          modalProps={{ onCancel: () => setAddApplicableCategory(false) }}
          onFinish={async (values) => {
            message.loading('Please wait.');
            handleUpdateVisible(false);
            const data = {
              ...values,
              applicableCategories: selectedApplicableCategories?.map((v) => v?.value),
            };

            const res = await editOfferTypeId(values.id, data, true);
            if (res.success) {
              message.success('Successfully Edited');
              setAddApplicableCategory(false);
              handleUpdateVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            } else {
              message.error('Failed');
            }
          }}
        >
          <ProFormText name="id" hidden initialValue={currentRow && currentRow._id} />
          <ProFormText label="Name" name="name" initialValue={currentRow && currentRow.name} />

          <Card
            title="List of Applicable Categories"
            extra={[
              !isAddingApplicableCategory && (
                <Button
                  key={'add123'}
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setAddApplicableCategory(true);
                  }}
                />
              ),
              isAddingApplicableCategory && (
                <Select
                  key={'categories123'}
                  mode="multiple"
                  allowClear
                  style={{ width: 505 }}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Select categories"
                  onSelect={(_, data) =>
                    setSelectedApplicableCategories([...selectedApplicableCategories, { ...data }])
                  }
                  defaultValue={currentRow?.applicableCategories?.map((v) => v?._id)}
                  options={categories.map((v) => ({ label: v?.name, value: v?._id }))}
                />
              ),
            ]}
          >
            <List
              style={{ hieght: '100hv' }}
              itemLayout="horizontal"
              dataSource={currentRow && currentRow.applicableCategories}
              preview={false}
              renderItem={(item, i) => (
                <List.Item
                  key={i}
                  actions={[
                    <Popconfirm
                      placement="topRight"
                      title={'Are you sure? '}
                      okText="Yes"
                      cancelText="Decline"
                      onConfirm={() =>
                        applicableCategories({
                          offerTypeId: currentRow._id,
                          categoryId: item._id,
                          index: i,
                        })
                      }
                    >
                      <Button type="primary" danger icon={<DeleteFilled />}>
                        Remove
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta title={`${item.name}`} />
                </List.Item>
              )}
            />
          </Card>
        </ModalForm>
      )}
    </>
  );
};
