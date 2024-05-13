'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';

class AutoRecipientsInfo extends React.Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    const {approval_list, to_work_list} = newDocStore.new_document;
  }

  render() {
    const {auto_recipients} = newDocStore;
    const {doc_type_version, approval_list, to_work_list} = newDocStore.new_document; //approval_list, to_work_list підтягуємося, щоб обновлялося componentDidUpdate

    return (
      <>
        <If condition={auto_recipients.length > 0 || approval_list.length > 0 || to_work_list.length > 0}>
          <div className='css_new_doc_module mt-1 mb-3 col-12'>
            <small>
              <div>
                <span className='font-weight-bold'>Зверніть увагу!</span> Новий документ автоматично піде на розгляд до наступних
                співробітників:
              </div>
              <div className='col'>
                <If condition={approval_list.length > 0}>
                  <hr className='mx-0 my-1' />
                  <div className='row' key='p_index'>
                    <div className='md-col-4 mr-2 font-italic'>Візування</div>
                    <div className='md-col-8 mr-2'>
                      <For each='approval' of={approval_list} index='approval_index'>
                        <div key={approval_index}>{approval.name}</div>
                      </For>
                    </div>
                  </div>
                </If>
                <If condition={auto_recipients.length > 0}>
                  <For each='phase' of={auto_recipients} index='p_index'>
                    <If condition={phase.doc_type_version === 0 || phase.doc_type_version === doc_type_version}>
                      <hr className='mx-0 my-1' />
                      <div className='row' key='p_index'>
                        <div className='md-col-4 mr-2 font-italic'>{phase.mark}</div>
                        <div className='md-col-8 mr-2'>
                          <For each='recipient' of={phase.recipients} index='r_index'>
                            <If condition={recipient.doc_type_version === 0 || recipient.doc_type_version === doc_type_version}>
                              <div key={r_index}>{recipient.emp_seat}</div>
                              <If condition={phase.sole && r_index + 1 < phase.recipients.length}>
                                <div className='font-italic'>
                                  <span className='font-weight-bold'>або</span> (залежить від посади автора)
                                </div>
                              </If>
                            </If>
                          </For>
                        </div>
                      </div>
                    </If>
                  </For>
                </If>
                <If condition={to_work_list.length > 0}>
                  <hr className='mx-0 my-1' />
                  <div className='row' key='p_index'>
                    <div className='md-col-4 mr-2 font-italic'>В роботу</div>
                    <div className='md-col-8 mr-2'>
                      <For each='to_work' of={to_work_list} index='to_work_index'>
                        <div key={to_work_index}>{to_work.name}</div>
                      </For>
                    </div>
                  </div>
                </If>
              </div>
            </small>
          </div>
        </If>
      </>
    );
  }

  // TODO Заявки - об’єднати види документів і показувати отримувачів відповідно до підтипу

  static defaultProps = {};
}

export default view(AutoRecipientsInfo);
