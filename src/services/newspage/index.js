import { request } from 'umi';
import store from 'store';

export async function getNews(query, token) {
  return request(`${API_URL}/lgu-admin/get-news/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function updateNews(payload, objId, type, token) {
  let { headline, content, photos, url, externalUrl } = payload;
  let data = new FormData();
  data.append('type', type);
  data.append('headline', headline);
  data.append('content', content);
  // data.append('url', url);
  data.append('externalUrl', externalUrl);

  for (let i = 0; i < photos?.length; i++) data.append('photos', payload.photos[i]);

  return request(`${API_URL}/update-news/${objId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
    skipErrorHandler: true,
  });
}

export async function addNews(
  { headline, content, photos, cityId, provinceId, externalUrl },
  token,
) {
  let data = new FormData();
  data.append('headline', headline);
  data.append('content', content);
  data.append('cityId', cityId);
  data.append('provinceId', provinceId);
  data.append('externalUrl', externalUrl);

  for (let i = 0; i < photos.length; i++) data.append('photos', photos[i]);

  return request(`${API_URL}/lgu-admin/add-news`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
    skipErrorHandler: true,
  });
}

export async function deleteNews(id, token) {
  return request(`${API_URL}/lgu-admin/delete-news/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
  });
}

export async function changeNewsStatus(id, bool, token) {
  return request(`${API_URL}/lgu-admin/change-status-news/${id}/${bool}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
  });
}
