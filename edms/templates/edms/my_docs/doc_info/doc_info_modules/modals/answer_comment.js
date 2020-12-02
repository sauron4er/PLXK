'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {view, store} from '@risingstack/react-easy-state';
import docInfoStore from '../doc_info_store';

class AnswerComment extends React.Component {
  state = {
    comment: ''
  };

  onChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };

  onClick = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.state.comment);
  };

  render() {
  
    const {onCloseModal} = this.props;
    const {comment} = this.state;
    return (
      <>
        <div className='modal-header d-flex justify-content-between'>
          <h5 className='modal-title font-weight-bold'>
            Введіть текст відповіді
          </h5>
          <button className='btn btn-link' onClick={onCloseModal}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className='modal-body'>
          <blockquote>
            <div className='font-italic'>{docInfoStore.comment_to_answer.author}</div>
            <div>{docInfoStore.comment_to_answer.text}</div>
          </blockquote>
          <label htmlFor='comment_modal'>Текст відповіді:</label>
          <textarea
            name='comment'
            className='form-control'
            rows='3'
            id='comment_modal'
            onChange={this.onChange}
            value={comment}
          />
        </div>
        <div className='modal-footer'>
          <button className='btn btn-outline-success' onClick={this.onClick}>
            Відправити
          </button>
        </div>
      </>
    );
  }

  static defaultProps = {
    originalComment: '',
    onCloseModal: {},
    onSubmit: {}
  };
}

export default view(AnswerComment);
