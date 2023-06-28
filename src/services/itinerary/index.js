import { request } from 'umi';

export async function addItinerary(payload) {
  return request(`${API_URL}/add-suggested-itinerary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function getItineraries(query) {
  return request(`${API_URL}/get-suggested-itinerary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function updateItinerary(payload, id) {
  return request(`${API_URL}/update-suggested-itinerary/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function removeItinerary(payload) {
  return request(`${API_URL}/remove-suggested-itinerary/${payload?.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // data: payload,
    skipErrorHandler: true,
  });
}
