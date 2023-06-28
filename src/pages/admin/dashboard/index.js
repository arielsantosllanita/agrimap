import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Avatar, DatePicker, Select, message } from 'antd';
import { Line } from '@ant-design/charts';
import {
  getRegisteredPerCategory,
  getBookingsPerDay,
  getBookingStatus,
} from '@/services/dashboard';
import { PageContainer } from '@ant-design/pro-layout';
import moment from 'moment';
import { getProvinces } from '@/services/provinces';
import PageTitleLabel from '@/services/utilities/PageTitleLabel';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default () => {
  let [registeredPerCategory, setRegisteredPerCategory] = useState([]);
  let [loadingA, setLoadingA] = useState(false);
  let [bookingsPerDay, setBookingsPerDay] = useState([]);
  let [loadingB, setLoadingB] = useState(false);
  let [bookingStatus, setBookingStatus] = useState([]);
  let [loadingC, setLoadingC] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [isFetching, setFetching] = useState(false);
  const [province, setProvince] = useState('all');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  let fetchRegisteredPerCategory = async () => {
    setLoadingA(true);
    let res = await getRegisteredPerCategory({}, true);
    setRegisteredPerCategory(res.registeredPerCategory);
    setLoadingA(false);
  };

  let fetchBookingsPerDay = async (query) => {
    let data = provinces.filter((el) => el.name.toLowerCase() == query.province)[0];
    setLoadingB(true);
    let res = await getBookingsPerDay({ ...query, _id: data?._id }, true);
    setBookingsPerDay(res.bookingsPerDay);
    setLoadingB(false);
  };

  let fetchGetBookingStatus = async () => {
    setLoadingC(true);
    let res = await getBookingStatus({}, true);
    setBookingStatus(res.bookingStatus);
    setLoadingC(false);
  };

  const fetchProvinces = async () => {
    try {
      setFetching(true);
      let res = await getProvinces(true);
      setProvinces(res.provinces);
      setFetching(false);
    } catch (error) {
      setFetching(false);
      message.error('Failed to fetch provinces.');
    }
  };

  useEffect(() => {
    fetchProvinces();
    fetchRegisteredPerCategory();
  }, []);

  useEffect(() => {
    let _start = moment().subtract(14, 'days').format('YYYY-MM-DD');
    let _end = moment(new Date(), 'DD MMMM, YYYY').format('YYYY-MM-DD');

    setLoadingB(true);
    setStart(_start);
    setEnd(_end);
    fetchBookingsPerDay({
      startDate: _start,
      endDate: _end,
      province,
    });
    setLoadingB(false);
  }, []);

  useEffect(() => {
    fetchGetBookingStatus();
  }, []);

  const onDateChange = (value, dateString) => {
    let _start = value
      ? moment(value[0]).format('YYYY-MM-DD')
      : moment().subtract(14, 'days').format('YYYY-MM-DD');
    let _end = value
      ? moment(value[1]).format('YYYY-MM-DD')
      : moment(new Date(), 'DD MMMM, YYYY').format('YYYY-MM-DD');

    setStart(_start);
    setEnd(_end);
    fetchBookingsPerDay({
      startDate: _start,
      endDate: _end,
      province,
    });
  };

  const onProvinceChange = (val) => {
    setProvince(val);
    fetchBookingsPerDay({
      startDate: start,
      endDate: end,
      province: val,
    });
  };

  const config = {
    data: bookingsPerDay || [],
    xField: '_id',
    yField: 'count',
    point: {
      size: 5,
      shape: 'diamond | circule',
    },
    tooltip: {
      formatter: (data) => {
        return {
          name: moment(data._id).format('MMMM DD, YYYY'),
          value: data.count,
        };
      },
      showMarkers: true,
      showContent: true,
      position: 'left',
      showCrosshairs: true,
    },
  };

  const CustomSelect = () => (
    <Select
      showSearch
      placeholder="Select a province"
      optionFilterProp="children"
      value={province}
      onChange={(e) => {
        onProvinceChange(e);
      }}
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      style={{
        width: 200,
      }}
    >
      <Option value="all" key="all">
        All
      </Option>
      {provinces.map((el, i) => (
        <Option value={el.name.toLowerCase()} key={i}>
          {el.name}
        </Option>
      ))}
    </Select>
  );

  return (
    <PageContainer
      extra={[<CustomSelect />]}
      loading={isFetching}
      title={<PageTitleLabel name={'Dashboard'} />}
    >
      <Row gutter={20}>
        <Col span={6}>
          <Card title={'Registered Per Category'} loading={loadingA}>
            <List
              itemLayout="horizontal"
              dataSource={registeredPerCategory || []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item?._id?.icon?.small} />}
                    title={item?._id?.name}
                    description={item?.total}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={18}>
          <Card
            title={'Bookings per Day'}
            loading={loadingB}
            extra={[
              <RangePicker
                defaultValue={[moment().subtract(14, 'days'), moment(new Date(), 'DD MMMM, YYYY')]}
                format={'DD MMMM, YYYY'}
                onChange={onDateChange}
              />,
            ]}
          >
            <Line {...config} />
          </Card>
          <Card title={'Booking Status'} loading={loadingC} style={{ marginTop: 20 }}>
            <Row gutter={15}>
              {bookingStatus?.map((data, i) => {
                return (
                  <Col key={i} span={6}>
                    <Statistic title={<h4>{data?._id?.toUpperCase()}</h4>} value={data?.count} />
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};
