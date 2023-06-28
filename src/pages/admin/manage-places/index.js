import { useState, useRef, useEffect } from 'react';
import { Button, message, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { editPlacesById } from '@/services/managePlaces';
import { getAllCity } from '@/services/provinces';
import PageTitleLabel from '@/services/utilities/PageTitleLabel';

export default () => {
  let [meta, setMeta] = useState(null);
  let actionRef = useRef();
  let [currentRow, setCurrentRow] = useState([]);
  let [updateVisible, handleUpdateVisible] = useState(false);
  let [isFetchingCities, setFetchingCities] = useState(false);
  let [citiesByProvince, setCitiesByProvince] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setFetchingCities(true);
        let res = await getAllCity();
        setCitiesByProvince(res.cities);
        setFilteredCities(res.cities); // Initialize filteredCities with all cities
        console.log(res.cities);
        setFetchingCities(false);
      } catch (error) {
        setFetchingCities(false);
        message.error('Failed to fetch provinces.');
      }
    };

    fetchCities();
  }, []);

  const handleFilter = (value) => {
    if (value) {
      const filtered = citiesByProvince.filter(
        (city) => city.regionId?.name.toLowerCase().includes(value.toLowerCase()),
        city.provinceId?.name.toLowerCase().includes(value.toLowerCase()),
        city?.name.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(citiesByProvince);
    }
  };

  const columns = [
    {
      title: 'City/Municipality',
      dataIndex: 'city',
      width: '40%',
      render: (_, row) => <Typography.Text ellipsis>{row?.name}</Typography.Text>,
      filters: [
        // Generate filter options based on available provinces
        ...new Set(citiesByProvince.map((city) => city?.name)),
      ]
        .sort((a, b) => (a > b ? 1 : -1))
        .map((cityName) => ({
          text: cityName,
          value: cityName,
        })),
      onFilter: (value, record) => record?.name === value,
      sorter: (a, b) => (a.city > b.city ? 1 : -1),
      filterSearch: true,
    },
    {
      title: 'Province',
      dataIndex: 'province',
      width: '30%',
      render: (_, row) => <Typography.Text ellipsis>{row?.provinceId?.name}</Typography.Text>,
      filters: [
        // Generate filter options based on available provinces
        ...new Set(citiesByProvince.map((province) => province.provinceId.name)),
      ]
        .sort((a, b) => (a > b ? 1 : -1))
        .map((provinceName) => ({
          text: provinceName,
          value: provinceName,
        })),
      onFilter: (value, record) => record.provinceId?.name === value,
      sorter: (a, b) => (a?.provinceId?.name > b?.provinceId?.name ? 1 : -1),
      filterSearch: true,
    },
    {
      title: 'Region',
      dataIndex: 'region',
      width: '70%',
      render: (_, row) => <Typography.Text ellipsis>{row?.regionId?.name}</Typography.Text>,
      filters: [
        // Generate filter options based on available regions in citiesByProvince
        ...new Set(citiesByProvince.map((city) => city.regionId?.name)),
      ]
        .sort((a, b) => (a > b ? 1 : -1))
        .map((regionName) => ({
          text: regionName,
          value: regionName,
        })),
      onFilter: (value, record) => record.regionId?.name === value,
      sorter: (a, b) => (a.regionId?.name > b.regionId?.name ? 1 : -1),
      filterSearch: true,
    },
    {
      title: 'Actions',
      dataIndex: 'Actions',
      fixed: 'right',
      align: 'center',
      render: (_, row) => {
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setCurrentRow(row);
              handleUpdateVisible(true);
            }}
          >
            Edit
            <EditOutlined />
          </Button>
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
            let res = await getAllCity({
              ...params,
            });
            if (res.success) {
              setMeta(res.meta);
              return {
                data: res.cities,
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
          pageSize: 10,
        }}
        search={false}
        scroll={{ x: 700 }}
        dateFormatter="string"
        headerTitle={<PageTitleLabel name={'Manage Places'} />}
      />

      {updateVisible && (
        <ModalForm
          modalProps={{
            okText: 'Submit',
          }}
          title="Edit Places"
          width="400px"
          visible={updateVisible}
          onVisibleChange={handleUpdateVisible}
          onFinish={async (values) => {
            try {
              const res = await editPlacesById(values.id, values);
              if (res.success) {
                console.log(values);
                message.success('Successfully Edited');
                handleUpdateVisible(false);
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              } else {
                message.error('Update failed.');
              }
            } catch (error) {
              console.log(error);
              message.error('An error occurred while updating.');
            }
          }}
        >
          <ProFormText name="id" hidden initialValue={currentRow && currentRow._id} />
          <ProFormText
            label="City/Municipality"
            name="city"
            initialValue={currentRow && currentRow.name}
            max="10"
          />
          <ProFormText
            label="Province"
            name="province"
            initialValue={currentRow && currentRow.provinceId?.name}
            max="10"
          />
          <ProFormText
            label="Region"
            name="region"
            initialValue={currentRow && currentRow.regionId?.name}
            max="10"
          />
        </ModalForm>
      )}
    </>
  );
};
