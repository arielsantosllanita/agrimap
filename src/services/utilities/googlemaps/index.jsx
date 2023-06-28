import { useState, useEffect } from 'react';
import Map from './components/map';

const GoogleMaps = ({ updateAddress, closeMap, setVisible }) => {
  const [data, setData] = useState({
    region: null,
    province: null,
    city: null,
    barangay: null,
    location: { latitude: null, longitude: null },
    placeName: null,
  });

  useEffect(() => {
    if (data.location?.latitude || data.location?.longitude) {
      updateAddress({ ...data });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.location?.latitude, data.location?.longitude]);

  return <Map setVisible={setVisible} closeMap={closeMap} setData={setData} data={data} />;
};

export default GoogleMaps;
