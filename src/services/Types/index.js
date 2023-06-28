import { request } from 'umi';
import store from 'store';

export async function getOfferTypes(query, token) {
  return request(`${API_URL}/offer-types`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function editOfferTypeId(id, body, token) {
  return request(`${API_URL}/edit-offer-type/${id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: body,
  });
}

export async function removeCategory(data, token) {
  return request(`${API_URL}/remove-applicable-category`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: data,
  });
}
