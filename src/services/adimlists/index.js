import { request } from 'umi';
import store from 'store';

export async function getadmins(query, token) {
  return request(`${API_URL}/get-admins`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function addAdmin(payload, token) {
  return request(`${API_URL}/admin/add-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function removeAdmins(payload, token) {
  return request(`${API_URL}/admin/remove-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: payload,
    skipErrorHandler: true,
  });
}
