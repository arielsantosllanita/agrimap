import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Button,
  Input,
  List,
  Image,
  Card,
  message,
  Typography,
  Space,
  Tag,
  DatePicker,
  Tooltip,
  Modal,
  Checkbox,
  Empty,
} from 'antd';
import {
  getLGUAdmins,
  addLGUAdmin,
  removeLGUAdmin,
  updateVerification,
} from '@/services/provinces';
import { DeleteFilled } from '@ant-design/icons';
import ModalForm2 from './modal';
import moment from 'moment';
import store from 'store';
import { isEmpty } from 'lodash';
import { useModel } from 'umi';

const { Search } = Input;

export default ({ drawer, setDrawer, place, actionRef }) => {
  const [modalOpen, setMOdalOpen] = useState(false);
  const [BPdateModal, setBPDateModal] = useState(false);
  const [SECdateModal, setSECDateModal] = useState(false);
  const [mode, setMode] = useState('');
  const [BPdatePick, setBPDatePick] = useState('');
  const [SECdatePick, setSECDatePick] = useState('');
  const [isDOTAccredited, setIsDOTAccredited] = useState(false);
  // let user = store.get('user-admin');
  const { initialState } = useModel('@@initialState');
  let { currentUser: user } = initialState;

  // console.log('CURRENT_PLACE', place);

  const request = async (mode, bool) => {
    let res = await updateVerification(
      {
        placeId: place?._id,
        isVerified: bool ? bool : place?.isVerified,
        status: mode,
        verifierId: user._id,
        verifierName: user.firstName + ' ' + user.lastName,
        verifierPhoto: user.photo.original,
        establishmentName: place?.name,
        SECDTICertificateExpiryDate: SECdatePick,
        businessPermitExpiryDate: BPdatePick,
        isDOTAccredited: isDOTAccredited,
        business: place?.businessInformation,
        date: moment(),
      },
      true,
    );
    if (res.success == true) {
      if (mode == 'update') {
        message.success('Successfully set the expiry date');
      } else message.success('Establishment verified');

      if (
        place.businessInformation.businessPermitExpiryDate &&
        place.businessInformation.SECDTICertificateExpiryDate
      )
        setDrawer(false);
      setBPDateModal(false);
      setSECDateModal(false);
      actionRef?.current?.reload();
    } else message.error('There is an error with the server.');
  };

  function disabledDate(current) {
    // Can not select days before today and today
    return current && current < moment().endOf('day');
  }

  const onChange = (date, dateString) => {
    setBPDatePick(dateString);
    // request('update');
  };

  const onChange2 = (date, dateString) => {
    setSECDatePick(dateString);
    // request('update');
  };

  return (
    <>
      <ModalForm2
        visible={modalOpen}
        setVisible={setMOdalOpen}
        place={place}
        actionRef={actionRef}
        setDrawer={setDrawer}
        mode={mode}
      />

      {/* BUSINESS PERMIT MODAL */}
      <Modal
        width={300}
        visible={BPdateModal}
        okText={'Submit'}
        onCancel={() => {
          setBPDatePick('');
          setBPDateModal(false);
        }}
        onOk={() => {
          if (place?.businessInformation?.businessPermitExpiryDate) {
            request('update');
          }
          setBPDateModal(false);
        }}
        destroyOnClose
      >
        {' '}
        <Typography.Title level={4}>Business Permit</Typography.Title>
        <Space>
          <Typography.Text>Valid until: </Typography.Text>
          <DatePicker onChange={onChange} disabledDate={disabledDate} />
        </Space>
      </Modal>

      {/* SEC/DTI MODAL */}
      <Modal
        width={300}
        visible={SECdateModal}
        okText={'Submit'}
        onCancel={() => {
          setSECDatePick('');
          setSECDateModal(false);
        }}
        onOk={() => {
          if (place?.businessInformation?.SECDTICertificateExpiryDate) {
            request('update');
          }
          setSECDateModal(false);
        }}
        destroyOnClose
      >
        {' '}
        <Typography.Title level={4}>SEC/DTI Certificate</Typography.Title>
        <Space>
          <Typography.Text>Valid until: </Typography.Text>
          <DatePicker onChange={onChange2} disabledDate={disabledDate} />
        </Space>
      </Modal>

      <Drawer
        onClose={() => setDrawer(false)}
        placement="right"
        title={''}
        visible={drawer}
        footer={false}
        closable={false}
        width={420}
      >
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          {place.isVerified ? (
            <Button
              type={'danger'}
              onClick={() => {
                setMode('Terminated');
                setMOdalOpen(true);
              }}
            >
              Terminate
            </Button>
          ) : (
            <div>
              <Button
                type={'primary'}
                style={{ marginRight: 10 }}
                onClick={() => {
                  const { businessPermitExpiryDate, SECDTICertificateExpiryDate } =
                    place.businessInformation;

                  if (
                    (businessPermitExpiryDate && SECDTICertificateExpiryDate) ||
                    (SECdatePick && BPdatePick)
                  ) {
                    request('Verified', true);
                    setDrawer(false);
                  } else if (['607564a97d84680d7f2b3a92'].includes(place?.primaryCategory?._id)) {
                    //FOR COMMUNITY GUIDE
                    request('Verified', true);
                    setDrawer(false);
                  } else {
                    message.warning('Set the expiry date for Business Permit or SEC/DTI first.');
                  }
                }}
              >
                VERIFY
              </Button>
              <Button
                type={'danger'}
                onClick={() => {
                  setMode('Declined');
                  setMOdalOpen(true);
                }}
              >
                DECLINE
              </Button>{' '}
              <br />
              <Checkbox
                style={{ marginTop: '10px' }}
                onChange={(e) => setIsDOTAccredited(e.target.checked)}
              >
                Is DOT Accredited?
              </Checkbox>
            </div>
          )}
        </div>

        <h1>{place.name}</h1>
        <h3>
          {place.street} {place.barangay}, {place.cityId?.name} {place.provinceId?.name}
          <br />
          {place?.regionId?.name}
        </h3>

        <div style={{ marginTop: 30 }}>
          <strong>Merchant Email</strong>
          <p>{place?.merchantID?.email || ''}</p>
        </div>

        {/* DOT ACCREDITATION */}
        <div style={{ marginTop: 30 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <strong>DOT Accreditation</strong>

            {isEmpty(place?.businessInformation?.DOTAccreditation?.large) ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Image
                src={place?.businessInformation?.DOTAccreditation?.large}
                height={150}
                width={'100%'}
                style={{ objectFit: 'cover' }}
              />
            )}
          </Space>
        </div>

        {/* BUSINESS PERMIT */}
        {place?.businessInformation?.businessPermit?.large && (
          <div style={{ marginTop: 30 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space size={32}>
                <strong>Business Permit</strong>
                <Typography.Text type="secondary" italic>
                  Valid until:{' '}
                  {BPdatePick || place?.businessInformation?.businessPermitExpiryDate ? (
                    <Typography.Text
                      onClick={() => {
                        setBPDateModal(true);
                      }}
                    >
                      {moment(
                        BPdatePick || place?.businessInformation?.businessPermitExpiryDate,
                      ).format('MMM DD, YYYY')}
                    </Typography.Text>
                  ) : (
                    <Tooltip placement="topLeft" title="Click to set date">
                      <Typography.Text
                        onClick={() => {
                          setBPDateModal(true);
                        }}
                      >
                        Date not set{' '}
                      </Typography.Text>
                    </Tooltip>
                  )}
                </Typography.Text>{' '}
              </Space>
              {/* add script if expiration date is set, display date; else set date */}

              {isEmpty(place?.businessInformation?.businessPermit?.large) ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Image
                  src={place?.businessInformation?.businessPermit?.large}
                  height={150}
                  width={'100%'}
                  style={{ objectFit: 'cover' }}
                />
              )}
            </Space>
          </div>
        )}

        {/* SEC/DTI CERTIFICATE */}
        {place?.businessInformation?.SECDTICertificate?.large && (
          <div style={{ marginTop: 30 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space size={24}>
                <strong>SEC/DTI Certificate</strong>
                <Typography.Text type="secondary" italic>
                  Valid until:{' '}
                  {SECdatePick || place?.businessInformation?.SECDTICertificateExpiryDate ? (
                    <Typography.Text
                      onClick={() => {
                        setSECDateModal(true);
                      }}
                    >
                      {moment(
                        SECdatePick || place?.businessInformation?.SECDTICertificateExpiryDate,
                      ).format('MMM DD, YYYY')}
                    </Typography.Text>
                  ) : (
                    <Tooltip placement="topLeft" title="Click to set date">
                      <Typography.Text
                        onClick={() => {
                          setSECDateModal(true);
                        }}
                      >
                        Date not set{' '}
                      </Typography.Text>
                    </Tooltip>
                  )}
                </Typography.Text>{' '}
              </Space>

              {isEmpty(place?.businessInformation?.SECDTICertificate?.large) ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Image
                  src={place?.businessInformation?.SECDTICertificate?.large}
                  height={150}
                  width={'100%'}
                  style={{ objectFit: 'cover' }}
                />
              )}
            </Space>
          </div>
        )}

        <h4 style={{ marginTop: 30 }}>
          <strong>
            {['607564a97d84680d7f2b3a92'].includes(place?.primaryCategory?._id)
              ? 'More information'
              : 'Staff Information'}
          </strong>
        </h4>
        <h4>{place?.businessInformation?.contactPerson || 'None'}</h4>
        <h4>{place?.businessInformation?.contactNumber || 'None'}</h4>
        <Image
          src={place?.businessInformation?.staffId?.large}
          height={150}
          width={'100%'}
          style={{ objectFit: 'cover' }}
        />

        {['607564a97d84680d7f2b3a92'].includes(place?.primaryCategory?._id) && (
          <h4 style={{ marginTop: 30 }}>
            <strong>Special Training</strong>
            <h4>{place?.businessInformation?.specialTraining || 'None'}</h4>
          </h4>
        )}

        <List
          style={{ marginTop: 30, height: '300px', overflowY: 'auto' }}
          header={<strong>Verification History</strong>}
          itemLayout="horizontal"
          dataSource={place?.verificationHistory || []}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <>
                    <Tag color={item?.status == 'Verified' ? 'green' : 'red'}>{item?.status}</Tag>
                    <Typography.Text>
                      {moment(item?.date?.replace(/['"]+/g, ''))?.format('MMM DD, YYYY | hh:mm a')}
                    </Typography.Text>
                  </>
                }
                description={
                  <>
                    {item?.status} by: {item?.verifierName} <br />
                    {item?.status == 'Verified' ? '' : <>Reason: {item?.declinationReason}</>}
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
};
