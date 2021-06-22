'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from '../non_compliance_store';
import NCRow from 'boards/templates/boards/non_compliances/non_compliance/row';
import NCItem from 'boards/templates/boards/non_compliances/non_compliance/item';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import Selector from 'templates/components/form_modules/selector';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import SubmitButton from 'templates/components/form_modules/submit_button';
class NCSecondPhase extends React.Component {

  onRecomendationChange = (e, index) => {
    const selectedIndex = e.target.options.selectedIndex;
    nonComplianceStore.non_compliance.decisions[index].decision = e.target.options[selectedIndex].getAttribute('value');
  };

  onCommentChange = (e, index) => {
    nonComplianceStore.non_compliance.decisions[index].comment = e.target.value;
  };

  postRecomendation = (index) => {
    let formData = new FormData();
    formData.append('decision', JSON.stringify(nonComplianceStore.non_compliance.decisions[index]));
    formData.append('nc_id', JSON.stringify(nonComplianceStore.non_compliance.id));

    axiosPostRequest('post_decision', formData)
      .then((response) => {
        console.log(response);
        nonComplianceStore.non_compliance.decisions[index].decision_time = response
      })
      .catch((error) => notify(error));
  };

  render() {
    const {non_compliance} = nonComplianceStore;
  
    return (
      <div style={{borderBottom: '2px solid grey'}}>
        <NCRow>
          <div className='col-12 font-weight-bold text-center text-white bg-dark'>Рішення</div>
        </NCRow>
        <For each='decision' of={non_compliance.decisions} index='index'>
          <NCRow key={index}>
            <NCItem cols={4}>
              <div className='font-weight-bold pt-2'>{decision.user}</div>
            </NCItem>
            <NCItem cols={6} className='pt-2'>
              <Selector
                list={[
                  {id: 0, name: 'Переробка'},
                  {id: 1, name: 'Сортування протягом виробництва'},
                  {id: 2, name: 'Дозвіл на використання невідповідного продукту'},
                  {id: 3, name: 'Знищення'},
                  {id: 4, name: 'Повернення постачальнику '}
                ]}
                valueField='name'
                selectedName={decision.decision}
                onChange={(e) => this.onRecomendationChange(e, index)}
                disabled={decision.user_id !== user_id || decision.decision_time !== ''}
              />
            </NCItem>
            <NCItem cols={2} className='pt-2'>
              <Choose>
                <When condition={decision.decision_time !== ''}>
                  <div className='d-flex'>
                    <div className='m-auto font-italic'>{decision.decision_time}</div>
                  </div>
                </When>
                <Otherwise>
                  <If condition={decision.user_id === user_id && decision.decision_time === '' && decision.decision !== ''}>
                    <div className='d-flex'>
                      <SubmitButton
                        className='m-auto btn btn-sm btn-outline-primary'
                        text={'Зберегти'}
                        onClick={(e) => this.postRecomendation(index)}
                      />
                    </div>
                  </If>
                </Otherwise>
              </Choose>
            </NCItem>
          </NCRow>
        </For>
      </div>
    );
  }
}

export default view(NCSecondPhase);
