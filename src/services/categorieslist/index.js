import { request } from 'umi';
import store from 'store';
export async function getCategoryList(query, token) {
  return request(`${API_URL}/categories-list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function editCategoryById(id, body) {
  const data = new FormData();
  Object.keys(body).forEach((v) => data.append(v, body[v]));

  return request(`${API_URL}/edit-category/${id}`, {
    method: 'POST',
    data,
  });
}

export async function addSubCategory(payload) {
  const data = new FormData();
  data.append('data', JSON.stringify(payload?.data));
  data.append('icon', payload?.icon[0]);

  return request(`${API_URL}/admin/add-sub-category`, {
    method: 'POST',
    data,
  });
}

export async function getAllCategories() {
  return request(`${API_URL}/admin/get-all-categories`, {
    method: 'GET',
    skipErrorHandler: true,
  });
}
