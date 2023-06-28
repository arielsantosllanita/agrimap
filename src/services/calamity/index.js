import { request } from 'umi';

export async function addCalamityWarning(payload) {
  return request(`${API_URL}/admin/add-calamity-post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function getCalamityPost(query) {
  return request(`${API_URL}/admin/get-calamity-posts`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function getCalamityComment(query) {
  return request(`${API_URL}/admin/calamity-response/${query.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: (({ id, ...rest }) => rest)(query),
    skipErrorHandler: true,
  });
}

export async function hideCalamityPost(postId) {
  return request(`${API_URL}/admin/hide-calamity-post/${postId}`, {
    method: 'POST',
    skipErrorHandler: true,
  });
}

export async function respondUserStatus(responseId, payload) {
  return request(`${API_URL}/admin/respond-user-status/${responseId}`, {
    method: 'POST',
    skipErrorHandler: true,
    data: payload,
  });
}

export async function getCalamityPostUnread(query) {
  return request(`${API_URL}/admin/get-calamity-response-unread`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function readResponse(query) {
  return request(`${API_URL}/admin/read-response-update`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: query,
    skipErrorHandler: true,
  });
}
