'use strict';
import * as React from 'react';
import {faCheckDouble} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Approval from 'edms/templates/edms/my_docs/doc_info/doc_info_modules/approvals/approval';
import SubmitButton from 'templates/components/form_modules/submit_button';

class Approvals extends React.Component {
  addApproval = () => {
    console.log(1);
  };

  render() {
    const {approvals, changeable} = this.props;

    return (
      <div className='mt-2'>
        Таблиця візування:
        <table className='table table-bordered mt-2 bg-white'>
          <thead>
            <tr>
              <th className='text-center'>
                <FontAwesomeIcon icon={faCheckDouble} />
              </th>
              <th>П.І.Б., посада</th>
              <th>Коментар</th>
              <th className='text-center'>Дата</th>
              <If condition={changeable}>
                <th> </th>
              </If>
            </tr>
          </thead>
          <tbody>
            <For each='approval' index='idx' of={approvals}>
              <Approval key={idx} approval={approval} changeable={changeable} />
            </For>
          </tbody>
        </table>
        <If condition={changeable}>
          <SubmitButton className='btn-sm btn-outline-info my-0' text='Додати візуючого' onClick={this.addApproval} />
        </If>
      </div>
    );
  }

  static defaultProps = {
    approvals: [],
    changeable: false
  };
}

export default Approvals;
