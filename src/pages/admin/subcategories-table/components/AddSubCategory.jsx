import { getCategories, getPlaces } from '@/services/featuredplaces';
import { b64toBlob, getBase64 } from '@/services/utilities';
import { PlusOutlined } from '@ant-design/icons';
import ProForm, {
  DrawerForm,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormUploadDragger,
} from '@ant-design/pro-form';
import { Button, Form, message } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import _ from 'lodash';
import { addSubCategory } from '@/services/categorieslist';
import pluralize from 'pluralize';

export default ({ actionRef }) => {
  const [form] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const { currentUser: user } = initialState;
  const [primaryCategories, setPrimaryCategories] = useState([]);

  const addHandler = async (values) => {
    try {
      const photos = [];
      //   console.clear();
      //   console.log('values', values);

      if (_.isEmpty(values?.icon)) {
        message.error('Please provide photos');
        return;
      }

      for (let i = 0; i < values.icon?.length; i++) {
        const src = await getBase64(values.icon[i].originFileObj);
        const block = src.split(';');
        const contentType = block[0].split(':')[1],
          realData = block[1].split(',')[1];
        let blob = b64toBlob({ b64Data: realData, contentType });
        photos.push(blob);
      }

      const res = await addSubCategory({
        data: {
          name: values?.name,
          plural: pluralize(values?.name, 2),
          parentId: values?.parentId,
        },
        icon: photos,
      });

      message.success(res?.message || 'Added successfully!');
      form.resetFields();
      actionRef.current.reload();
      return true;
    } catch (err) {
      //   console.clear();
      //   console.log('ERR', err);
      message.error('Problem occured while adding itinerary');
    }
  };

  // FETCH PRIMARY CATEGORIES
  useEffect(() => {
    (async () => {
      try {
        const res = await getCategories();
        if (res?.success) {
          setPrimaryCategories(res?.cat?.map((v) => ({ value: v?._id, label: v?.name })) || []);
        } else {
          message.error('Problem occured while fetching primary categories');
        }
      } catch (err) {
        message.error('Problem occured while fetching primary categories');
      }
    })();
  }, [user?.cityId]);

  return (
    <DrawerForm
      title="Add sub category"
      form={form}
      width={420}
      autoFocusFirstInput
      trigger={
        <Button type="primary">
          <PlusOutlined />
          Add sub category
        </Button>
      }
      drawerProps={{
        destroyOnClose: true,
      }}
      submitTimeout={5000}
      onFinish={addHandler}
      submitter={{ searchConfig: { submitText: 'Add' } }}
    >
      <ProForm.Group>
        <ProFormText rules={[{ required: true }]} width="md" name="name" label="Name" />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormSelect
          options={primaryCategories}
          rules={[{ required: true }]}
          width="md"
          name="parentId"
          label="Primary Category"
        />
      </ProForm.Group>

      <ProFormGroup>
        <ProFormUploadDragger
          required
          fieldProps={{ multiple: false, accept: '.png,.jpg,.jpeg' }}
          label="Icon"
          description="Drag and drop your photo here"
          title=""
          name="icon"
        />
      </ProFormGroup>
    </DrawerForm>
  );
};
