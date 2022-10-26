'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import './checkbox.css';
import TextInput from 'templates/components/form_modules/text_input';
import Files from 'templates/components/form_modules/files';

class Responsible extends React.Component {
  changeDone = () => {
    let {responsible, index} = this.props;
    responsible.done = !responsible.done;
    responsible.status = 'change';

    this.props.onChange(responsible, index);
  };

  onCommentChange = (e) => {
    let {responsible, index} = this.props;
    responsible.comment = e.target.value;
    responsible.status = 'change';

    this.props.onChange(responsible, index);
  };

  onFilesChange = (e) => {
    let {responsible, index} = this.props;
    responsible.files = e.target.value;
    responsible.status = 'change';

    this.props.onChange(responsible, index);
  };

  onFilesDelete = (id) => {
    // Необхідно проводити зміни через додаткову перемінну, бо  react-easy-state не помічає змін глибоко всередині перемінних, як тут.
    let {responsible, index} = this.props;
    for (const i in responsible.files_old) {
      if (responsible.files_old[i].id === id) {
        responsible.files_old[i].status = 'delete';
        break;
      }
    }
    responsible.status = 'change';
    this.props.onChange(responsible, index);
  };

  render() {
    const {article_index, index, disabled, onDelete, constant} = this.props;
    const {id, emp_seat, done, user_is_responsible, status, comment, files_old, files} = this.props.responsible;

    return (
      <If condition={status !== 'delete'}>
        <div key={id} className={`css_list_item--order ${user_is_responsible || comment || files_old.length > 0 ? `css_list_item--order__editing` : ``}`}
             style={{background: constant === 'false' && done ? '#ddffd7' : ''}}>
          <div className='d-flex'>
            <If condition={constant === 'false'}><input
              className='css_checkbox'
              type='checkbox'
              // id={'done' + index}
              id={`done_${article_index}_${index}`}
              checked={done}
              onChange={() => this.changeDone()}
              disabled={disabled && !user_is_responsible}
            />
              <label
                htmlFor={`done_${article_index}_${index}`}/> {/* Елемент необхідний для правильної роботи CSS оформлення чекбоксу*/}
            </If>
            <div className='font-weight-bold'>{emp_seat}</div>
            <button
              className='btn btn-sm btn-outline-secondary font-weight-bold ml-auto'
              onClick={() => onDelete(index)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <If condition={user_is_responsible || comment}>
            <TextInput
              text={comment}
              fieldName={'Коментар'}
              onChange={this.onCommentChange}
              maxLength={500}
              disabled={!user_is_responsible}
            />
          </If>
          <If condition={user_is_responsible || files_old.length > 0}>
            <Files
              oldFiles={files_old}
              newFiles={files}
              fieldName={'Файли'}
              onChange={this.onFilesChange}
              onDelete={(id) => this.onFilesDelete(id)}
              disabled={!user_is_responsible}
            />
          </If>
        </div>
      </If>
    );
  }

  static defaultProps = {
    responsible: {id: 0, emp_seat: '', done: false, status: 'old', files_old: []},
    article_index: 0,
    index: 0,
    status: 'old',
    changeResponsible: () => {},
    onDelete: () => {},
    constant: 'false', //, 'true'
    disabled: true
  };
}

export default Responsible;
