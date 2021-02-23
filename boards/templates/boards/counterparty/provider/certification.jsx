'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import providerStore from './provider_store';

class ProviderCertification extends React.Component {
  
  
  render() {
    const {provider, edit_access} = providerStore;

    return (
      <div>Сертифікація</div>
    );
  }
}

export default view(ProviderCertification);
