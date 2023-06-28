import { request } from 'umi';
import store from 'store';

export async function editPlacesById(id, body) {
  const data = new FormData();
  Object.keys(body).forEach((v) => data.append(v, body[v]));

  return request(`${API_URL}/edit-manage-places/${id}`, {
    method: 'POST',
    data,
  });
}
