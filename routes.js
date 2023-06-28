module.exports = [
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
    name: 'Manage Provinces',
    path: '/manage-provinces',
    component: './admin/manage-provinces',
  },
  {
    name: 'Verification Requests',
    path: '/verification-requests',
    component: './admin/verification-requests',
  },
  {
    name: 'Featured Places',
    path: '/featured-places',
    component: './lgu-admin/featured-places',
  },
  {
    name: 'News',
    path: '/lgu-news',
    component: './lgu-admin/news-page',
  },
  {
    component: './404',
  },
];
