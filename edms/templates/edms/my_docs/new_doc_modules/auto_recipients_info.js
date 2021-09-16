'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';

class AutoRecipientsInfo extends React.Component {
  render() {
    const {autoRecipients} = this.props;
    const {doc_type_version} = newDocStore.new_document;

    return (
      <If condition={autoRecipients.length > 0}>
        <div className='css_new_doc_module mt-1 mb-3'>
          <small>
            <div>
              <span className='font-weight-bold'>Зверніть увагу!</span> Новий документ автоматично піде на розгляд до наступних
              співробітників:
            </div>
            <div className='col'>
              <For each='phase' of={autoRecipients} index='p_index'>
                <hr className='mx-0 my-1' />
                <div className='row' key='p_index'>
                  <div className='md-col-4 mr-2 font-italic'>{phase.mark}</div>
                  <div className='md-col-8 mr-2'>
                    <For each='recipient' of={phase.recipients} index='r_index'>
                      <If condition={recipient.doc_type_version === 0 || recipient.doc_type_version === doc_type_version}>
                        <div key={r_index}>{recipient.emp_seat}</div>
                        <If condition={phase.sole && r_index+1 < phase.recipients.length}>
                          <div className='font-italic'><span className='font-weight-bold'>або</span> (залежить від посади автора)</div>
                        </If>
                      </If>
                    </For>
                  </div>
                </div>
              </For>
            </div>
          </small>
        </div>
      </If>
    );
  }

  // TODO: Сужбова записка: прибрати отримувачів,
  //  Заявки - обўєднати види документів і показувати отримувачів відповідно до підтипу

  static defaultProps = {
    autoRecipients: []
  };
}

export default view(AutoRecipientsInfo);
