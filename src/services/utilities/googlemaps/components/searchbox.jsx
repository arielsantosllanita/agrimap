import { getRegions } from '@/services/featuredplaces';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Divider, Input, message } from 'antd';
import { useState, useEffect } from 'react';
import PlacesAutocomplete, { getLatLng, geocodeByPlaceId } from 'react-places-autocomplete';
import { useModel } from 'umi';

const SearchBox = ({ setData, closeMap, setVisible }) => {
  const [inputAddress, setInputAddress] = useState('');
  const [regions, setRegions] = useState([]);

  const { initialState } = useModel('@@initialState');
  const { currentUser: USER } = initialState;

  // GET REGIONS
  useEffect(() => {
    (async () => {
      try {
        const res = await getRegions();
        setRegions(res?.data);
      } catch (err) {
        message.error('Problem occurred while fetching regions');
      }
    })();
  }, []);

  const closeHandler = () => {
    setVisible(true);
    closeMap();
  };

  const handleSelect = async (address, placeId) => {
    try {
      setInputAddress(address);
      const res = await geocodeByPlaceId(placeId);
      const latLng = await getLatLng(res[0]);

      const cityMunipality = res[0].address_components.find((v) => v.types.includes('locality'));
      const region = res[0].address_components.find((v) =>
        v.types.includes('administrative_area_level_1'),
      );
      const province = res[0].address_components.find((v) =>
        v.types.includes('administrative_area_level_2'),
      );

      const regId = regions.filter((reg) => new RegExp(region?.long_name, 'i').test(reg?.name))[0];
      const provId = regions
        .reduce((acc, curr) => acc.concat(curr?.provinces), [])
        .filter((prov) => new RegExp(province?.long_name, 'i').test(prov?.name))[0];
      const cityId = provId?.citymunicipalities?.filter((city) =>
        new RegExp(cityMunipality?.long_name, 'i').test(city?.name),
      )[0];

      setData({
        region: regId,
        province: provId,
        city: USER?.city || cityId,
        barangay: null,
        location: { latitude: latLng.lat, longitude: latLng.lng },
        placeName: address,
      });

      // closeHandler();
    } catch (err) {
      console.log('MAPS_ERR', err);
      const msg =
        err == 'INVALID_REQUEST'
          ? 'Please select a valid address'
          : 'Problem occurred with google maps';
      message.error(msg);
    }
  };

  return (
    <PlacesAutocomplete
      value={inputAddress}
      onChange={(v) => setInputAddress(v)}
      onSelect={handleSelect}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => {
        return (
          <div
            style={{
              width: '20rem',
              zIndex: 4,
              position: 'absolute',
              marginTop: '1rem',
              marginLeft: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Input {...getInputProps({ placeholder: 'Search places...' })} />{' '}
              <Button
                type="text"
                style={{ marginRight: '-3rem', paddingLeft: '1rem', paddingRight: '1rem' }}
                onClick={closeHandler}
              >
                <CloseOutlined />
              </Button>
            </div>
            <div className="autocomplete-dropdown-container">
              {loading && <div style={{ textAlign: 'center' }}>Loading...</div>}
              {suggestions.map((suggestion) => {
                const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item';
                const style = suggestion.active
                  ? { padding: '1rem', backgroundColor: '#f0f0f0', cursor: 'pointer' }
                  : { padding: '1rem', backgroundColor: '#ffffff', cursor: 'pointer' };
                return (
                  <div
                    key={suggestion.placeId}
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <span>{suggestion.description}</span>
                    <Divider style={{ marginBottom: 0, marginTop: '10px' }} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      }}
    </PlacesAutocomplete>
  );
};

export default SearchBox;
