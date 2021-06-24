'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from '../non_compliance_store';
import NCItem from 'boards/templates/boards/non_compliances/non_compliance/item';
import NCRow from 'boards/templates/boards/non_compliances/non_compliance/row';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {isBlankOrZero, notify} from 'templates/components/my_extras';
import {axiosPostRequest} from 'templates/components/axios_requests';

class NCThirdPhase extends React.Component {
  areThirdPhaseFieldsFilled = () => {
    let fields = {
      // result_of_nc: 'Невідповідність призводить до',
      // corrective_action: 'Корегуюча \\ запобіжна дія',
      // other: 'Інше'
    };
    
    switch (nonComplianceStore.non_compliance.final_decision) {
      case 'Переробка':
        fields.retreatment_date = 'Дата переробки';
        fields.spent_time = 'Затрачений час, годин';
        fields.people_involved = 'Кількість задіяних осіб';
        fields.quantity_updated = 'Корегування залишків продукції';
        fields.status_updated = 'Корегування інформативного статусу';
        break;
      case 'Повернення постачальнику':
        fields.return_date = 'Дата повернення'
        break;
    }
    
    for (const [key, value] of Object.entries(fields)) {
      if (isBlankOrZero(nonComplianceStore.non_compliance[key])) {
        notify(`Заповніть поле "${value}"`);
        return false;
      }
    }

    return true;
  };

  postDone = () => {
    if (this.areThirdPhaseFieldsFilled()) {
      let formData = new FormData();
      formData.append('non_compliance', JSON.stringify(nonComplianceStore.non_compliance));

      axiosPostRequest('done', formData)
        .then((response) => {
          location.reload();
        })
        .catch((error) => notify(error));
    }
  };

  render() {
    const {non_compliance, onFormChange, user_role} = nonComplianceStore;
    const inputs_disabled = user_role !== 'responsible' || non_compliance.phase !== 3;

    return (
      <>
        <NCRow>
          <div className='col-12 font-weight-bold text-center text-white bg-dark'>Виконання</div>
        </NCRow>
        <NCRow>
          <NCItem>
            Особа, відповідальна за подальші дії: <span className='font-weight-bold'>{non_compliance.responsible_name}</span>
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem cols='4'>
            <TextInput
              fieldName='Невідповідність призводить до'
              text={non_compliance.result_of_nc}
              maxLength={100}
              disabled={inputs_disabled}
              onChange={(e) => onFormChange(e, 'result_of_nc')}
            />
          </NCItem>
          <NCItem cols='4'>
            <TextInput
              fieldName='Корегуюча \ запобіжна дія'
              text={non_compliance.corrective_action}
              maxLength={100}
              disabled={inputs_disabled}
              onChange={(e) => onFormChange(e, 'corrective_action')}
            />
          </NCItem>
          <NCItem cols='4'>
            <TextInput
              fieldName='Інше'
              text={non_compliance.other}
              maxLength={100}
              disabled={inputs_disabled}
              onChange={(e) => onFormChange(e, 'other')}
            />
          </NCItem>
        </NCRow>
        <Choose>
          <When condition={non_compliance.final_decision === 'Переробка'}>
            <NCRow>
              <div className='col-lg-9 align-content-start p-0'>
                <NCRow>
                  <NCItem cols={4} className='d-flex'>
                    <DateInput
                      fieldName='Дата переробки'
                      date={non_compliance.retreatment_date}
                      disabled={inputs_disabled}
                      onChange={(e) => onFormChange(e, 'retreatment_date')}
                    />
                  </NCItem>
                  <NCItem cols={4}>
                    <TextInput
                      fieldName='Затрачений час, годин'
                      text={non_compliance.spent_time}
                      maxLength={5}
                      disabled={inputs_disabled}
                      onChange={(e) => onFormChange(e, 'spent_time')}
                    />
                  </NCItem>
                  <NCItem cols={4}>
                    <TextInput
                      fieldName='Кількість задіяних осіб'
                      text={non_compliance.people_involved}
                      maxLength={3}
                      disabled={inputs_disabled}
                      onChange={(e) => onFormChange(e, 'people_involved')}
                    />
                  </NCItem>
                </NCRow>
                <NCRow>
                  <NCItem cols={4}>
                    <TextInput
                      fieldName='Корегування залишків продукції'
                      text={non_compliance.quantity_updated}
                      maxLength={10}
                      disabled={inputs_disabled}
                      onChange={(e) => onFormChange(e, 'quantity_updated')}
                    />
                  </NCItem>
                  <NCItem cols={8}>
                    <TextInput
                      fieldName='Корегування інформативного статусу'
                      text={non_compliance.status_updated}
                      maxLength={50}
                      disabled={inputs_disabled}
                      onChange={(e) => onFormChange(e, 'status_updated')}
                    />
                  </NCItem>
                </NCRow>
              </div>
              <NCItem cols={3} className='p-2 text-center'>
                <Choose>
                  <When condition={non_compliance.phase === 3}>
                    <If condition={user_role === 'responsible'}>
                      <SubmitButton className='btn-info' text='Виконано' onClick={this.postDone} />
                    </If>
                  </When>
                  <When condition={non_compliance.phase === 4}>
                    <div className='border border-success rounded p-1 mt-1 text-center text-success font-weight-bold'>Виконано</div>
                  </When>
                </Choose>
              </NCItem>
            </NCRow>
          </When>
          <When condition={non_compliance.final_decision === 'Повернення постачальнику'}>
            <NCRow>
              <NCItem cols={6}> </NCItem>
              <NCItem cols={3} className='d-flex'>
                <DateInput
                  fieldName='Дата повернення'
                  date={non_compliance.return_date}
                  disabled={inputs_disabled}
                  onChange={(e) => onFormChange(e, 'return_date')}
                />
              </NCItem>

              <NCItem cols={3} className='p-2 text-center'>
                <Choose>
                  <When condition={non_compliance.phase === 3}>
                    <If condition={user_role === 'responsible'}>
                      <SubmitButton className='btn-info' text='Виконано' onClick={this.postDone} />
                    </If>
                  </When>
                  <When condition={non_compliance.phase === 4}>
                    <div className='border border-success rounded p-1 mt-1 text-center text-success font-weight-bold'>Виконано</div>
                  </When>
                </Choose>
              </NCItem>
            </NCRow>
          </When>
        </Choose>
        <NCRow>
          <NCItem className='text-danger'>УВАГА якщо це повторна поставка товару постачальником, надати 1 накладну на повернення</NCItem>
        </NCRow>
      </>
    );
  }
}

export default view(NCThirdPhase);
