import React, { useRef, useEffect, useState } from 'react';
import './Map.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import axios from 'axios';
import { getRegions } from '@/services/featuredplaces';
import { Button } from 'antd';
import mapboxgl from 'mapbox-gl'; // kay di gadawat ug import, 12 hours nako ga problema

export default ({ visible, closeMap, setVisible, updateAddress }) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidmlzaXRvdXIiLCJhIjoiY2ttYnd6Y21oMjVycjJvcXMxbjQzcHRmbSJ9.VAV4qSYSXfFYwiuCFYarTQ';
  const mapContainerRef = useRef(null);

  const [lng, setLng] = useState(122.7613);
  const [lat, setLat] = useState(11.5363);
  const [zoom, setZoom] = useState(10);
  const [placeName, setPlaceName] = useState('');
  const [lockButton, setLockButton] = useState(true);
  const [adressObj, setAddressObj] = useState({});
  const [loc, setLoc] = useState({});
  const [regions, setRegions] = useState({});
  let coord = {};

  useEffect(async () => {
    try {
      let res = await getRegions();
      if (res.success) setRegions(res.data);
    } catch {
      console.log('Error in getting the regions');
    }
    const map = new mapboxgl.Map({
      container: mapContainerRef?.current || null,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      countries: 'ph',
      element: '',
      getItemValue: (res) => {
        return res.place_name;
      },
    });

    map.addControl(geocoder);
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    map.on('move', () => {
      setZoom(map.getZoom().toFixed(2));
    });

    let marker = new mapboxgl.Marker();
    map.on('click', (e) => {
      marker.setLngLat(e.lngLat).addTo(map);
      setLng(e.lngLat.lng.toFixed(4));
      setLat(e.lngLat.lat.toFixed(4));
      setLockButton(false);
      fetchAdrdess(e.lngLat);
    });

    geocoder.on('result', (e) => {
      coord = { lng: e.result.center[0], lat: e.result.center[1] };
      setLockButton(false);
      marker.setLngLat(coord).addTo(map);
      fetchAdrdess(coord);
    });

    return () => map.remove();
  }, []);

  const fetchAdrdess = async (ev) => {
    let _lng = ev.lng;
    let _lat = ev.lat;
    let baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
    const url = `${baseUrl}${_lng},${_lat}.json?access_token=${mapboxgl.accessToken}&country=ph`;
    setLoc({ latitude: _lat, longitude: _lng });

    await axios
      .get(url)
      .then((f) => {
        setPlaceName(f.data?.features[0].place_name);
        setAddressObj(f);
      })
      .catch(console.log('Error'));
  };

  let addressName = {};

  const addressUpdate = (res, _location) => {
    let resp = res.data?.features[0];
    resp.context?.forEach((el) => {
      if (el.id.split('.')[0] == 'locality') addressName.barangay = el.text;
      if (el.id.split('.')[0] == 'place')
        addressName.city = el.text.toLowerCase().replace('city', '');
      if (el.id.split('.')[0] == 'region') addressName.province = el.text;
      if (!addressName.province) addressName.province = addressName.city;
    });

    let selectedCities = [];
    try {
      regions.forEach((region) => {
        region.provinces.forEach((province) => {
          province.citymunicipalities.forEach((city) => {
            if (city.name.trim().toLowerCase() == addressName.city.trim().toLowerCase()) {
              selectedCities.push({
                region,
                province,
                city,
                barangay: addressName.barangay,
              });
            }
          });
        });
      });
    } catch {
      closeMap();
    }
    if (selectedCities.length > 1) {
      selectedCities.forEach((obj) => {
        if (obj.province.name.toLowerCase().trim() == addressName.province.toLowerCase().trim())
          updateAddress({ ...obj, location: loc, placeName });
      });
    } else {
      const _ = selectedCities[0];
      updateAddress({
        region: _?.hasOwnProperty('region') ? _.region : {},
        province: _?.hasOwnProperty('province') ? _.province : {},
        city: _?.hasOwnProperty('city') ? _.city : '',
        barangay: _?.hasOwnProperty('barangay') ? _.barangay : '',
        location: loc,
        placeName,
      });
    }
  };

  return (
    <div style={{ visibility: visible ? 'visible' : 'hidden', height: '100%' }}>
      <div className="sidebarStyle">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <button
        className="closeBtn"
        type="danger"
        onClick={() => {
          setVisible(true);
          closeMap();
        }}
      >
        X
      </button>
      <div className="locationDiv">
        <span style={{ margin: 10, color: '#fff' }}>
          {placeName ? placeName : 'Find your address'}
        </span>
        <Button
          style={{
            width: '95%',
            marginBottom: 10,
            border: 'none',
          }}
          type="primary"
          disabled={lockButton}
          onClick={() => {
            addressUpdate(adressObj, loc);
            setVisible(true);
            closeMap();
          }}
        >
          Set Location
        </Button>
      </div>
      <div className="map-container" ref={mapContainerRef} />
    </div>
  );
};
