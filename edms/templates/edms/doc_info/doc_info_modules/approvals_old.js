"use strict";
import React from "react";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class Approvals extends React.Component {
  // отримує інформацію про документ в масиві doc та створює відповідні кнопки для doc_info
  
  getCheckedStyle = (approved) => {
    let checkedStyle = 'align-self-center';
    if (approved === true) {
      checkedStyle = checkedStyle + ' text-success';
    }
    else if (approved === false) {
      checkedStyle = checkedStyle + ' text-danger';
    }
    return checkedStyle;
  };

  render() {
    const { approvals } = this.props;
    console.log(approvals[0]);

    return (
      <div className="mt-2">
        На погодженні:
        <For each="approval" index="idx" of={approvals}>
          <div key={approval.emp_seat_id} className='d-flex'>
            <div className={this.getCheckedStyle(approval.approved)}>
              <Choose>
                <When condition={approval.approved === true}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                </When>
                <When condition={approval.approved === false}>
                  <FontAwesomeIcon icon={faTimesCircle} />
                </When>
                <Otherwise>
                  <FontAwesomeIcon icon={faCircle} />
                </Otherwise>
              </Choose>
            </div>
            <div className='flex-grow-1 ml-1'>{approval.emp_seat}</div>
          </div>
        </For>
      </div>
    );
  }

  static defaultProps = {
    approvals: []
  };
}

export default Approvals;
