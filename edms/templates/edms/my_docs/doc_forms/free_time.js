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
  state = {
    open: true,
    date: '',
    text: '',
    render_ready: this.props.docId === 0, // якщо ід док. = 0, то це не чернетка, і можна рендерити відразу
  };
  
  onChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };
  
  // отримуємо з бд інфу про документ, якщо це чернетка
  componentDidMount() {
    if (this.props.docId !== 0) {
      axios({
        method: 'get',
        url: 'get_doc/' + this.props.docId + '/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }).then((response) => {
        this.setState({
          date: response.data.date,
          text: response.data.text,
          render_ready: true,
        });
      }).catch((error) => {
        console.log('errorpost: ' + error);
      });
    }
  }
  
  newFreeTime = (e, type) => {
    e.preventDefault();
    
    axios({
      method: 'post',
      url: '',
      data: querystring.stringify({
        document_type: 1,
        old_draft_id: this.props.docId,
        free_day: this.state.date,
        text: this.state.text,
        employee_seat: localStorage.getItem('my_seat'),
        is_draft: type === 'draft'
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }).then((response) => {
      const today = new Date();
      type === 'post'
        ?
        this.props.addDoc(response.data, 'Звільнююча перепустка', today.getDate() + '.' + (today.getMonth()+1) + '.' + today.getFullYear(), 1)
        :
        this.props.addDraft(response.data, 'Звільнююча перепустка', today.getDate() + '.' + (today.getMonth()+1) + '.' + today.getFullYear(), 1);
      
        if (this.props.docId !== 0) {
          this.props.delDraft(this.props.docId)
        }
    }).catch((error) => {
      console.log('error: ' + error);
    });
    this.props.onCloseModal();
  };
  
  // видаляє чернетку з бд
  delDraft = (e) => {
    e.preventDefault();
    
    axios({
      method: 'post',
      url: 'del_draft/' +this.props.docId + '/',
      data: querystring.stringify({}),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }).then((response) => {
      this.props.delDraft(this.props.docId)
    }).catch(function (error) {
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
      <If condition={this.state.render_ready}>
        <div className='css_modal_scroll'>
          <Form onSubmit={e => this.newFreeTime(e, 'post')}>
            <div className="modal-body">
              <div className='d-flex justify-content-between'>
                <h4 className="modal-title">Нова звільнююча</h4>
                <button className="btn btn-link" onClick={this.onCloseModal}>
                  <FontAwesomeIcon icon={faTimes}/>
                </button>
              </div>
              <br/>
              <label>День дії звільнюючої:
                <Input className='form-control' type="date" value={this.state.date} name="date" onChange={this.onChange}
                       validations={[required]}/>
              </label> <br/>
              <label className="full_width">Куди, з якою метою звільнюєтесь:
                <Textarea className="form-control full_width" value={this.state.text} name='text'
                          onChange={this.onChange} maxLength={4000} validations={[required]}/>
              </label> <br/>
            </div>
            <div className="modal-footer">
              <If condition={this.props.docId !== 0}>
                <button className="float-sm-left btn btn-sm btn-outline-danger mb-1"
                        onClick={this.delDraft}>Видалити чернетку
                </button>
              </If>
              <button className="float-sm-left btn btn-sm btn-outline-info mb-1"
                      onClick={e => this.newFreeTime(e, 'draft')}>Зберегти як чернетку
              </button>
              <Button className="float-sm-left btn btn-outline-success mb-1">Підтвердити</Button>
            </div>
          </Form>
        </div>
      </If>
    </Modal>
  }
  
  static defaultProps = {
    docId: 0,
  }
}

export default FreeTime;