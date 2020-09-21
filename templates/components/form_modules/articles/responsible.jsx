'use strict';
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import './checkbox.css';

class Responsible extends React.Component {
  changeDone = () => {
    let {responsible, index} = this.props;
    responsible.done = !responsible.done;
    responsible.status = 'change';

    this.props.onChange(responsible, index);
  };

  render() {
    const {article_index, index, disabled, onDelete} = this.props;
    const {id, emp_seat, done, user_is_responsible, status} = this.props.responsible;

    return (
      <If condition={status !== 'delete'}>
        <div key={id} className='css_list_item' style={{background: done ? 'lightGreen' : ''}}>
          <input
            className='css_checkbox'
            type='checkbox'
            // id={'done' + index}
            id={`done_${article_index}_${index}`}
            checked={done}
            onChange={() => this.changeDone()}
            disabled={disabled && !user_is_responsible}
          />
          <label htmlFor={`done_${article_index}_${index}`} /> {/* Елемент необхідний для правильної роботи CSS оформлення чекбоксу*/}
          <div className='font-weight-bold'>{emp_seat}</div>
          <button className='btn btn-sm btn-outline-secondary font-weight-bold ml-auto' onClick={() => onDelete(index)} disabled={disabled}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </If>
    );
  }

  static defaultProps = {
    responsible: {id: 0, emp_seat: '', done: false, status: 'old'},
    article_index: 0,
    index: 0,
    status: 'old',
    changeResponsible: () => {},
    onDelete: () => {},
    disabled: true
  };
}

export default Responsible;
