import Marker from './marker';
import GoogleMapReact from 'google-map-react';
import './map.css';
import SearchBox from './searchbox';
import { Button, message } from 'antd';
import { useEffect, useState } from 'react';
import { isNil } from 'lodash';

const Map = ({ data, setData, closeMap, setVisible }) => {
  const [isReadyToPin, setIsReadyToPin] = useState(false);
  const {
    placeName,
    location: { latitude, longitude },
  } = data;
  const defaultCoords = {
    lat: 8.1547222,
    lng: 125.1275,
    placeName: 'Gaisano Malaybalay, Sayre Highway, Malaybalay, Bukidnon, Philippines',
  };

  const mapClickHandler = async (data) => {
    try {
      //   const controller = new AbortController();

      //   const reverseGeoLocationApi = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${data.lat},${data.lng}&key=${GOOGLE_MAPS_API_KEY}`;
      //   const res = await axios.get(reverseGeoLocationApi, { signal: controller.signal });
      //   console.log('REVERSE_GEO_LOCATION', res?.data);

      /**
       * NOTE: Sa karon coordinates palang gina update if lahion ni user ang location sa pin sa map
       * pwedi rata makagamit og reverse geolocation para makuha ang place info
       * @see https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding?hl=en_US
       */
      setData((prev) => ({ ...prev, location: { latitude: data.lat, longitude: data.lng } }));
      // console.log('MAP CLICKED');

      //   return () => controller.abort();
    } catch (err) {
      // console.log('REVERS', err);
      message.error('Problem occurred with reverse geolocation');
    }
  };

  useEffect(() => {
    if ([placeName, latitude, longitude].every((v) => !isNil(v))) {
      setIsReadyToPin(true);
    }
  }, [placeName, latitude, longitude]);

  return (
    <div className="map">
      <div className="google-map">
        <SearchBox setData={setData} closeMap={closeMap} setVisible={setVisible} />
        <GoogleMapReact
          bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
          defaultZoom={17}
          center={
            data.location?.latitude
              ? { lat: data?.location?.latitude, lng: data.location?.longitude }
              : defaultCoords
          }
          onClick={mapClickHandler}
        >
          <Marker
            lat={data?.location?.latitude || defaultCoords.lat}
            lng={data.location?.longitude || defaultCoords.lng}
            data={data}
            closeFn={() => {
              setVisible(true);
              closeMap();
            }}
            textAddress={data.placeName || defaultCoords.placeName}
          />
        </GoogleMapReact>

        {isReadyToPin ? (
          <div
            style={{
              position: 'relative',
              width: '50%',
              margin: 'auto',
              marginTop: '-9rem',
              textAlign: 'center',
            }}
          >
            <Button
              type="primary"
              onClick={() => {
                setVisible(true);
                closeMap();
              }}
            >
              Pin this location
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Map;
