import { request } from 'umi';
import store from 'store';
import { identity } from 'lodash';

export async function getVerificationRequests(query, token) {
  return request(`${API_URL}/get-places`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function verifyPlace(query, token) {
  return request(`${API_URL}/admin/verify-place`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function declineRequest(payload, token) {
  return request(`${API_URL}/decline-verification-request`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function getPlace(query, token) {
  return request(`${API_URL}/get-places-specific`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function getMerchantEstablishment(query, token) {
  return request(`${API_URL}/merchant/establishments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function getEstablishmentBookings(query, token) {
  return request(`${API_URL}/merchant/establishment-status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function getBookingPerStatus(query, token) {
  return request(`${API_URL}/merchant/booking-per-status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function acceptRequest(query, token) {
  return request(`${API_URL}/merchant/accept_request`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}

export async function declineBookingRequest(bookingID, reason = '', token) {
  return request(`${API_URL}/merchant/decline-request/${bookingID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: { reason },
    skipErrorHandler: true,
  });
}

export async function getBookingInfoById(bookingID, token) {
  return request(`${API_URL}/merchant/query-booking-request/${bookingID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
  });
}

export async function getMerchantOffers(establishmentID, token) {
  return request(`${API_URL}/merchant/get-offer/${establishmentID}/offerID`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
  });
}

export async function getMerchantBlockedDates(placeId, offerIds, token) {
  return request(`${API_URL}/merchant/get-blocked-dates`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: { placeId, offerIds },
    skipErrorHandler: true,
  });
}

export async function saveBlockDate(payload, token) {
  return request(`${API_URL}/merchant/save-block-date`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function saveMerchantOffer(payload) {
  const data = new FormData();

  Object.keys((({ photos, ...others }) => others)({ ...payload })).forEach((name) => {
    data.append(name, payload[name]);
  });

  for (let i = 0; i < payload.photos.length; i++) data.append('photos', payload.photos[i]);

  return request(`${API_URL}/merchant/add-offer`, {
    method: 'POST',
    data: data,
    skipErrorHandler: true,
  });
}

export async function updateEstablishment(payload) {
  const token = store.get('token');
  const data = new FormData();

  for (let i = 0; i < payload.photos.length; i++) data.append('photos', payload.photos[i]);
  delete payload.photos;
  for (let i = 0; i < Object.keys(payload).length; i++) {
    data.append(Object.keys(payload)[i], payload[`${Object.keys(payload)[i]}`]);
  }
  return request(`${API_URL}/merchant/update-establishment/${payload.id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
    skipErrorHandler: true,
  });
}

export async function getAllCategories() {
  return request(`${API_URL}/merchant/get-all-categories`, {
    method: 'GET',
    skipErrorHandler: true,
  });
}

export async function communityGuide(payload) {
  const token = store.get('token');
  const data = new FormData();

  for (let i = 0; i < Object.keys(payload).length; i++) {
    data.append(Object.keys(payload)[i], payload[`${Object.keys(payload)[i]}`]);
  }

  for (let i = 0; i < payload.photos.length; i++) data.append('photos', payload.photos[i]);

  return request(`${API_URL}/merchant/community-guide/${payload.id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
    skipErrorHandler: true,
  });
}

export async function updateOffers(payload, photos) {
  const data = new FormData();
  const token = store.get('token');
  Object.keys(payload).forEach((key) => {
    data.append(key, payload[key]);
  });

  for (let i = 0; i < payload.photos.length; i++) data.append('photos', payload.photos[i]);
  return request(`${API_URL}/merchant/update-offers/${payload.id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
    skipErrorHandler: true,
  });
}

export async function removeOffers(id) {
  return request(`${API_URL}/merchant/remove-offers/${id}`, {
    method: 'POST',
    skipErrorHandler: true,
  });
}

export async function saveOfferBlockDate(payload, token) {
  return request(`${API_URL}/merchant/save-offer-block-date`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function updateReview(payload, token) {
  const data = new FormData();
  if (photos.length != 0) {
    photos.forEach((item, i) => {
      data.append('photos', {
        name: item.name,
        size: item.size,
        type: item.type,
        uri: item.uri,
      });
    });
  } else data.append('photosDefault', JSON.stringify(item.photos));
  data.append('_id', id);
  data.append('review', review);
  data.append('rate', rate);

  return request(`${API_URL}/merchant/update-review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: payload,
    skipErrorHandler: true,
  });
}

export async function getReviews(placeId) {
  return request(`${API_URL}/merchant/get-reviews/${placeId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    skipErrorHandler: true,
  });
}

export async function getMerchantOfferTypes() {
  return request(`${API_URL}/merchant/offer-types`, {
    method: 'GET',
    skipErrorHandler: true,
  });
}

export async function guideRemoveOffers(id) {
  return request(`${API_URL}/merchant/guide-remove-offers/${id}`, {
    method: 'POST',
    skipErrorHandler: true,
  });
}

export async function guideAddOffer(payload) {
  const data = new FormData();

  Object.keys((({ photos, ...others }) => others)({ ...payload })).forEach((name) => {
    data.append(name, payload[name]);
  });

  for (let i = 0; i < payload.photos.length; i++) data.append('photos', payload.photos[i]);

  return request(`${API_URL}/merchant/guide-add-offer`, {
    method: 'POST',
    data: data,
    skipErrorHandler: true,
  });
}

export async function getGuideOffers(establishmentID, token) {
  return request(`${API_URL}/merchant/guide-get-offer/${establishmentID}/offerID`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
  });
}

export async function deletePhotosOffer(id, urls, token) {
  return request(`${API_URL}/merchant/offer-delete-photo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: { id, urls },
    skipErrorHandler: true,
  });
}

export async function guideDeletePhotos(id, urls, token) {
  return request(`${API_URL}/merchant/guide-delete-photo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: { id, urls },
    skipErrorHandler: true,
  });
}

export async function editOffersDeletePhotos(id, urls, token) {
  return request(`${API_URL}/merchant/edit-offers-delete-photo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: { id, urls },
    skipErrorHandler: true,
  });
}

export async function guideOffersDeletePhotos(id, urls, token) {
  return request(`${API_URL}/merchant/guide-offers-delete-photo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: { id, urls },
    skipErrorHandler: true,
  });
}

export async function guideUpdateOffers(payload, photos) {
  const data = new FormData();
  const token = store.get('token');
  Object.keys(payload).forEach((key) => {
    data.append(key, payload[key]);
  });

  for (let i = 0; i < payload.photos.length; i++) data.append('photos', payload.photos[i]);
  return request(`${API_URL}/merchant/guide-update-offers/${payload.id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: data,
    skipErrorHandler: true,
  });
}

export async function getPlaces(query, token) {
  return request(`${API_URL}/lgu-admin/lgu-views`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}
export async function getProvincePlaces(query, token) {
  return request(`${API_URL}/lgu-admin/lgu-province-views`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: query,
    skipErrorHandler: true,
  });
}
