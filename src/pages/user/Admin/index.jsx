import { AppleFilled, UserOutlined } from '@ant-design/icons';
import { message, Space, Button, Form, Input, Tooltip, Grid } from 'antd';
import React, { useEffect } from 'react';
import { history, useModel } from 'umi';
import { GoogleLogin, useGoogleLogout } from 'react-google-login';
import { admin_login, google_signin, lock_account } from '@/services/user';
import Icon, { KeyOutlined, FacebookFilled } from '@ant-design/icons';
import { v4 } from 'uuid';
import styles from './index.less';
import store from 'store';

const { useBreakpoint } = Grid;

const Login = () => {
  const { setInitialState } = useModel('@@initialState');

  const fetchUserInfo = async (user, token) => {
    const userInfo = user;
    store.set('token-admin', token);
    if (userInfo) {
      await setInitialState((s) => ({ ...s, currentUser: userInfo }));
    }
  };

  const handleSubmit = async (values) => {
    try {
      const res = await admin_login(values);

      if (res.success) {
        message.success('Welcome :D');
        await fetchUserInfo(res.user, res.token);
        if (!history) return;

        history.push(
          res.user?.roles.includes('super-admin') ? '/admin/dashboard' : '/manage-provinces',
        );
        return;
      } else {
        if (res.code == 4002) {
          if (res.counter >= 5) {
            const response = await lock_account({ email: values.email });
            if (response.success) {
              message.warning(
                'Account has been locked. We email your 6-digit pin to unlock your account.',
              );
              store.set('locked-email', values.email);
              history.push('/locked-profile');
            }
          } else message.error(res.message);
        } else if (res.code == 4004) {
          store.set('locked-email', values.email);
          history.push('/locked-profile');
        } else if (res.code == 4005) {
          message.warning(res.message);
        } else message.error(res.message);
      }
    } catch (error) {
      message.error('Log in failed.');
    }
  };

  const googleSignin = {
    // firebase
    // clientId: '394477532735-hucb7dt5rmac4bk2j7tfu5juc5nd328b.apps.googleusercontent.com',
    clientId: '51923764354-gbvqopedmkbrq30m638tmubt3th31vj8.apps.googleusercontent.com',
    onSuccess: (data) => {
      google_signin({ userData: JSON.stringify(data), mode: 'admin' })
        .then(async (res) => {
          // console.log('USER', res);
          if (!history) return;
          if (!res?.success) {
            message.error(res?.message || 'Internal error');
            return;
          }

          await fetchUserInfo(res.user, res.token);

          history.push(
            res.user?.roles.includes('super-admin') ? '/admin/dashboard' : '/manage-provinces',
          );
        })
        .catch((err) => message.error(err.message));
    },
    // onFailure: () => {
    // message.error('Problem occurred with OAuth');
    // console.log('GOOGLE_SIGNIN_FALED', error);
    // },
  };
  const googleSignOut = useGoogleLogout({
    clientId: googleSignin.clientId,
    // onFailure: () => console.log('LOGOUT_FAIL'),
    // onLogoutSuccess: () => console.log('LOGOUT_SUCCESS'),
  });

  const googleSvg = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="30"
      height="30"
      viewBox="0 0 48 48"
      style={{
        fill: '#000000',
      }}
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      ></path>
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      ></path>
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
    </svg>
  );

  const GoogleIcon = (props) => <Icon component={googleSvg} {...props} />;

  useEffect(() => {
    // pwede window.AppleId
    AppleID.auth.init({
      clientId: 'com.visitour',
      scope: 'name email',
      redirectURI: 'https://api.visitour.ph/account/apple/third-party-signin',
      state: v4(),
      nonce: v4(),
      usePopup: true,
    });

    if (!store.get('password-counter')) store.set('password-counter', 0);
  }, []);

  const screens = useBreakpoint();
  const formContainerStyles = { width: 400, margin: '200px 0 0 150px' };

  if (!screens.md) formContainerStyles.margin = '200px auto';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div style={formContainerStyles}>
          <Form
            initialValues={{
              remember: true,
            }}
            onFinish={async (values) => {
              await handleSubmit(values);
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <img
                alt="logo"
                src="/logo-color.png"
                style={{
                  width: 230,
                  height: 60,
                }}
              />
            </div>

            <div
              style={{
                background: '#fff',
                paddingRight: 30,
                paddingBottom: 10,
                paddingTop: 30,
                paddingLeft: 30,
                borderRadius: '1em',
                boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
              }}
            >
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: 'Email required',
                  },
                ]}
                style={{
                  marginTop: 10,
                }}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Email"
                  size="large"
                  className="loginInput"
                  style={{
                    borderRadius: '1em',
                  }}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Password required',
                  },
                ]}
                style={{
                  marginTop: 10,
                }}
              >
                <Input.Password
                  prefix={<KeyOutlined />}
                  placeholder="Password"
                  size="large"
                  className="loginInput"
                  style={{
                    borderRadius: '1em',
                  }}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                style={{ width: '100%', borderRadius: '1em' }}
                size="large"
              >
                <strong>Login as Admin</strong>
              </Button>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  marginTop: '1.5em',
                }}
              >
                <div style={{ flexGrow: 2 }}>
                  <hr />
                </div>
                <span style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                  {'or'.toUpperCase()}
                </span>
                <div style={{ flexGrow: 2 }}>
                  <hr />
                </div>
              </div>
            </div>
          </Form>
          <Space
            direction="horizontal"
            style={{ display: 'flex', justifyContent: 'center', marginTop: -20 }}
          >
            <Tooltip title="Not yet available">
              <Button
                icon={<FacebookFilled style={{ fontSize: '1.2em' }} />}
                shape="round"
                size="large"
                style={{ padding: 10 }}
                disabled
              />
            </Tooltip>
            <GoogleLogin
              render={(prop) => (
                <Button
                  icon={<GoogleIcon />}
                  onClick={prop.onClick}
                  disabled={prop.disabled}
                  shape="round"
                  size="large"
                  style={{ padding: 5, marginRight: 30, marginLeft: 30 }}
                />
              )}
              clientId={googleSignin.clientId}
              onSuccess={(data) => {
                googleSignin.onSuccess(data);
                googleSignOut.signOut();
              }}
              onFailure={googleSignin.onFailure}
              cookiePolicy="single_host_origin"
              isSignedIn={false}
              prompt="select_account"
            />
            <Button
              icon={<AppleFilled style={{ fontSize: '1.2em' }} />}
              shape="round"
              size="large"
              style={{ padding: 10 }}
              onClick={async () => {
                try {
                  const data = await AppleID.auth.signIn();
                } catch (error) {
                  //error
                }
              }}
            />
          </Space>
        </div>
      </div>
    </div>
  );
};

export default Login;
