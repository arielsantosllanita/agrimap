import React, { useEffect, useState } from 'react';
import { Typography, Result, Button, Spin } from 'antd';
import { useLocation } from 'umi';
import { device_confirm } from '@/services/user';
import { InfoCircleOutlined } from '@ant-design/icons';
import dotenv from 'dotenv';
dotenv.config();

const SimpleCrypto = require('simple-crypto-js').default;
const CRYPTO_PRIVATE_KEY /* Now in a public */ =
  '37LvDSasdfasfsaf3a3IEIA;3r3oi3joijpjfa3a3m4XvjYOh9Yaa.p3id#IEYDNeaken';

let decrypt = (text) => {
  const simple = new SimpleCrypto(CRYPTO_PRIVATE_KEY);

  try {
    let data = simple.decrypt(text);
    return { success: true, data };
  } catch (e) {
    return { success: false };
  }
};

export default () => {
  const [isDone, setIsDone] = useState(false);
  const [status, setStatus] = useState(null);
  const [statusText, setStatusText] = useState('');
  const { userdata } = useLocation().query;

  useEffect(async () => {
    if (userdata) {
      const res = decrypt(userdata.replace(' ', '+'));
      if (res.success) {
        let res2 = await device_confirm({ id: res.data.id, key: res.data.key });
        if (res2) {
          setStatusText(res2.message);
          setIsDone(true);
          setStatus(res2.success);
        }
      } else {
        setStatusText('Invalid url');
        setIsDone(true);
        setStatus(false);
      }
    } else {
      setStatusText('Invalid url');
      setIsDone(true);
      setStatus(false);
    }
  }, []);

  return (
    <Spin
      tip="Loading..."
      spinning={status == null}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      {isDone && (
        <Result
          status={status == false ? 'error' : 'success'}
          title={statusText}
          subTitle={
            status == true ? (
              <Typography.Text type="secondary">
                <InfoCircleOutlined /> You can now close this page and click{' '}
                <a href="https://visitouradmin.com/admin/login/">here</a> or click the button below
              </Typography.Text>
            ) : (
              <a href="https://visitouradmin.com/user/login/">
                click here to redirect you to the login
              </a>
            )
          }
          extra={[
            status == true ? (
              <Button
                type="primary"
                onClick={() => {
                  window.location = 'https://visitouradmin.com/admin/login/';
                }}
              >
                Log in
              </Button>
            ) : (
              ''
            ),
          ]}
        />
      )}
    </Spin>
  );
};
