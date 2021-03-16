'use strict';
import * as React from 'react';
import {faCircle, faCheckCircle, faTimesCircle} from '@fortawesome/free-regular-svg-icons';
import {faCheckDouble} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

class Approvals extends React.Component {
  // отримує інформацію про документ в масиві doc та створює відповідні кнопки для doc_info

  getCheckedStyle = (approved) => {
    let checkedStyle = 'align-self-center';
    if (approved === true) {
      checkedStyle = checkedStyle + ' text-success';
    } else if (approved === false) {
      checkedStyle = checkedStyle + ' text-danger';
    }
    return checkedStyle;
  };

  render() {
    const {approvals} = this.props;

    return (
      <div className='mt-2'>
        Таблиця візування:
        <table className='table table-bordered mt-2'>
          <thead>
            <tr>
              <th className='text-center'><FontAwesomeIcon icon={faCheckDouble} /></th>
              <th>ПІБ, посада</th>
              <th>Коментар</th>
              <th className='text-center'>Дата</th>
            </tr>
          </thead>
          <tbody>
            <For each='approval' index='idx' of={approvals}>
              <tr key={idx}>
                <td className='align-middle text-center'>
                  <div className={this.getCheckedStyle(approval.approved)}>
                    <Choose>
                      <When condition={approval.approved === true}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </When>
                      {/*<When condition={approval.approved === false}>*/}
                        {/*<FontAwesomeIcon icon={faTimesCircle} />*/}
                      {/*</When>*/}
                      <Otherwise>
                        <FontAwesomeIcon icon={faCircle} />
                      </Otherwise>
                    </Choose>
                  </div>
                </td>
                <td className='align-middle'><small>{approval.emp_seat}</small></td>
                <td className='align-middle'><small>{approval.comment}</small></td>
                <td className='align-middle text-center'><small>{approval.approved_date}</small></td>
              </tr>
            </For>
          </tbody>
        </table>
      </div>
    );
  }

  static defaultProps = {
    approvals: []
  };
}

export default Approvals;
