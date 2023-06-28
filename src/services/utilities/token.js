import { useModel } from 'umi';

/**
 * Custom hook for retrieving user token
 */
export const useGetToken = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser: user } = initialState;
  const token = store.get(`token-${user?.mode}`);
  return token;
};
