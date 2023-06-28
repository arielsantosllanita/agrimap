import { request } from 'umi';

export async function getEmergencyData(params, token) {
  return request(`${API_URL}/admin/get-emergency-data`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params,
    skipErrorHandler: true,
  });
}

export async function updateContactNumbers({ id, updatedNumbers, address }, token) {
  let formData = new FormData();
  formData.append('id', JSON.stringify(id));
  formData.append('updatedNumbers', JSON.stringify(updatedNumbers));
  formData.append('address', JSON.stringify(address));

  return request(`${API_URL}/update/contact-number`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: formData,
    skipErrorHandler: true,
  });
}
