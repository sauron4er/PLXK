'use strict';
import * as React from 'react';
import GoogleMapReact from 'google-map-react';
import Geocode from 'react-geocode';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMapMarkerAlt} from '@fortawesome/free-solid-svg-icons';
import {view, store} from '@risingstack/react-easy-state';
import providerStore from './provider_store';
const data = require('plxk/secrets.json');

Geocode.setApiKey(data.secrets.google_api_key);

const Marker = ({text}) => (
  <>
    <h3 className='text-danger'>
      <FontAwesomeIcon icon={faMapMarkerAlt} />
    </h3>
    {text}
  </>
);

class ProviderMap extends React.Component {
  state = {
    loading: true,
    lat: 0,
    lng: 0
  };

  componentDidMount() {
    Geocode.fromAddress(
      providerStore.provider.actual_address !== '' ? providerStore.provider.actual_address : 'Перечинський лісохімкомбінат'
    ).then(
      (response) => {
        const {lat, lng} = response.results[0].geometry.location;
        this.setState({
          location: {
            lat: lat,
            lng: lng
          },
          loading: false
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  render() {
    const {loading, location} = this.state;

    return (
      <div style={{height: '50vh', width: '100%'}}>
        <If condition={!loading}>
          <GoogleMapReact bootstrapURLKeys={{key: data.secrets.google_api_key}} defaultCenter={location} defaultZoom={15}>
            <Marker lat={location.lat} lng={location.lng} text={providerStore.provider.name} />
          </GoogleMapReact>
        </If>
      </div>
    );
  }
}

export default view(ProviderMap);
