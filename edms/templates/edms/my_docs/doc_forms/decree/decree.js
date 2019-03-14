'use strict';
import React from 'react'
import Form from "react-validation/build/form"
import Textarea from "react-validation/build/textarea"
import {required} from "../../../_else/validations"
import {FileUploader} from "devextreme-react"
import Button from "react-validation/build/button"
import Modal from "react-awesome-modal"
import 'react-drag-list/assets/index.css'
import DecreeArticles from "./decree_articles";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import {uniqueArray} from '../../../_else/my_extras';
import { ToastContainer, toast } from 'react-toastify'; // спливаючі повідомлення:

class Decree extends React.Component {
  constructor(props) {
      super(props);
      this.ArticlesRef = React.createRef();
  }

  state = {
    open: true,
    seat_list: [],
    
    name: '',
    preamble: '',
    approval_seats: [],
    articles: [],
    files: [],
    
    select_approval_seat_id: '',
    select_approval_seat: '',
    
    render_ready: this.props.docId === 0, // якщо ід док. = 0, то це не чернетка, і можна рендерити відразу
  };

  onChange = (event) => {
    if (event.target.name === 'select_approval_seat') { // беремо ід керівника із <select>
          const selectedIndex = event.target.options.selectedIndex;
          this.setState({
              select_approval_seat_id: event.target.options[selectedIndex].getAttribute('data-key'),
              select_approval_seat: event.target.options[selectedIndex].getAttribute('value'),
          });
      }
    else {
      this.setState({[event.target.name]:event.target.value});
    }
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
  
  // отримуємо з бд список посад для селекту "На погодження",
  // отримуємо інфу про документ, якщо це чернетка
  componentDidMount() {
    axios({
      method: 'get',
      url: 'get_seats/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }).then((response) => {
      this.setState({
        seat_list: response.data,
      })
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
          name: response.data.name,
          preamble: response.data.preamble,
          approval_seats: response.data.approval_seats,
          articles: response.data.articles,
          render_ready: true,
        });
      }).catch((error) => {
        console.log('errorpost: ' + error);
      });
    }
  }
  
  // додає нову посаду для погодження у список
  addNewApprovalSeat = (e) => {
    e.preventDefault();
    if (this.state.select_approval_seat !== '') {
      let approval_seats = [...this.state.approval_seats];
      approval_seats.push({id: this.state.select_approval_seat_id, seat: this.state.select_approval_seat});
      const unique_seats = uniqueArray(approval_seats);
      this.setState({
        approval_seats: unique_seats,
        select_approval_seat_id: '',
        select_approval_seat: '',
      })
    }
  };
  
  // видає посаду з списку погоджуючих
  delApprovalSeat = (e, seat_id) => {
    e.preventDefault();
    this.setState((prevState) => ({
        approval_seats: prevState.approval_seats.filter(seat => seat.id !== seat_id)
    }))
  };
  
  // перед тим, як постити наказ, додає погоджуючого у список, якщо клієнт забув це зробити сам
  // і передає управління функції postDecree
  newDecree = (e, type) => {
    e.preventDefault();
    if (this.state.select_approval_seat !== '') {
      let approval_seats = [...this.state.approval_seats];
      approval_seats.push({id: this.state.select_approval_seat_id, seat: this.state.select_approval_seat});
      const unique_seats = uniqueArray(approval_seats);
      this.setState({
        approval_seats: unique_seats,
        select_approval_seat_id: '',
        select_approval_seat: '',
      },
        () => {this.postDecree(type)}  // постимо наказ після оновлення списку погоджуючих
      )
    }
    else {
      this.postDecree(type)
    }
  };

  // відправляє новий наказ у бд
  postDecree = (type) => {
    const articles = this.ArticlesRef.current; // пункти наказу з компонента DecreeArticles
    
    // відправляємо наказ тільки якщо є хоч один пункт і хоч одна посада для погодження
    if (articles.state.articles.length === 0) {
      this.notify('Внесіть хоча б один пункт наказу.')
    }
    else if (this.state.approval_seats.length === 0) {
      this.notify('Оберіть хоча б одну посаду для погодження.')
    }
    else {
      let formData = new FormData();
      // інфа для форми нового документу:
      formData.append('document_type', '4');
      formData.append('old_draft_id', this.props.docId);
      formData.append('name', this.state.name);
      formData.append('preamble', this.state.preamble);
      formData.append('employee_seat', localStorage.getItem('my_seat'));
      formData.append('is_draft', type === 'draft');

      // пункти, погоджуючі, файли:
      // витягуємо з масиву approval_seats поле 'id', щоб не відправляти на сервер лишню інфу
      const approval_seats = [];
      this.state.approval_seats.map(seat => {
        approval_seats.push(seat.id)
      });
      
      formData.append('articles', JSON.stringify(articles.state.articles));
      formData.append('approval_seats', JSON.stringify(approval_seats));
      if (this.state.files.length > 0) {
        this.state.files.map(file => {
          formData.append("file", file);
        });
      }

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
        this.props.addDoc(response.data, 'Наказ', today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear(), 4)
        :
        this.props.addDraft(response.data, 'Наказ', today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear(), 4);
        
        if (this.props.docId !== 0) {
          this.props.delDraft(this.props.docId)
        }
        this.setState({
          open: false,
        });
        this.props.onCloseModal();
      }).catch((error) => {
        console.log(error.response.data);
        this.notify('Помилка на сервері. Повідомте адміністратора.');
      });
    }
  };

  onCloseModal = (e) => {
    e.preventDefault();
    // Передаємо вверх інфу, що модальне вікно закрите
    this.setState({
      open: false,
    });
    this.props.onCloseModal();
  };

  render() {
    return <Modal visible={this.state.open} width='45%' effect="fadeInUp" >
      <If  condition={this.state.seat_list.length > 0 && this.state.render_ready}>
        <div className='css_modal_scroll'>
          <Form onSubmit={e => this.newDecree(e, 'post')}>
            <div className="modal-body">
              <div className='d-flex justify-content-between'>
                <h4 className="modal-title">Новий проект наказу</h4>
                <button className="btn btn-link" onClick={this.onCloseModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <br/>
              <label className="full_width">Назва:
                <Textarea className="form-control full_width" value={this.state.name} name='name'
                          onChange={this.onChange} maxLength={4000} validations={[required]}/>
              </label> <br />
              <label className="full_width">Преамбула:
                <Textarea className="form-control full_width" value={this.state.preamble} name='preamble'
                          onChange={this.onChange} maxLength={4000} validations={[required]}/>
              </label> <br />
  
              <DecreeArticles ref={this.ArticlesRef} articles={this.state.articles}/>
              
              <If condition={this.state.seat_list.length > 0}>
                <br />
                <div className='d-flex align-items-start mt-1'>
                  <label className='flex-grow-1 text-nowrap mr-1' htmlFor='select_approval_seat'>На погодження:</label>
                  <select className='form-control' id='select_approval_seat' name='select_approval_seat'
                          value={this.state.select_approval_seat} onChange={this.onChange}>
                    <option key={0} data-key={0} value='Не внесено'>------------</option>
                    {
                      this.state.seat_list.map(seat => {
                        return <option key={seat.id} data-key={seat.id} value={seat.seat}>{seat.seat}</option>;
                      })
                    }
                  </select>
                  <button className=" btn btn-sm btn-outline-secondary font-weight-bold ml-1" onClick={this.addNewApprovalSeat}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
                <If condition={this.state.approval_seats.length > 0}>
                  <ul className='mt-1'>
                    {
                      this.state.approval_seats.map(seat => {
                        return (
                          <div key={seat.id} className='d-flex align-items-start'>
                            <li>{seat.seat}</li>
                            <button className="btn btn-sm btn-outline-secondary font-weight-bold align-self-start ml-1"
                              onClick={(e) => this.delApprovalSeat(e, seat.id)} >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        )
                      })
                    }
                  </ul>
                </If>
                <br/>
              </If>
            
              <label className="full_width">Додати файли:
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
              <button className="float-sm-left btn btn-sm btn-outline-info mb-1"
                      onClick={e => this.newDecree(e, 'draft')}>Зберегти як чернетку
              </button>
              <Button className="float-sm-left btn btn-outline-success mb-1">
                Підтвердити
              </Button>
            </div>
          </Form>
        </div>
      </If>
      {/*Вспливаюче повідомлення*/}
      <ToastContainer />
    </Modal>
  }
  
  static defaultProps = {
    docId: 0,
  }
}

export default Decree;