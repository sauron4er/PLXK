'use strict';
import React, {useState} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import reclamationsStore from 'boards/templates/boards/reclamations/store';
import NCRow from 'boards/templates/boards/reclamations/reclamation/row';
import NCItem from 'boards/templates/boards/reclamations/reclamation/item';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import SubmitButton from 'templates/components/form_modules/submit_button';
import Modal from 'react-responsive-modal';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';
import TextInput from "templates/components/form_modules/text_input";

function ReclamationSecondPhase() {
  const [modalOpen, setModalOpen] = useState(false);
  const {reclamation} = reclamationsStore;

  function onDecisionChange(e, index) {
    reclamationsStore.reclamation.decisions[index].decision = e.target.value;
  }

  function postDecision(phase) {
    const {reclamation} = reclamationsStore;
    let formData = new FormData();
    formData.append('decision', JSON.stringify(reclamation.edited_decision));
    formData.append('reclamation_id', reclamation.id);
    formData.append('responsible', reclamation.responsible);

    axiosPostRequest('reclamation_post_decision', formData)
      .then((response) => {
        reclamation.decisions[reclamation.edited_decision_index].decision_time = response;
        if (phase === 2) {
          reclamation.final_decision = reclamation.edited_decision.decision;
          reclamation.final_decision_time = response;
          reclamation.phase = 3;
        }
        setModalOpen(false);
      })
      .catch((error) => notify(error));
  }

  function arrangeDecision(decision, index) {
    reclamationsStore.reclamation.edited_decision_index = index;
    reclamationsStore.reclamation.edited_decision = decision;
    if (decision.phase === 1) {
      postDecision(1);
    } else {
      setModalOpen(true);
    }
  }

  function onResponsibleChange(e) {
    reclamationsStore.reclamation.responsible = e.id;
    reclamationsStore.reclamation.responsible_name = e.name;
  }

  function onCloseModal() {
    setModalOpen(false);
  }
  
  return (
    <div>
      <NCRow>
        <div className='col-12 font-weight-bold text-center text-white bg-dark'>Рішення</div>
      </NCRow>
      <For each='decision' of={reclamation.decisions} index='index'>
        <NCRow key={index} className={decision.phase === 2 && decision.decision_time !== '' ? 'bg-success' : ''}>
          <NCItem cols={4}>
            <div className='font-weight-bold pt-2'>{decision.user_name}</div>
          </NCItem>
          <NCItem cols={6} className='pt-2'>
            <TextInput
              text={decision.decision}
              maxLength={500}
              disabled={decision.user !== user_id || decision.decision_time !== ''}
              onChange={(e) => onDecisionChange(e, index)}
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
                      onClick={(e) => arrangeDecision(decision, index)}
                    />
                  </div>
                </If>
              </Otherwise>
            </Choose>
          </NCItem>
        </NCRow>
      </For>
      <Modal
        open={modalOpen}
        onClose={onCloseModal}
        showCloseIcon={false}
        closeOnOverlayClick={false}
        styles={{modal: {marginTop: 75, width: '100%', minHeight: '500px'}}}
      >
        Оберіть відповідального за виконання вашого рішення.
        <SelectorWithFilterAndAxios
          selectId='user_profiles_modal_select'
          listNameForUrl='user_profiles'
          onChange={onResponsibleChange}
          value={{id: reclamation.responsible, name: reclamation.responsible_name}}
          disabled={false}
        />
        <If condition={reclamation.decisions.length > 0}>
          <SubmitButton className='btn-info' text='Зберегти' onClick={(e) => postDecision(2)} />
        </If>
      </Modal>
    </div>
  );
}

export default view(ReclamationSecondPhase);
