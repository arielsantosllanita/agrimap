import { request } from 'umi';
import store from 'store';

export async function getCountWalletPending(params, token) {
  return request(`${API_URL}/count-wallet-pending`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params,
    skipErrorHandler: true,
  });
}

export async function getWalletTransations(params, token) {
  return request(`${API_URL}/get-transactions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params,
    skipErrorHandler: true,
  });
}

export async function remitToMerchantWallet(id, params, token) {
  return request(`${API_URL}/remit-to-merchant-wallet/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params,
    skipErrorHandler: true,
  });
}
