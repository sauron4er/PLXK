'use strict';
import React from 'react';
import Form from "react-validation/build/form";
import Textarea from "react-validation/build/textarea";
import {required, required_not_0} from "../../_else/validations";
import {FileUploader} from "devextreme-react";
import Button from "react-validation/build/button";
import axios from "axios";
import Select from "react-validation/build/select";
import Modal from "react-awesome-modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {delDraft} from '../../_else/my_extras'

class WorkNote extends React.Component {
  state = {
    open: true,
    date: '',
    text: '',
    files: [],
    chief_recipient_id: '',
    chief_recipient: '',
    chiefs: [],
    render_ready: this.props.docId === 0, // якщо ід док. = 0, то це не чернетка, і можна рендерити відразу
  };

  onChange = (event) => {
      if (event.target.name === 'chief_recipient') { // беремо ід посади із <select>
          const selectedIndex = event.target.options.selectedIndex;
          this.setState({
              chief_recipient_id: event.target.options[selectedIndex].getAttribute('data-key'),
              chief_recipient: event.target.options[selectedIndex].getAttribute('value'),
          });
      }
      else {
           this.setState({[event.target.name]:event.target.value});
      }
  };
  
  // отримуємо з бд список шефів
  // отримуємо інфу про документ, якщо це чернетка
  componentDidMount() {
    axios({
      method: 'get',
      url: 'get_chiefs/' + localStorage.getItem('my_seat') + '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }).then((response) => {
      // Передаємо список у state, якщо він є
      if (response.data) {
        this.setState({
          chiefs: response.data
        })
      }
    }).catch((error) => {
      console.log('errorpost: ' + error);
    });
    
    if (this.props.docId !== 0) {
      axios({
        method: 'get',
        url: 'get_doc/' + this.props.docId + '/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }).then((response) => {
        this.setState({
          chief_recipient: response.data.recipient,
          chief_recipient_id: response.data.recipient_id,
          text: response.data.text,
          render_ready: true,
        });
      }).catch((error) => {
        console.log('errorpost: ' + error);
      });
    }
  }

  newWorkNote = (e, type) => {
    e.preventDefault();
    let formData = new FormData();
    if (this.state.files.length > 0) {
      this.state.files.map(file => {
        formData.append("file", file);
      });
    }
    formData.append('document_type', '3');
    formData.append('old_draft_id', this.props.docId);
    formData.append('recipient', this.state.chief_recipient_id);
    formData.append('text', this.state.text);
    formData.append('employee_seat', localStorage.getItem('my_seat'));
    formData.append('is_draft', type === 'draft');

    axios({
      method: 'post',
      url: '',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    }).then((response) => {
      const today = new Date();
      type === 'post'
        ?
        this.props.addDoc(response.data, 'Службова записка', today.getDate() + '.' + (today.getMonth()+1) + '.' + today.getFullYear(), 3)
        :
        this.props.addDraft(response.data, 'Службова записка', today.getDate() + '.' + (today.getMonth()+1) + '.' + today.getFullYear(), 3);
      
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
    delDraft(this.props.docId);
    this.props.delDraft(this.props.docId);
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
      <If condition={this.state.chiefs.length > 0 && this.state.render_ready}>
        <div className='css_modal_scroll'>
          <Form onSubmit={e => this.newWorkNote(e, 'post')}>
            <div className="modal-body">
              <div className='d-flex justify-content-between'>
                <h4 className="modal-title">Нова службова записка</h4>
                <button className="btn btn-link" onClick={this.onCloseModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div><br/>
              
                <label>Кому:
                  {/*Список безпосередніх начальників для вибору, кому адресовується службова записка*/}
                  <Select id='to_chief_select' name='chief_recipient' className="form-control full_width" value={this.state.chief_recipient} onChange={this.onChange} validations={[required_not_0]}>
                    <option data-key={0} value='0'>------------</option>
                    {
                      this.state.chiefs.map(chief => {
                        return <option key={chief.id} data-key={chief.id}
                          value={chief.name}>{chief.name + ', ' + chief.seat}</option>;
                      })
                    }
                  </Select>
                </label> <br />
  
                <label className="full_width">Зміст:
                  <Textarea className="form-control full_width" value={this.state.text} name='text' onChange={this.onChange} maxLength={4000} validations={[required]}/>
                </label> <br />
  
                <label className="full_width">Додати файл:
                  <FileUploader
                    onValueChanged={(e) => this.setState({files: e.value})}
                    uploadMode='useForm'
                    multiple={true}
                    allowCanceling={true}
                    selectButtonText='Оберіть файл'
                    labelText='або перетягніть файл сюди'
                    readyToUploadMessage='Готово'
                  />
                </label>
            </div>
            <div className="modal-footer">
              <If condition={this.props.docId !== 0}>
                <button className="float-sm-left btn btn-sm btn-outline-danger mb-1"
                        onClick={this.delDraft}>Видалити чернетку
                </button>
              </If>
              <button className="float-sm-left btn btn-sm btn-outline-info mb-1"
                      onClick={e => this.newWorkNote(e, 'draft')}>Зберегти як чернетку</button>
              <Button className="float-sm-left btn btn-outline-success mb-1">Підтвердити</Button>
            </div>
          </Form>
        </div>
      </If>
    </Modal>
  }
  
  static defaultProps = {
    docId: 0,
    addDraft: {}
  }
}

export default WorkNote;