import { request } from 'umi';
import store from 'store';
import { b64toBlob } from '@/services/utilities';

export async function getProvinces(token) {
  return request(`${API_URL}/admin/get-provinces`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
  });
}

export async function getCitiesByProvince(provinceId, token) {
  return request(`${API_URL}/admin/get-cities/${provinceId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
  });
}

export async function getLGUAdmins({ type, id }, token) {
  return request(`${API_URL}/admin/get-lgu-admins/${type}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
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

export async function removeAdmin(payload, token) {
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

export async function changePhoto({ blob, id, type }, token) {
  const data = new FormData();
  data.append('photo', blob);
  data.append('type', type);
  data.append('id', id);
  return request(`${API_URL}/change-photo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
    skipErrorHandler: true,
  });
}

export async function updateVerification(query, token) {
  return request(`${API_URL}/update-verification`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function createReport(data, token) {
  return request(`${API_URL}/create-report`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
    skipErrorHandler: true,
  });
}

export async function fetchFeedbacks(data, token) {
  return request(`${API_URL}/feedbacks`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: data || {},
    skipErrorHandler: true,
  });
}

export async function resolveReport(data) {
  const token = store.get('token');
  return request(`${API_URL}/resolve-report`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: data || {},
    skipErrorHandler: true,
  });
}

export async function seenFeedback(data, token) {
  return request(`${API_URL}/seen-report`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: data || {},
    skipErrorHandler: true,
  });
}

export async function updateDescription(data) {
  return request(`${API_URL}/admin/update-description`, {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function changeLGUPhoto({ blob, id, type }, token) {
  const data = new FormData();
  data.append('photo', blob);
  data.append('type', type);
  data.append('id', id);
  return request(`${API_URL}/lgu-admin/change-lgu-photo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
    skipErrorHandler: true,
  });
}

export async function getAllCity(token) {
  return request(`${API_URL}/admin/get-cities-places/`, {
    // return request(`${API_URL}/all-provinces-city`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
  });
}
