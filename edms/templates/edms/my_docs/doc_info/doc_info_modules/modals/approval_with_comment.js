'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';

class ApprovalWithComment extends React.Component {

  onChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };

  onClick = (mark) => {
    this.props.onSubmit(mark)
  };

  render() {
    const {onCloseModal} = this.props;
    return (
      <>
        <div className='modal-header d-flex justify-content-between p-0'>
          <button className='btn btn-link ml-auto' onClick={onCloseModal}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className='modal-body'>
          <div>Ми помітили, що ви додали коментар до позначки "Віза".
            Скоріш за все, це означає, що у вас є побажання щодо змін у змісті Договору.
            Будь ласка, змініть в такому разі тип вашої позначки на "Запит на зміни",
            що унеможливить ігнорування автором вашого коментарю і надходження Договору
            без запропонованих вами змін до генерального директора.</div>
        </div>
        <div className='modal-footer'>
          <button className='btn btn-info' onClick={() => this.props.onSubmit(3)}>
            Змінити позначку на "Запит на зміни"
          </button>
          <button className='btn btn-sm btn-outline-dark ml-auto' onClick={() => this.props.onSubmit(17)}>
            Я наполягаю на позначці "Віза"
          </button>
        </div>
      </>
    );
  }

  static defaultProps = {
    onCloseModal: {},
    onSubmit: {}
  };
}

export default ApprovalWithComment;
