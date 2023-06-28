import { request } from 'umi';
import store from 'store';

export async function getPlaces(bool, params, token) {
  return request(`${API_URL}/lgu-admin/get-featured-places/${bool}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params,
    skipErrorHandler: true,
  });
}

export async function updatePlace({ id, payload, photos }, token) {
  let data = new FormData();
  data.append('data', JSON.stringify(payload));
  for (let i = 0; i < photos?.length; i++) data.append('photos', photos[i]);

  return request(`${API_URL}/lgu-admin/update-place/${id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
    skipErrorHandler: true,
  });
}

export async function getCategories(token) {
  return request(`${API_URL}/lgu-admin/categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
  });
}

export async function getRegions(token) {
  return request(`${API_URL}/lgu-admin/get-region`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
  });
}

export async function addPlace({ info, photos }, token) {
  let data = new FormData();
  data.append('info', JSON.stringify(info));
  for (let i = 0; i < photos.length; i++) data.append('photos', photos[i]);

  return request(`${API_URL}/lgu-admin/add-featured-places`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
    skipErrorHandler: true,
  });
}

export async function deletePlace(id, token) {
  return request(`${API_URL}/lgu-admin/delete-place/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
  });
}

export async function searchPlaces(params, token) {
  return request(`${API_URL}/search-place`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params,
    skipErrorHandler: true,
  });
}

export async function addNews({ info, photos }, token) {
  let data = new FormData();
  data.append('info', JSON.stringify(info));
  for (let i = 0; i < photos.length; i++) data.append('photos', photos[i]);

  return request(`${API_URL}/admin/add-news-articles`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
    skipErrorHandler: true,
  });
}

export async function getNews(params, token) {
  return request(`${API_URL}/admin/get-news-articles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params,
    skipErrorHandler: true,
  });
}

export async function removeNews(params, token) {
  return request(`${API_URL}/admin/remove-news-articles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params,
    skipErrorHandler: true,
  });
}

export async function getReviews(id, params) {
  return request(`${API_URL}/lgu-admin/reviews/${id}`, {
    method: 'GET',
    params,
    skipErrorHandler: true,
  });
}

export async function updateNews({ info, photos, nonBlobs }, token) {
  let data = new FormData();
  data.append('info', JSON.stringify(info));
  if (photos.length > 0) for (let i = 0; i < photos.length; i++) data.append('photos', photos[i]);
  else data.append('photos', []);
  data.append('nonBlobs', JSON.stringify(nonBlobs));

  return request(`${API_URL}/admin/update-news-articles`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
    skipErrorHandler: true,
  });
}
