import { request } from 'umi';
import store from 'store';

export async function getPublicAttraction(bool, params, token) {
  return request(`${API_URL}/lgu-admin/get-public-attraction/${bool}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params,
    skipErrorHandler: true,
  });
}

export async function addQrPublicAttractions({ info }, token) {
  let data = new FormData();
  data.append('info', JSON.stringify(info));

  return request(`${API_URL}/lgu-admin/add-qr-logging`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
    skipErrorHandler: true,
  });
}

export async function getRegionIdByCityId(params, token) {
  return request(`${API_URL}/lgu-admin/get-region-by-cityId`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params,
    skipErrorHandler: true,
  });
}

export async function getRegionIdByProvinceId(params, token) {
  return request(`${API_URL}/lgu-admin/get-region-by-provinceId`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params,
    skipErrorHandler: true,
  });
}

export async function deletePublicAttraction(id, token) {
  return request(`${API_URL}/lgu-admin/delete-public-attraction/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
  });
}

export async function updatePublicAttraction(id, params, token) {
  return request(`${API_URL}/lgu-admin/update-public-attraction/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params,
    skipErrorHandler: true,
  });
}

export async function createQrShortLink(data) {
  return request(`${API_URL}/tourists-logs/short-link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
    skipErrorHandler: true,
  });
}
