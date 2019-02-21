'use strict';
import React from 'react';
import Form from "react-validation/build/form";
import Textarea from "react-validation/build/textarea";
import {required} from "../../_else/validations";
import Button from "react-validation/build/button";
import Input from "react-validation/build/input";
import axios from "axios";
import querystring from "querystring";
import Modal from "react-awesome-modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";

class FreeTime extends React.Component {
  // рендерить форму нового наказу

  state = {
    open: true,
    date: '',
    text: '',
  };

  onChange = (event) => {
    this.setState({[event.target.name]:event.target.value});
  };

  newFreeTime = (e) => {
    e.preventDefault();

    axios({
      method: 'post',
      url: '',
      data: querystring.stringify({
        document_type: 1,
        free_day: this.state.date,
        text: this.state.text,
        employee_seat: localStorage.getItem('my_seat'),
        is_draft: e.target.id === 'draft'
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }).then((response) => {
      const today = new Date();
      if (e.target.id === 'draft') {
        this.props.addDoc(response.data, 'Звільнююча перепустка', today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear(), 1);
      }
    })
      .catch(function (error) {
        console.log('errorpost: ' + error);
    });

    this.props.onCloseModal();
  };

  onCloseModal = (e) => {
    e.preventDefault();
    // Передаємо вверх інфу, що модальне вікно закрите
    this.props.onCloseModal();
    this.setState({
      open: false,
    });
  };

  render() {
    return <Modal visible={this.state.open} width='45%' effect="fadeInUp">
      <div className='css_modal_scroll'>
        <Form onSubmit={this.newFreeTime}>
          <div className="modal-body">
            <div className='d-flex justify-content-between'>
              <h4 className="modal-title">Нова звільнююча</h4>
              <button className="btn btn-link" onClick={this.onCloseModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
              <br/>
              <label>День дії звільнюючої:
                <Input className='form-control' type="date" value={this.state.date} name="date" onChange={this.onChange} validations={[required]}/>
              </label> <br />
              <label className="full_width">Куди, з якою метою звільнюєтесь:
                <Textarea className="form-control full_width" value={this.state.text} name='text' onChange={this.onChange} maxLength={4000} validations={[required]}/>
              </label> <br />
          </div>
          <div className="modal-footer">
            <button className="float-sm-left btn btn-sm btn-outline-info mb-1" id='draft' onClick={this.newFreeTime}>Зберегти як чернетку</button>
            <Button className="float-sm-left btn btn-outline-success mb-1" id='post'>Підтвердити</Button>
          </div>
        </Form>
      </div>
    </Modal>
  }
}

export default FreeTime;