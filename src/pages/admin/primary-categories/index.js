import { useState, useRef } from 'react';
import { Button, message, Popconfirm, Tag, Typography } from 'antd';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { getCategoryList, editCategoryById } from '@/services/categorieslist';
import Avatar from 'antd/lib/avatar/avatar';
import { b64toBlob, getBase64 } from '@/services/utilities';
import PageTitleLabel from '@/services/utilities/PageTitleLabel';

import { isEmpty } from 'lodash';

const { Text } = Typography;

export default () => {
  let [place, setPlace] = useState([]);
  let [meta, setMeta] = useState(null);
  let [drawer, setDrawer] = useState(false);
  let [currentRow, setCurrentRow] = useState([]);
  let [declineModal, HandleDeclineModal] = useState(false);
  let [updateVisble, handleUpdateVisible] = useState(false);
  let actionRef = useRef();

  const columns = [
    {
      title: 'Icon',
      dataIndex: 'icon',
      render: (data) => <Avatar src={data.small} alt={data.small} />,
    },
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
      title: 'Plural',
      dataIndex: 'plural',
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
                isPrimary: true,
              },
              true,
            );
            if (res.success) {
              setMeta(res.categories);
              console.log(res.categories);
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
        headerTitle={<PageTitleLabel name={'Primary Categories'} />}
      />
      {updateVisble && (
        <ModalForm
          title="Edit in Primary Category"
          width={400}
          visible={updateVisble}
          onVisibleChange={handleUpdateVisible}
          onFinish={async (values) => {
            message.loading('Loading');

            if (!isEmpty(values?.icon)) {
              const src = await getBase64(values.icon[0].originFileObj);
              const block = src.split(';');
              const contentType = block[0].split(':')[1],
                realData = block[1].split(',')[1];
              values.icon = b64toBlob({ b64Data: realData, contentType });
            }

            const res = await editCategoryById(values.id, values);
            if (res.success) {
              handleUpdateVisible(false);
              message.success(res.message);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            } else {
              message.error('Update Failed');
            }
          }}
        >
          <ProFormText name="id" hidden initialValue={currentRow && currentRow._id} />
          <Avatar src={currentRow.icon.small} alt={currentRow.icon.small} />
          <ProFormText label="Name" name="name" initialValue={currentRow && currentRow.name} />
          <ProFormText
            label="Plural"
            name="plural"
            initialValue={currentRow && currentRow.plural}
          />
          <ProFormUploadButton
            name={'icon'}
            max={1}
            label="Photo"
            title="Click here to upload photo"
            accept=".png,.jpg,.jpeg"
          />
        </ModalForm>
      )}
    </>
  );
};
