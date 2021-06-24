'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from '../non_compliance_store';
import NCRow from 'boards/templates/boards/non_compliances/non_compliance/row';
import NCItem from 'boards/templates/boards/non_compliances/non_compliance/item';
import Selector from 'templates/components/form_modules/selector';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import SubmitButton from 'templates/components/form_modules/submit_button';
import Modal from 'react-responsive-modal';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selector_with_filter_and_axios';
class NCSecondPhase extends React.Component {
  state = {
    responsible_modal_opened: false
  };
  onRecomendationChange = (e, index) => {
    const selectedIndex = e.target.options.selectedIndex;
    nonComplianceStore.non_compliance.decisions[index].decision = e.target.options[selectedIndex].getAttribute('value');
  };

  onCommentChange = (e, index) => {
    nonComplianceStore.non_compliance.decisions[index].comment = e.target.value;
  };

  postDecision = (phase) => {
    const {non_compliance} = nonComplianceStore;
    let formData = new FormData();
    formData.append('decision', JSON.stringify(non_compliance.edited_decision));
    formData.append('nc_id', non_compliance.id);
    formData.append('responsible', non_compliance.responsible);

    axiosPostRequest('post_decision', formData)
      .then((response) => {
        non_compliance.decisions[non_compliance.edited_decision_index].decision_time = response;
        if (phase === 2) {
          non_compliance.final_decision = non_compliance.edited_decision.decision;
          non_compliance.final_decision_time = response;
          non_compliance.phase = 3
        }
        this.setState({responsible_modal_opened: false});
      })
      .catch((error) => notify(error));
  };

  arrangeDecision = (decision, index) => {
    nonComplianceStore.non_compliance.edited_decision_index = index;
    nonComplianceStore.non_compliance.edited_decision = decision;
    if (decision.phase === 1) {
      this.postDecision(1);
    } else {
      this.setState({responsible_modal_opened: true});
    }
  };

  onResponsibleChange = (e) => {
    nonComplianceStore.non_compliance.responsible = e.id
    nonComplianceStore.non_compliance.responsible_name = e.name
  };

  onCloseModal = () => {
    this.setState({responsible_modal_opened: false});
  };

  render() {
    const {non_compliance} = nonComplianceStore;
    const {responsible_modal_opened} = this.state;

    return (
      <div>
        <NCRow>
          <div className='col-12 font-weight-bold text-center text-white bg-dark'>Рішення</div>
        </NCRow>
        <For each='decision' of={non_compliance.decisions} index='index'>
          <NCRow key={index} className={decision.phase === 2 && decision.decision_time !== '' ? 'bg-success' : ''}>
            <NCItem cols={4}>
              <div className='font-weight-bold pt-2'>{decision.user_name}</div>
            </NCItem>
            <NCItem cols={6} className='pt-2'>
              <Selector
                list={[
                  {id: 1, name: 'Переробка'},
                  {id: 2, name: 'Сортування протягом виробництва'},
                  {id: 3, name: 'Дозвіл на використання невідповідного продукту'},
                  {id: 4, name: 'Знищення'},
                  {id: 5, name: 'Повернення постачальнику'}
                ]}
                valueField='name'
                selectId='decision'
                selectedName={decision.decision}
                onChange={(e) => this.onRecomendationChange(e, index)}
                disabled={decision.user !== user_id || decision.decision_time !== ''}
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
                  <If condition={decision.user === user_id && decision.decision_time === '' && decision.decision !== ''}>
                    <div className='d-flex'>
                      <SubmitButton
                        className='m-auto btn btn-sm btn-outline-primary'
                        text={'Зберегти'}
                        onClick={(e) => this.arrangeDecision(decision, index)}
                      />
                    </div>
                  </If>
                </Otherwise>
              </Choose>
            </NCItem>
          </NCRow>
        </For>
        <Modal
          open={responsible_modal_opened}
          onClose={this.onCloseModal}
          showCloseIcon={false}
          closeOnOverlayClick={false}
          styles={{modal: {marginTop: 50, width: '100%'}}}
        >
          Оберіть відповідального за виконання вашого рішення.
          <SelectorWithFilterAndAxios
            selectId='responsible_select'
            listNameForUrl='employees'
            onChange={this.onResponsibleChange}
            value={{id: non_compliance.responsible, name: non_compliance.responsible_name}}
            disabled={false} />
          <If condition={non_compliance.decisions.length > 0}>
            <SubmitButton className='btn-info' text='Зберегти' onClick={(e) => this.postDecision(2)} />
          </If>
        </Modal>
      </div>
    );
  }
}

export default view(NCSecondPhase);
