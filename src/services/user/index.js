import { request } from 'umi';
import store from 'store';

export async function login(payload, token) {
  return request(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function admin_login(payload, token) {
  return request(`${API_URL}/admin-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function google_signin(payload, token) {
  return request(`${API_URL}/admin/google-signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function lock_account(payload, token) {
  return request(`${API_URL}/lock-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function verify_pin(payload, token) {
  return request(`${API_URL}/verify-pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function device_confirm(payload, token) {
  return request(`${API_URL}/device-confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function request_pin(query, token) {
  return request(`${API_URL}/request-locked-pin`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function get_pin_timer(query, token) {
  return request(`${API_URL}/pin-timer`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function jwt_decode(query) {
  return request(`${API_URL}/jwt-decode`, {
    method: 'GET',
    params: query,
    skipErrorHandler: true,
  });
}
