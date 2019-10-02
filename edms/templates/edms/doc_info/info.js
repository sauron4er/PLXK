'use strict';
import React from 'react';
import Approvals from './doc_info_modules/approvals';
import Recipient from './doc_info_modules/recipient';
import Text from './doc_info_modules/text';
import Day from './doc_info_modules/day';
import Gate from './doc_info_modules/gate';
import CarryOut from './doc_info_modules/carry_out';
import Resolutions from './doc_info_modules/resolutions';
import Files from './doc_info_modules/files';

class Info extends React.Component {
  render() {
    const {info, doc} = this.props;

    if (info.path) {
      return (
        <div>
          {/*Початкова інфа про документ:*/}
          <div className='d-flex justify-content-between'>
            <span className='font-weight-bold'>{doc.type}</span>
            <span>
              №: {doc.id}. Дата: {doc.date}
            </span>
          </div>
          <div>
            Автор:
            <span className='font-italic'> {doc.author}</span>
          </div>

          {/* Модульна система */}
          <If condition={info.type_modules}>
            <For each='module' index='index' of={info.type_modules}>
              <Choose>
                <When condition={module.module === 'recipient'}>
                  <Recipient
                    recipient={{
                      name: info.recipient.name,
                      seat: info.recipient.seat
                    }}
                    fieldName={module.field_name}
                  />
                </When>
                <When condition={module.module === 'recipient_chief'}>
                  <Recipient
                    recipient={{
                      name: info.recipient_chief.name,
                      seat: info.recipient_chief.seat
                    }}
                    fieldName={module.field_name}
                  />
                </When>
                <When condition={module.module === 'text'}>
                  <Text text={info.text ? info.text[index] : '...'} fieldName={module.field_name} />
                </When>
                <When condition={module.module === 'day'}>
                  <Day day={info.day} fieldName={module.field_name} />
                </When>
                <When condition={module.module === 'gate'}>
                  <Gate gate={info.gate} fieldName={module.field_name} />
                </When>
                <When condition={module.module === 'carry_out_items'}>
                  <CarryOut carryOutItems={info.carry_out_items} fieldName={module.field_name} />
                </When>
                <When condition={module.module === 'files'}>
                  <Files files={info.old_files} fieldName={module.field_name} is_editable={module.is_editable} />
                </When>
                <When condition={module.module === 'approval_list'}>
                  <Approvals approvals={info.approval_list} />
                </When>
              </Choose>
            </For>
          </If>

          <If condition={info.approvals}>
            <Approvals approvals={info.approvals} />
          </If>

          {/*Резолюції керівника (показуються, якщо документ чекає позначку "Виконано")*/}
          <If condition={this.props.doc.expected_mark === 11}>
            <Resolutions path={info.path} />
          </If>
        </div>
      );
    } else {
      return <div>xz</div>;
    }
  }
}

export default Info;
