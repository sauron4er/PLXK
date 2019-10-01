'use strict';
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';

class RefusalComment extends React.Component {
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
            Можливо, ви хочете пояснити своє рішення?
          </h5>
          <button className='btn btn-link' onClick={onCloseModal}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className='modal-body'>
          <label htmlFor='comment_modal'>Текст коментарю:</label>
          <textarea
            name='comment'
            className='form-control'
            rows='3'
            id='comment_modal'
            onChange={this.onChange}
            value={comment}
            placeholder='Можна залишити пустим'
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
    onCloseModal: {},
    onSubmit: {}
  };
}

export default RefusalComment;
