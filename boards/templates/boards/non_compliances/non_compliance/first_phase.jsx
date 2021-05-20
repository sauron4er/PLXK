'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from './non_compliance_store';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';

class NCFirstPhase extends React.Component {
  onFormChange = (e, field) => {
    nonComplianceStore.non_compliance[field] = e.target.value;
  };

  render() {
    const {non_compliance} = nonComplianceStore;
  
    return (
      <div style={nonComplianceStore.getStyle(1)}>
        
        <div className='d-flex align-content-start p-0'>
          <div className='col-lg-9 align-content-start p-0'>
            <div className='d-flex'>
              <div className='col-lg-4 pr-1 border border-light'>
                № реєстрації:
                <TextInput
                  text={non_compliance.registration_number}
                  maxLength={15}
                  disabled={false}
                  onChange={(e) => this.onFormChange(e, 'registration_number')}
                />
              </div>
              <div className='col-lg-3 border border-light'>Дата:
                <DateInput
                  date={non_compliance.date_added}
                  id='date_added'
                  disabled={false}
                  onChange={(e) => this.onFormChange(e, 'date_added')}
                />
              </div>
              <div className='col-lg-5 pr-1 border border-light'>
                Пірозділ-ініціатор:
                <div className='font-weight-bold'>{department}</div>
              </div>
            </div>
            <div className='d-flex'>
              <div className='col-lg-4 border border-light'>Назва продукції:
                <TextInput
                  text={non_compliance.product_name}
                  maxLength={100}
                  disabled={false}
                  onChange={(e) => this.onFormChange(e, 'product_name')}
                />
              </div>
              <div className='col-lg-4 border border-light'>Вид продукції:
              
              </div>
              <div className='col-lg-4 border border-light'>Номер партії:
                <TextInput
                    text={non_compliance.party_number}
                    maxLength={15}
                    disabled={false}
                    onChange={(e) => this.onFormChange(e, 'party_number')}
                  />
              </div>
            </div>
          </div>
          <div className='col-lg-3 pr-1 border border-light'>
            Віза начальника підрозділу:
            <div className='font-weight-bold'>{window.dep_chief.name}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default view(NCFirstPhase);
