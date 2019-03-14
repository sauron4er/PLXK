'use strict';
import React from 'react'
import Modal from "react-awesome-modal"
import 'react-drag-list/assets/index.css'
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Form from "../doc_forms/free_time";
import { required } from "../../_else/validations";
import querystring from "querystring"; // спливаючі повідомлення:

class NewDocument extends React.Component {

  state = {
    open: true,
    render_ready: false,
  };
  
  // Спливаюче повідомлення
  notify = (message) => toast.error( message,
    {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }
  );
  
  newDocument = (e, type) => {
    e.preventDefault();
    
    // axios({
    //   method: 'post',
    //   url: '',
    //   data: querystring.stringify({
    //     document_type: 1,
    //     old_draft_id: this.props.docId,
    //     free_day: this.state.date,
    //     text: this.state.text,
    //     employee_seat: localStorage.getItem('my_seat'),
    //     is_draft: type === 'draft'
    //   }),
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   },
    // }).then((response) => {
    //   const today = new Date();
    //   type === 'post'
    //     ?
    //     this.props.addDoc(response.data, 'Звільнююча перепустка', today.getDate() + '.' + (today.getMonth()+1) + '.' + today.getFullYear(), 1)
    //     :
    //     this.props.addDraft(response.data, 'Звільнююча перепустка', today.getDate() + '.' + (today.getMonth()+1) + '.' + today.getFullYear(), 1);
    //
    //     if (this.props.docId !== 0) {
    //       this.props.delDraft(this.props.docId)
    //     }
    // }).catch((error) => {
    //   console.log('error: ' + error);
    // });
    this.props.onCloseModal();
  };

  onCloseModal = (e) => {
    e.preventDefault();
    this.setState({
      open: false,
    });
    // Передаємо вверх інфу, що модальне вікно закрите
    this.props.onCloseModal();
  };

  render() {
    return <Modal visible={this.state.open} width='45%' effect="fadeInUp" >
      <If condition={this.state.render_ready}>
        <div className='css_modal_scroll'>
          <Form onSubmit={e => this.newDocument(e, 'post')}>
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
                      onClick={e => this.newDocument(e, 'draft')}>Зберегти як чернетку
              </button>
              <Button className="float-sm-left btn btn-outline-success mb-1">Підтвердити</Button>
            </div>
          </Form>
        </div>
      </If>
      {/*Вспливаюче повідомлення*/}
      <ToastContainer />
    </Modal>
  }
  
  static defaultProps = {
    docType: 0,
  }
}

export default NewDocument;