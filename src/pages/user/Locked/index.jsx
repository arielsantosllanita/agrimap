import React, { useRef, useState, useEffect } from 'react';
import { Card, Button, Alert, Spin, message, Typography } from 'antd';
import PinInput from 'react-pin-input';
import { verify_pin, request_pin, get_pin_timer } from '@/services/user';
import { history } from 'umi';
import store from 'store';
import moment from 'moment';

export default () => {
  const ref = useRef();
  const [flag, setFlag] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorText, setTextError] = useState('');
  const [timer, setTimer] = useState(0);

  const handlePinVerify = async (e) => {
    setVerifying(true);
    let res = await verify_pin({ pin: e, email: store.get('locked-email') });

    if (res.success) {
      message.success(res.message);
      store.set('locked-email', null);
      history.push('/admin/login');
    } else {
      setFlag(true);
      setTextError(res.message);
    }
    setVerifying(false);
  };

  const handleRequestPin = async () => {
    let res = await request_pin({ email: store.get('locked-email') });
    if (res.success) setTimer(60 - moment().diff(res.data, 'seconds'));
    else message.error(res.message);
  };

  // request of there is ongoing time for new pin request
  useEffect(async () => {
    let res = await get_pin_timer({ email: store.get('locked-email') });
    if (res.success) setTimer(60 - moment().diff(res.data, 'seconds'));
    else message.error(err.message);

    const int = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(int);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <img
            alt="logo"
            src="/logo-color.png"
            style={{
              height: 60,
              marginBottom: 50,
            }}
          />
        </div>

        <Card style={{ background: '#fdfdfd' }}>
          {flag && (
            <Alert
              message={errorText}
              type="error"
              style={{ padding: 10 }}
              onClose={() => setFlag(false)}
              closable
            />
          )}
          Please enter the code for <strong>{store.get('locked-email')}</strong>
          <Spin spinning={verifying} tip="We're confirming your pin...">
            <PinInput
              length={6}
              ref={ref}
              type="numeric"
              style={{ fontSize: 24, fontWeight: 900, padding: '10px' }}
              inputFocusStyle={{ borderColor: 'blue' }}
              onComplete={handlePinVerify}
              disabled={verifying}
              focus
            />
          </Spin>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography.Text style={{ fontSize: '1em', paddingTop: 5 }}>
              Didn't receive the code ?{' '}
              <Typography.Link onClick={handleRequestPin} disabled={timer > 0}>
                click here
              </Typography.Link>{' '}
              {timer > 0 ? timer : ''}
            </Typography.Text>
            <Button onClick={() => ref.current?.clear()} disabled={verifying}>
              RESET
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
