'use strict';
import * as React from 'react';
import GoogleMapReact from 'google-map-react';
import Geocode from 'react-geocode';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMapMarkerAlt} from '@fortawesome/free-solid-svg-icons';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from './counterparty_store';
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

class CounterpartyMap extends React.Component {
  state = {
    loading: true,
    map: 'legal', //, actual
    location: {
      lat: 0,
      lng: 0
    },
    location_added: true
  };

  componentDidMount() {
    this.getMap('legal');
  }

  getMap = (type) => {
    const map = type === 'legal' ? counterpartyStore.counterparty.legal_address : counterpartyStore.counterparty.actual_address;
    if (map !== '') {
      Geocode.fromAddress(map).then(
        (response) => {
          const {lat, lng} = response.results[0].geometry.location;
          this.setState({
            location: {
              lat: lat,
              lng: lng
            },
            loading: false,
            location_added: true
          });
        },
        (error) => {
          console.error(error);
        }
      );
    } else {
      this.setState({
        location_added: false,
        loading: false
      })
    }
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.map !== this.state.map) {
      this.setState({loading: true},
        () => this.getMap(this.state.map)
      );
    }
  }

  changeMap = (type) => {
    this.setState({
      map: type
    });
  };

  getButtonClass = (type) => {
    let button_class = 'btn btn-sm btn-secondary';
    if (this.state.map === type) button_class += ' active';
    return button_class;
  };

  render() {
    const {loading, location, location_added} = this.state;

    return (
      <>
        <div className='btn-group' role='group' aria-label='maps'>
          <button type='button' className={this.getButtonClass('legal')} onClick={() => this.changeMap('legal')}>
            Юридична адреса
          </button>
          <button type='button' className={this.getButtonClass('actual')} onClick={() => this.changeMap('actual')}>
            Фізична адреса
          </button>
        </div>
        <div style={{height: '50vh', width: '100%'}}>
          <If condition={!loading}>
            <Choose>
              <When condition={location_added}>
                <GoogleMapReact bootstrapURLKeys={{key: data.secrets.google_api_key}} defaultCenter={location} defaultZoom={15}>
                  <Marker lat={location.lat} lng={location.lng} text={counterpartyStore.counterparty.name} />
                </GoogleMapReact>
              </When>
              <Otherwise>
                <div>Для відображення карти додайте відповідну інформацію у вкладці "Загальна інформація".</div>
              </Otherwise>
            </Choose>
          </If>
        </div>
      </>
    );
  }
}

export default view(CounterpartyMap);
