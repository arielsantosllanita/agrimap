import { useState } from 'react';
import { Modal, Input, Typography, message } from 'antd';
import { updateVerification } from '@/services/provinces';
import moment from 'moment';
import { useModel } from 'umi';
// import store from 'store';

export default ({ visible, setVisible, place, setDrawer, actionRef, mode }) => {
  let [declinationReason, setDeclinationReason] = useState('');
  // let user = store.get('user-admin');
  const { initialState } = useModel('@@initialState');
  let { currentUser: user } = initialState;

  const request = async () => {
    let res = await updateVerification(
      {
        placeId: place?._id,
        isVerified: false,
        status: mode,
        verifierId: user._id,
        verifierName: user.firstName + ' ' + user.lastName,
        verifierPhoto: user.photo.small,
        declinationReason: declinationReason,
        merchantID: place?.merchantID,
        establishmentName: place?.name,
        date: moment(),
      },
      true,
    );
    if (res.success == true) {
      message.success('done ' + mode);
      actionRef?.current?.reload();
      setDrawer(false);
      setVisible(false);
    } else {
      // console.log('ERROR', res);
      message.error('There is an error with the server.');
    }
  };

  function handleChange(e) {
    setDeclinationReason(e.target.value);
  }

  function handleOk() {
    if (declinationReason == '') {
      message.error('Reason is Empty');
    } else {
      request();
    }
  }

  return (
    <Modal
      visible={visible}
      onCancel={() => setVisible(false)}
      closable={false}
      onOk={handleOk}
      okText={'Submit'}
      destroyOnClose
    >
      <Typography.Title level={4}>
        Reason to {mode == 'Declined' ? 'decline' : 'terminate'}:
      </Typography.Title>
      <Input.TextArea autoSize={{ minRows: 5, maxRows: 10 }} onChange={handleChange} />
    </Modal>
  );
};
