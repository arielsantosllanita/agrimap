import GoogleMapReact from 'google-map-react';
import Marker from '@/services/utilities/googlemaps/components/marker';

export default ({ lat, lng }) => {
  return (
    <div style={{ width: '100%', height: '20rem' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
        defaultZoom={17}
        center={{ lat, lng }}
      >
        <Marker lat={lat} lng={lng} />
      </GoogleMapReact>
    </div>
  );
};
