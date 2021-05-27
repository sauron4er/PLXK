'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from './non_compliance_store';
import NCRow from 'boards/templates/boards/non_compliances/non_compliance/row';
import NCItem from 'boards/templates/boards/non_compliances/non_compliance/item';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
class NCSecondPhase extends React.Component {
  render() {
    const {non_compliance, onFormChange} = nonComplianceStore;

    return (
      <div style={{borderBottom: '2px solid grey'}}>
        <NCRow>
          <NCItem className='font-weight-bold text-center text-white bg-dark'>Рішення</NCItem>
        </NCRow>
        <NCRow>
          <NCItem cols='8'>
            Особа, відповідальна за прийняття рішення щодо подальших дій
            <div>Список співробітників з вибором</div>
          </NCItem>
          <NCItem cols='4'>
            Рішення
            <div>Список варіантів рішення з вибором</div>
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem>
            Коментар
            <TextInput text={non_compliance.comment} maxLength={5000} disabled={false} onChange={(e) => onFormChange(e, 'comment')} />
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem cols='3'>
            Дата прийняття рішення
            <DateInput
              date={non_compliance.decision_date}
              disabled={false}
              onChange={(e) => onFormChange(e, 'decision_date')}
            />
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem className='text-danger'>УВАГА якщо це повторна поставка товару постачальником, надати 1 накладну на повернення</NCItem>
        </NCRow>
      </div>
    );
  }
}

export default view(NCSecondPhase);
