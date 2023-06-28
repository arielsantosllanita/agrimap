import { SettingDrawer } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { history, request as requestApi, Link } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import defaultSettings from '../config/defaultSettings';
const isDev = process.env.NODE_ENV === 'development';
import store from 'store';
import { admin, lguAdmin, lguProvince, merchant, update } from '../config/adminRoutes';
import 'cropperjs/dist/cropper.css'; //for img cropper
import { isEmpty, isNil } from 'lodash';
import { jwt_decode } from './services/user';
import { getCalamityPostUnread } from '@/services/calamity';
import io from 'socket.io-client';
import { ConfigProvider } from 'antd';
import EN_US from 'antd/es/locale/en_US';
import { IS_UNDER_MAINTENANCE } from '../config/constants';

let socket = io(API_URL);

const nonAdminLoginPath = '/user/login';
const adminLoginPath = '/admin/login/';
const lockedprofilePath = '/locked-profile';

export const initialStateConfig = {
  loading: <PageLoading />,
};

export async function getInitialState() {
  const fetchUserInfo = async () => {
    // For every page refresh we will get user data on api
    // User data in local storage became outdated when user manipulates user role in admin

    const { pathname } = history.location;
    const pathLocate = (v) => new RegExp(v.path).test(pathname);
    const isSuperAdmin = !isEmpty(store.get('token-admin'));
    const isVisitingNonAdminRoutes = [...lguAdmin, ...lguProvince, ...merchant].some(pathLocate);
    const isVisitingAdminRoutes = [...admin, { path: '/admin/feedbacks' }];

    try {
      // let mode = null;
      // if (isVisitingAdminRoutes.some(pathLocate)) {
      //   if (!_.isEmpty(store.get('token-admin'))) {
      //     mode = 'admin';
      //   }
      // } else if (lguProvince.some(pathLocate)) {
      //   if (!_.isEmpty(store.get('token-lgu-province'))) {
      //     mode = 'lgu-province';
      //   }
      // } else if (lguAdmin.some(pathLocate)) {
      //   if (!_.isEmpty(store.get('token-lgu-admin'))) {
      //     mode = 'lgu-admin';
      //   }
      // } else if (merchant.some(pathLocate)) {
      //   if (!_.isEmpty(store.get('token-merchant'))) {
      //     mode = 'merchant';
      //   }
      // }

      // if (_.isNil(mode) && isSuperAdmin && isVisitingNonAdminRoutes) {
      //   let mode = lguAdmin.some(pathLocate)
      //     ? 'lgu-admin'
      //     : lguProvince.some(pathLocate)
      //     ? 'lgu-province'
      //     : 'merchant';

      //   const token = store.get(`token-admin`);
      //   const userData = await jwt_decode({ token, mode });
      //   return userData?.data;
      // }

      const token = store.get(`token-admin`);
      const userData = await jwt_decode({ token });
      // console.log('INIT', userData);
      return userData?.success ? userData?.data : undefined;
    } catch (error) {
      console.log('INIT_ERR', error);
      if (IS_UNDER_MAINTENANCE) history.push('/maintenance');
      else history.push(isVisitingAdminRoutes ? adminLoginPath : nonAdminLoginPath);
    }

    return undefined;
  };

  if (![nonAdminLoginPath, adminLoginPath, lockedprofilePath].includes(history.location.pathname)) {
    let currentUser = await fetchUserInfo();

    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }

  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

export const layout = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => (IS_UNDER_MAINTENANCE ? null : <RightContent />),
    disableContentMargin: false,
    footerRender: () => <Footer />,
    onPageChange: (e) => {
      // if (IS_UNDER_MAINTENANCE) {
      //   history.push('/maintenance');
      //   return;
      // }

      // if (e.pathname == adminLoginPath) {
      //   history.push(adminLoginPath);
      //   return;
      // } else if (e.pathname == lockedprofilePath) {
      //   if (store.get('locked-email') != null) history.push(lockedprofilePath);
      //   else history.push(adminLoginPath);
      //   return;
      // } else if (e.pathname.search('/admin/verified') == 0) {
      //   history.push(e.pathname + e.search);
      //   return;
      // } else if (e.pathname.search('/lgu-admin/calamity-posts') == 0) {
      //   setInitialState((preInitialState) => ({
      //     ...preInitialState,
      //   }));
      // }

      const { location } = history;
      if (!initialState?.currentUser && location.pathname !== nonAdminLoginPath) {
        history.push(nonAdminLoginPath);
      }
    },
    menu: {
      // Re-execute request whenever initialState?.currentUser?.userid is modified
      params: initialState,
      request: async (params, defaultMenuData) => {
        if (IS_UNDER_MAINTENANCE) {
          return null;
        }

        // Rely on global state to get user info
        // let { mode, roles, cityId } = params?.currentUser;
        // const { pathname } = history.location;
        // update(cityId);

        // socket.on('refresh-data-mark-safe', async (data) => {
        //   let res = await getCalamityPostUnread({ cityId });
        //   if (res.success)
        //     setInitialState((preInitialState) => ({
        //       ...preInitialState,
        //       responseCount: res.data.count,
        //     }));
        // });

        // if (pathname.match('lgu-featured-places') && !isNil(history.location.query?.cityName)) {
        //   return lguAdmin.filter((v) => v.name === 'Featured Places');
        // }

        // if (pathname.match('lgu-news') && !isNil(history.location.query?.provinceName)) {
        //   return lguAdmin.filter((v) => v.name === 'News');
        // }

        // if (mode == 'admin') {
        //   if (!roles.includes('super-admin')) {
        //     return admin.filter(
        //       (el) => el.name == 'Manage Provinces' || el.name == 'Admin News/Articles',
        //     );
        //   } else return admin;
        // }

        // return mode === 'lgu-admin' ? lguAdmin : mode === 'merchant' ? merchant : lguProvince;
        return admin;
      },
    },
    menuHeaderRender: undefined,
    childrenRender: (children, props) => {
      return (
        <>
          <ConfigProvider locale={EN_US}>
            {children}
            {!props.location?.pathname?.includes('/login') &&
              !props.location?.pathname?.includes('/admin/verified') &&
              !props.location?.pathname?.includes('/locked-profile') &&
              (IS_UNDER_MAINTENANCE ? null : (
                <SettingDrawer
                  disableUrlParams
                  enableDarkTheme
                  settings={initialState?.settings}
                  onSettingChange={(settings) => {
                    setInitialState((preInitialState) => ({ ...preInitialState, settings }));
                  }}
                />
              ))}
          </ConfigProvider>
        </>
      );
    },
    ...initialState?.settings,
    ...(IS_UNDER_MAINTENANCE ? { layout: 'top' } : {}),
  };
};

