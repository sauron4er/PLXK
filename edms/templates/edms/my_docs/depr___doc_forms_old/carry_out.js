'use strict';
import React from 'react';
import Form from "react-validation/build/form";
import Textarea from "react-validation/build/textarea";
import {required} from "../../_else/validations";
import Button from "react-validation/build/button";
import Input from "react-validation/build/input";
import axios from "axios";
import querystring from "querystring";
import DxTable from "../../components/dx_table";
import Modal from "react-awesome-modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";

class CarryOut extends React.Component {
  state = {
    open: true,
    date: '',
    text: '',
    checkedGate: '1',
    carry_out_items: [{id: 1, item_name: '', quantity: '', measurement: '' }],
    carry_out_columns: [
      { name: 'id', title: '№' },
      { name: 'item_name', title: 'Найменування' },
      { name: 'quantity', title: 'К-сть' },
      { name: 'measurement', title: 'Од. виміру' },
    ],
    carry_out_col_width: [
      { columnName: 'id', width: 55 },
      { columnName: 'item_name'},
      { columnName: 'quantity', width: 70 },
      { columnName: 'measurement', width: 80 },
    ],
    render_ready: this.props.docId === 0, // якщо ід док. = 0, то це не чернетка, і можна рендерити відразу
  };

  onChange = (event) => {
    if (event.target.name === 'gate_radio') { // беремо ід посади із <select>
      this.setState({checkedGate: event.target.value});
    }
    else {
      this.setState({[event.target.name]:event.target.value});
    }
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
          checkedGate: response.data.gate.toString(),
          text: response.data.text,
          carry_out_items: response.data.carry_out_items,
          render_ready: true,
        });
      }).catch((error) => {
        console.log('errorpost: ' + error);
      });
    }
  }

  // Отримує з таблиці новий список матеріалів
  getCarryOutItems = (carry_out_items) => {
    this.setState({
      carry_out_items: carry_out_items,
    })
  };

  // Додає новий матеріальний пропуск
  newCarryOut = (e, type) => {
    e.preventDefault();
    
    if (this.state.carry_out_items.length > 0) {
      axios({
        method: 'post',
        url: '',
        data: querystring.stringify({
          document_type: 2,
          old_draft_id: this.props.docId,
          carry_out_day: this.state.date,
          text: this.state.text,
          gate: this.state.checkedGate,
          carry_out_items: JSON.stringify(this.state.carry_out_items),
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
        this.props.addDoc(response.data, 'Матеріальний пропуск', today.getDate() + '.' + (today.getMonth()+1) + '.' + today.getFullYear(), 2)
        :
        this.props.addDraft(response.data, 'Матеріальний пропуск', today.getDate() + '.' + (today.getMonth()+1) + '.' + today.getFullYear(), 2);
        
        if (this.props.docId !== 0) {
          this.props.delDraft(this.props.docId)
        }
        this.props.onCloseModal();
      }).catch(function (error) {
          console.log('errorpost: ' + error);
      });
      
    }
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
      <If  condition={this.state.render_ready}>
        <div className='css_modal_scroll'>
          <Form onSubmit={e => this.newCarryOut(e, 'post')}>
            <div className='modal-header d-flex justify-content-between'>
              <h4 className="modal-title">Новий матеріальний пропуск</h4>
              <button className="btn btn-link" onClick={this.onCloseModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="modal-body">
              <br/>
              <label>День виносу:
                <Input className='form-control' type="date" value={this.state.date} name="date" onChange={this.onChange} validations={[required]}/>
              </label> <br />
  
              <label className='mr-1'>Прохідна №:</label>
              <input type="radio" name="gate_radio" value='1' onChange={this.onChange} checked={this.state.checkedGate==='1'} /><label className="radio-inline mx-1"> 1</label>
              <input type="radio" name="gate_radio" value='2' onChange={this.onChange} checked={this.state.checkedGate==='2'} /><label className="radio-inline mx-1"> 2</label>
  
              <label className="full_width">Мета виносу:
                <Textarea className="form-control full_width" value={this.state.text} name='text' onChange={this.onChange} maxLength={4000} validations={[required]}/>
              </label> <br />
  
              <label>Список матеріальних цінностей:</label>
                <DxTable
                  rows={this.state.carry_out_items}
                  columns={this.state.carry_out_columns}
                  colWidth={this.state.carry_out_col_width}
                  edit
                  getData={this.getCarryOutItems}
                  paging
                />
            </div>
            
            <div className="modal-footer">
              <If condition={this.props.docId !== 0}>
                <button className="float-sm-left btn btn-sm btn-outline-danger mb-1"
                      onClick={this.delDraft}>Видалити чернетку
                </button>
              </If>
              <button className="float-sm-left btn btn-sm btn-outline-info mb-1"
                      onClick={e => this.newCarryOut(e, 'draft')}>Зберегти як чернетку
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

export default CarryOut;