import { request } from 'umi';
import store from 'store';

export async function getRegisteredPerCategory(query, token) {
  return request(`${API_URL}/admin-dashboard/registeredPerCategory`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function getBookingsPerDay(query, token) {
  return request(`${API_URL}/admin-dashboard/bookingsPerDay`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function getBookingStatus(query, token) {
  return request(`${API_URL}/admin-dashboard/bookingStatus`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function getTotalBooked(query, token) {
  return request(`${API_URL}/lgu-admin/total-booked`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function getMunicipalities(query) {
  return request(`${API_URL}/municipalities-ids`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function getTouristLogs(id, query) {
  return request(`${API_URL}/get-tourist-logs/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function getQrPublicAttractions(id, query) {
  return request(`${API_URL}/qr-public-attractions/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: query,
    skipErrorHandler: true,
  });
}
