import { getCalamityComment, respondUserStatus, readResponse } from '@/services/calamity';
import { LeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Empty,
  Image,
  Input,
  List,
  message,
  Modal,
  Row,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { isNil, sample } from 'lodash';
import { useState, useEffect } from 'react';
import { Pie } from '@ant-design/charts';
import './response.css';
import moment from 'moment';
import Mapbox from '@/services/utilities/mapbox';
import Map from './map';

const DescriptionItem = ({ title, content }) => (
  <div className="site-description-item-profile-wrapper">
    <p className="site-description-item-profile-p-label">{title}:</p>
    <span>{content}</span>
  </div>
);

export default ({ postId, closeTable }) => {
  const [responses, setResponses] = useState([]);
  const [responseDetails, setResponseDetails] = useState({ show: false, data: null });
  const [isResponding, setisResponding] = useState({ isTrue: false, message: '', RESOLVED: false });
  const [reFetchResponses, setReFetchResponses] = useState(0);
  const [doneRead, setDoneRead] = useState(false);

  // FETCH RESPONSES
  useEffect(() => {
    (async () => {
      if (isNil(postId)) return;

      const res = await getCalamityComment({ id: postId });
      if (!res?.success) {
        message.error('Fetching failed');
      } else {
        setResponses(
          res.data?.map((v) => ({
            ...v,
            status: v?.status?.replace('_', ' '),
            response: v?.response?.map((r) => ({ ...r, status: r?.status?.replace('_', ' ') })),
          })),
        );
        // console.clear();
        // console.log('RESPONSES', res.data);
      }
    })();
  }, [postId, reFetchResponses]);

  const respondUser = async () => {
    const res = await respondUserStatus(responseDetails?.data?._id, {
      message: isResponding?.message || '',
      ...(isResponding?.RESOLVED ? { status: 'RESOLVED' } : {}),
    });
    if (res?.success) {
      message.success(res.message);
      setisResponding({ isTrue: false, message: '' });
      setReFetchResponses(reFetchResponses + 1);
    } else {
      message.error(res?.message || 'Internal error');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId, data) => (
        <Badge
          count={
            !data.isRead && data != null && !doneRead ? (
              <ExclamationCircleOutlined
                style={{
                  color: '#f5222d',
                }}
              />
            ) : null
          }
          offset={[10, 0]}
        >
          <a
            onClick={() => {
              setResponseDetails({ show: true, data });
              readResponse({ _id: data._id });
              setDoneRead(false);
            }}
          >
            {userId?.firstName} {userId.lastName}
          </a>
        </Badge>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        // SAFE, NEED_HELP
        let color = status == 'SAFE' ? 'green' : status == 'RESCUE_INCOMING' ? 'yellow' : 'volcano';

        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
  ];

  const occurenceCounter = function (array, finderFn) {
    return array?.reduce(function (counter, item) {
      var p = finderFn(item);
      counter[p] = counter.hasOwnProperty(p) ? counter[p] + 1 : 1;
      return counter;
    }, {});
  };

  const count = occurenceCounter(
    responses?.reduce(
      (acc, curr) =>
        // Retrieve latest response
        curr?.response?.length > 0 ? acc.concat(curr?.response[curr?.response?.length - 1]) : acc,
      [],
    ),
    function (item) {
      return item?.status;
      // if (group === 'province') return item?.provinceId?.name;
      // else if (group === 'gender') return item?.gender;
      // else if (group === 'municipality') return item?.address?.name;
      // else if (group === 'region') return item?.regionId?.name;
    },
  );
  const data = Object.keys(count).map((key) => ({
    type: key,
    value: count[key],
  }));

  const pieGraphConfig = {
    appendPadding: 10,
    data: data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  return (
    <>
      {/* RESPOND MODAL */}
      <Modal
        visible={isResponding?.isTrue}
        title={`Respond to ${responseDetails.data?.userId?.firstName} ${responseDetails.data?.userId?.lastName}`}
        okText="Proceed"
        onOk={respondUser}
        onCancel={() => setisResponding({ isTrue: false, message: '' })}
      >
        {isResponding?.RESOLVED ? (
          <Alert
            message="This action will notify the user that everything was resolved"
            type="success"
          />
        ) : (
          <Alert message="This action will notify the user that rescue is coming" type="info" />
        )}

        <Input
          style={{ marginTop: '1rem' }}
          placeholder="Optional message"
          onChange={(e) => setisResponding({ ...isResponding, message: e.target.value })}
        />

        <Switch
          style={{ marginTop: '1rem' }}
          checkedChildren="Resolved"
          unCheckedChildren="Unresolved"
          checked={isResponding?.RESOLVED || false}
          onChange={(checked) => setisResponding({ ...isResponding, RESOLVED: checked })}
        />
      </Modal>

      <div style={{ marginBottom: '1rem' }}>
        <span onClick={closeTable} style={{ cursor: 'pointer' }}>
          <LeftOutlined /> Back
        </span>
      </div>
      <Card>
        <Row gutter={[8, 8]}>
          {responses?.length < 1 ? (
            <Col span={24}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Col>
          ) : (
            <>
              <Col sm={24} md={14}>
                {data?.length > 0 ? (
                  <Pie {...pieGraphConfig} />
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Col>
              <Col sm={24} md={10}>
                <Table dataSource={responses} columns={columns} />
              </Col>
            </>
          )}
        </Row>
      </Card>

      {/*  SIDE DRAWER */}
      <Drawer
        title="User profile"
        width={640}
        placement="right"
        closable={false}
        onClose={() => {
          setResponseDetails({ show: false, data: null });
          setDoneRead(true);
        }}
        visible={responseDetails.show}
        // extra={
        //   responseDetails?.data?.status === 'NEED HELP' && (
        //     <Button
        //       key={'respond'}
        //       type="primary"
        //       onClick={() => setisResponding({ isTrue: true, message: '' })}
        //     >
        //       Respond
        //     </Button>
        //   )
        // }
      >
        {/* PERSONAL INFO */}
        <strong>Personal Information</strong>
        <Row>
          <Col span={12}>
            <DescriptionItem
              title="Full Name"
              content={`${responseDetails.data?.userId?.firstName} ${responseDetails.data?.userId?.lastName}`}
            />
          </Col>
          <Col span={12}>
            <DescriptionItem
              title="Phone number"
              content={responseDetails.data?.userId?.phoneNumber}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DescriptionItem title="Message" content={responseDetails.data?.message} />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DescriptionItem title="Full address" content={responseDetails.data?.fullAddress} />
          </Col>
        </Row>
        <Divider />

        {/* MAP */}
        <strong>Location</strong>
        <Row>
          <Col span={24}>
            <Map
              lat={responseDetails.data?.coordinates?.latitude}
              lng={responseDetails.data?.coordinates?.longitude}
            />
          </Col>
        </Row>
        <Divider />

        <strong>Photos</strong>
        <Row>
          <Col span={24}>
            <Image.PreviewGroup>
              {responseDetails.data?.photos?.length > 0 ? (
                responseDetails.data?.photos?.map((v) => (
                  <Image key={v?.original} src={v?.original} />
                ))
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Image.PreviewGroup>
          </Col>
        </Row>
        <Divider />

        {/* RESPONSE HISTORY */}
        <strong>Response History</strong>
        <Row>
          <Col span={24}>
            <List
              style={{ height: '300px', overflowY: 'auto' }}
              itemLayout="horizontal"
              dataSource={responses?.reduce((acc, curr) => acc.concat(curr?.response), [])}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <>
                        <Tag
                          color={
                            item?.status == 'RESOLVED'
                              ? 'green'
                              : item?.status == 'RESCUE_INCOMING'
                              ? 'yellow'
                              : 'blue'
                          }
                        >
                          {item?.status}
                        </Tag>
                        <Typography.Text>
                          {moment(new Date(item?.dateTime))?.format('MMM DD, YYYY | hh:mm a')}
                        </Typography.Text>
                      </>
                    }
                    description={
                      <>
                        {/* Updated by: {item?.updatorId} <br /> */}
                        Message: {item?.message || ''}
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Drawer>
    </>
  );
};
