'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from 'boards/templates/boards/counterparty/components/counterparty_store';
import Files from 'templates/components/form_modules/files';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

class CounterpartyBagScheme extends React.Component {
  onBagSchemeFilesChange = (e) => {
    counterpartyStore.new_bag_scheme_files = e.target.value;
  };

  onBagSchemeFilesDelete = (id) => {
    // Необхідно проводити зміни через додаткову перемінну, бо react-easy-state не помічає змін глибоко всередині перемінних, як тут.
    let old_files = [...counterpartyStore.counterparty.old_bag_scheme_files];
    for (const i in old_files) {
      if (old_files.hasOwnProperty(i) && old_files[i].id === id) {
        old_files[i].status = 'delete';
        break;
      }
    }
    counterpartyStore.counterparty.old_bag_scheme_files = [...old_files];
  };

  postBagSchemes = () => {
    let formData = new FormData();
    formData.append('counterparty', JSON.stringify(counterpartyStore.counterparty));

    if (counterpartyStore.new_bag_scheme_files?.length > 0) {
      counterpartyStore.new_bag_scheme_files.map((file) => {
        formData.append('new_bag_scheme_files', file);
      });
    }

    axiosPostRequest('post_client_bag_schemes/', formData)
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
  };

  render() {
    const {edit_access} = window;

    return (
      <Choose>
        <When condition={counterpartyStore.counterparty.id}>
          <div className='mb-3'>
            <Files
              oldFiles={counterpartyStore.counterparty.old_bag_scheme_files}
              newFiles={counterpartyStore.new_bag_scheme_files}
              fieldName={'Схема укладки мішків на піддон'}
              onChange={this.onBagSchemeFilesChange}
              onDelete={this.onBagSchemeFilesDelete}
              disabled={!edit_access}
            />
          </div>
          <If condition={edit_access}>
            <div className='modal-footer'>
              <SubmitButton className='btn-info' text='Зберегти' onClick={this.postBagSchemes} />
            </div>
          </If>
        </When>
        <Otherwise>
          <div>Для додавання схем укладки мішків, будь ласка, збережіть новоствореного клієнта у вкладці "Загальна інформація"</div>
        </Otherwise>
      </Choose>
    );
  }
}

export default view(CounterpartyBagScheme);
