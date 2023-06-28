import { isNil } from 'lodash';
import { history } from 'umi';

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState) {
  const { currentUser } = initialState || {};

  return {
    admin: currentUser?.roles?.includes('admin') 
  };
}
