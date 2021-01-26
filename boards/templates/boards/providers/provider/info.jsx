'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import providerStore from './provider_store';
import TextInput from 'templates/components/form_modules/text_input';

class ProviderInfo extends React.Component {
  onNameChange = (e) => {
    providerStore.provider.name = e.target.value;
  };

  onLegalAddressChange = (e) => {
    providerStore.provider.legal_address = e.target.value;
  };

  onActualAddressChange = (e) => {
    providerStore.provider.actual_address = e.target.value;
  };

  render() {
    const {provider, edit_access} = providerStore;

    return (
      <>
        <TextInput text={provider.name} fieldName={'* Назва'} onChange={this.onNameChange} maxLength={100} disabled={!edit_access} />
        <TextInput
          text={provider.legal_address}
          fieldName={'Юридична адреса'}
          onChange={this.onLegalAddressChange}
          maxLength={200}
          disabled={!edit_access}
        />
        <TextInput
          text={provider.actual_address}
          fieldName={'Фактична адреса'}
          onChange={this.onActualAddressChange}
          maxLength={200}
          disabled={!edit_access}
        />
        
      </>
    );
  }
}

export default view(ProviderInfo);
