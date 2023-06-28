import { IS_UNDER_MAINTENANCE } from './constants';

let routes = [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    name: 'Admin Login',
    path: '/admin/login',
    layout: false,
    component: './user/Admin',
  },
  {
    name: 'Locked Account',
    path: '/locked-profile',
    layout: false,
    component: './user/Locked',
  },
  {
    name: 'New Device Verified',
    path: '/admin/verified',
    layout: false,
    component: './user/Verified',
  },
  {
    path: '/admin/dashboard',
    component: './admin/dashboard',
    access: 'admin',
  },
  {
    path: '/verification-requests',
    component: './admin/verification-requests',
    access: 'admin',
  },
  {
    path: '/manage-provinces',
    component: './admin/manage-provinces',
    access: 'admin',
  },
  {
    path: '/manage-places',
    component: './admin/manage-places',
    access: 'admin',
  },
  {
    path: '/wallet-transactions',
    component: './admin/wallet-transactions',
    access: 'admin',
  },
  {
    path: '/lgu-news',
    component: './lgu-admin/news-page',
    // access: 'lgu-admin-news',
  },
  {
    path: '/lgu-news/:id',
    component: './lgu-admin/news-page',
    // access: 'lgu-admin-news',
  },
  {
    path: '/lgu-featured-places',
    component: './lgu-admin/featured-places',
    // access: 'lgu-admin-featured-place',
  },
  {
    path: '/lgu-featured-places/:id',
    component: './lgu-admin/featured-places',
    // access: 'lgu-admin-featured-place',
  },
  {
    path: '/subcategories-table',
    component: './admin/subcategories-table',
    access: 'admin',
  },
  {
    path: '/primary-categories',
    component: './admin/primary-categories',
    access: 'admin',
  },
  {
    path: '/offer-types',
    component: './admin/offer-types',
    access: 'admin',
  },
  {
    path: '/lgu-registered-establishment',
    component: './lgu-admin/registered-establishment',
    access: 'lgu-admin',
  },
  {
    path: '/lgu-dashboard',
    component: './lgu-admin/dashboard',
    access: 'lgu-admin',
  },
  {
    path: '/admin-tables',
    component: './admin/admin-tables',
    access: 'admin',
  },
  {
    path: '/admin-news-articles',
    component: './admin/news-articles',
    access: 'admin',
  },
  {
    path: '/merchant/dashboard',
    component: './merchant/dashboard',
    access: 'merchant',
  },
  {
    path: '/merchant/offers',
    component: './merchant/offers',
    access: 'merchant',
  },
  {
    path: '/merchant/guide',
    component: './merchant/guide',
    access: 'merchant',
  },
  {
    path: '/merchant/guide-offers',
    component: './merchant/guide-offers',
    access: 'merchant',
  },
  {
    path: '/lgu-province/dashboard',
    component: './lgu-province/dashboard',
    access: 'lgu-province',
  },
  {
    path: '/lgu-province/news',
    component: './lgu-province/news',
    access: 'lgu-province',
  },
  {
    path: '/lgu-province/registered-establishments',
    component: './lgu-province/registered-establishments',
    access: 'lgu-province',
  },
  {
    path: '/lgu-province/featured-places',
    component: './lgu-province/featured-places',
    access: 'lgu-province',
  },
  {
    path: '/admin/feedbacks',
    component: './admin/feedbacks',
    access: 'admin',
  },
  {
    path: '/admin/update-emergency-number',
    component: './admin/update-emergency-number',
    access: 'super-admin',
  },
  {
    path: '/emergency-hotlines',
    component: './lgu-admin/emergency-hotlines',
    access: 'lgu-admin',
  },
  {
    path: '/admin/calamity-posts',
    component: './admin/calamity-posts',
    access: 'admin',
  },
  {
    path: '/lgu-admin/calamity-posts',
    component: './lgu-admin/calamity-posts',
    access: 'lgu-admin',
  },
  {
    path: '/lgu-province/emergency-hotlines',
    component: './lgu-province/emergency-hotlines',
    access: 'lgu-province',
  },
  {
    path: '/lgu-province/suggested-itineraries',
    component: './lgu-province/suggested-itineraries',
    access: 'lgu-province',
  },
  {
    path: '/lgu-province/calamity-posts',
    component: './lgu-province/calamity-posts',
    access: 'lgu-province',
  },
  {
    path: '/lgu-admin/suggested-itineraries',
    component: './lgu-admin/suggested-itineraries',
    access: 'lgu-admin',
  },
  {
    path: '/lgu-admin/QR-logging',
    component: './lgu-admin/QR-logging',
    access: 'lgu-admin',
  },
  {
    path: '/lgu-province/QR-logging',
    component: './lgu-province/QR-logging',
    access: 'lgu-province',
  },
  {
    path: '/lgu-admin/most-visited',
    component: './lgu-admin/most-visited',
    access: 'lgu-admin',
  },
  {
    path: '/lgu-province/most-visited',
    component: './lgu-province/most-visited',
    access: 'lgu-province',
  },
  {
    path: '/maintenance',
    component: './500',
  },
  {
    component: './404',
  },
];

routes = IS_UNDER_MAINTENANCE
  ? routes.filter((x) => !['Admin Login', 'Locked Account', 'New Device Verified'].includes(x.name))
  : routes;

export default routes;
