import React, { useCallback, useState } from 'react';
import {
  LogoutOutlined,
  UserSwitchOutlined,
  BugFilled,
  SnippetsOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Menu, Spin, Tag, Tooltip, Typography } from 'antd';
import { history, useLocation, useModel } from 'umi';
import { stringify } from 'querystring';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import store from 'store';
import { useEffect } from 'react';
import { fetchFeedbacks } from '@/services/provinces';
import { admin as AdminRoutes, lguAdmin, lguProvince, merchant } from '../../../config/adminRoutes';
import { jwt_decode } from '@/services/user';

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  // await outLogin();
  const { query = {}, search } = history.location;
  const { redirect } = query; // Note: There may be security issues, please note
  const { pathname } = window.location;
  const pathLocate = (v) => new RegExp(v.path).test(pathname);
  const isAdmin = [...AdminRoutes, { path: '/admin/feedbacks' }].some(pathLocate);

  let mode = null;
  if (isAdmin) mode = 'admin';
  if (lguProvince.some(pathLocate)) mode = 'lgu-province';
  if (lguAdmin.some(pathLocate)) mode = 'lgu-admin';
  if (merchant.some(pathLocate)) mode = 'merchant';

  if (!['/user/login', '/admin/login/'].includes(pathname) && !redirect) {
    history.replace({
      pathname: isAdmin ? '/admin/login/' : '/user/login',
      // search: stringify({
      //   redirect: pathname + search,
      // }),
    });

    // Remove user data from localstorage when loging out
    if (['lgu-admin', 'lgu-province'].includes(mode)) {
      store.remove(`user-${mode}`);
      store.remove(`token-lgu-admin`);
      store.remove(`token-lgu-province`);
    } else {
      store.remove(`user-${mode}`);
      store.remove(`token-${mode}`);
    }
  }
};

const AvatarDropdown = ({ menu }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [modalOpen, setModalOpen] = useState(false);
  const [onHover, setOnHover] = useState(false);
  const location = useLocation();
  const [unreadStatus, setUnreadStatus] = useState(0);
  const { pathname } = window.location;
  const pathLocate = (v) => new RegExp(v.path).test(pathname);
  const isAdmin = [...AdminRoutes, { path: '/admin/feedbacks' }].some(pathLocate);

  let { currentUser: user } = initialState;
  const isUserBothMunicipalAndProvincialLgu =
    user?.cityId && user?.provinceId && ['lgu-admin', 'lgu-province'].includes(user.mode);
  const onMenuClick = useCallback(
    async (event) => {
      const { key } = event;

      switch (key) {
        case 'switchLgu': {
          const userTemp = { ...user };
          userTemp.mode =
            location.pathname.split('/')[1] === 'lgu-province' ? 'lgu-admin' : 'lgu-province';

          if (!store.get(`token-${userTemp.mode}`)) {
            const userData = await jwt_decode({
              token: store.get(`token-${user.mode}`),
              mode: userTemp.mode,
            });
            store.set(`token-${userTemp.mode}`, userData?.token);
            await setInitialState((prev) => ({ ...prev, currentUser: userData?.data }));
          } else {
            await setInitialState((prev) => ({ ...prev, currentUser: userTemp }));
          }

          history.push(
            location.pathname.split('/')[1] === 'lgu-province'
              ? '/lgu-dashboard'
              : '/lgu-province/dashboard',
          );
          break;
        }
        case 'logout': {
          setInitialState((s) => ({ ...s, currentUser: undefined }));
          loginOut();
          break;
        }
        case 'view-report': {
          history.push('/admin/feedbacks');
          break;
        }
        default: {
          history.push(`/account/${key}`);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setInitialState, location.pathname],
  );

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  const { currentUser } = initialState;

  useEffect(() => {
    (async () => {
      if (currentUser?.roles?.includes('super-admin') && isAdmin) {
        const res = await fetchFeedbacks(
          { unreadStatus: JSON.stringify({ isUnread: true }) },
          true,
        );
        setUnreadStatus(res?.feedbacks?.length || 0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialState?.refresh]);

  if (!initialState) {
    return loading;
  }

  if (!currentUser || !currentUser.firstName) {
    return loading;
  }

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      {isUserBothMunicipalAndProvincialLgu && (
        <Menu.Item key="switchLgu">
          <UserSwitchOutlined />
          Switch to{' '}
          {location.pathname.split('/')[1] === 'lgu-province'
            ? 'Municipal/City LGU'
            : 'Provincial LGU'}
        </Menu.Item>
      )}
      {isAdmin && currentUser?.roles?.includes('super-admin') && (
        <Menu.Item key="view-report">
          <Badge count={unreadStatus} style={{ marginRight: '-1rem' }}>
            <SnippetsOutlined />
            View Feedback Report
          </Badge>
        </Menu.Item>
      )}
      <Menu.Item key="logout">
        <LogoutOutlined />
        Log out
      </Menu.Item>
    </Menu>
  );

  // return null;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          // width: '90vw',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          {user.mode === 'admin' ? (
            <Tag
              color="#001529"
              style={{ height: 24, alignSelf: 'center', border: '1px solid #40a9ff' }}
            >
              {header(user)}
            </Tag>
          ) : (
            header(user)
          )}
          <HeaderDropdown overlay={menuHeaderDropdown}>
            <span className={`${styles.action} ${styles.account}`}>
              <Avatar
                size="small"
                className={styles.avatar}
                src={currentUser.photo?.small}
                alt="avatar"
              />
              <span className={`${styles.name} anticon`} style={{ marginLeft: '0.3em' }}>
                {currentUser.firstName} {currentUser.lastName}
              </span>
            </span>
          </HeaderDropdown>
        </div>
      </div>
    </div>
  );
};

const header = (user) => {
  let text = '';
  if (user.mode == 'admin') {
    text = user.roles.includes('super-admin')
      ? 'Superadmin'
      : user.roles.includes('admin')
      ? 'Admin'
      : '';
  }
  return <strong style={{ color: '#40a9ff' }}>{text}</strong>;
};

export default AvatarDropdown;