export const request = {
  requestInterceptors: [
    (url, options) => {
      // Add token bearer automatically for every request

      // const { pathname } = history.location;
      // const pathLocate = (v) => new RegExp(v.path).test(pathname);
      // const isSuperAdmin = !isEmpty(store.get('token-admin'));
      // const isVisitingNonAdminRoutes = [...lguAdmin, ...lguProvince, ...merchant].some(pathLocate);
      // const adminRoutes = [...admin, { path: '/admin/feedbacks' }];

      // let mode = null;
      // if (adminRoutes.some(pathLocate)) {
      //   if (!_.isEmpty(store.get('token-admin'))) {
      //     mode = 'admin';
      //   }
      // } else if (lguProvince.some(pathLocate)) {
      //   if (!_.isEmpty(store.get('token-lgu-province'))) {
      //     mode = 'lgu-province';
      //   }
      // } else if (lguAdmin.some(pathLocate)) {
      //   if (!_.isEmpty(store.get('token-lgu-admin'))) {
      //     mode = 'lgu-admin';
      //   }
      // } else if (merchant.some(pathLocate)) {
      //   if (!_.isEmpty(store.get('token-merchant'))) {
      //     mode = 'merchant';
      //   }
      // }

      // if (_.isNil(mode) && isSuperAdmin && isVisitingNonAdminRoutes) {
      //   mode = 'admin';
      // }

      const token = store.get(`token-admin`);
      const authHeader = { Authorization: `Bearer ${token}` };

      if (isNil(token)) return { url, options };
      if (url.match('jwt-decode')) {
        const { token: jwtToken } = options?.params;
        if (!isNil(jwtToken)) {
          authHeader.Authorization = `Bearer ${jwtToken}`;
          delete options.params.token;
        }
      }

      return {
        url,
        options: {
          ...options,
          interceptors: true,
          headers: { ...options?.headers, ...authHeader },
        },
      };
    },
  ],
};
