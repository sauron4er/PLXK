'use strict';
import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import '../_else/my_styles.css';
import NewDoc from './new_doc';
import Docs from './docs';
import Drafts from './drafts';
import SeatChooser from '../components/seat_chooser';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class MyDocs extends React.Component {
  state = {
    direct_subs: '',
    my_docs: '', // Документи, створені користувачем
    work_docs: '', // Документи, що чекають на реакцію користувача
    draft_view: false, // true - покаже список чернеток, сховає документи
    open_doc_id: 0
  };

  getDirectSubs = (seat_id) => {
    axios({
      method: 'get',
      url: 'get_direct_subs/' + seat_id + '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        // Передаємо список у state, якщо він є
        if (response.data) {
          this.setState({
            direct_subs: response.data
          });
        }
      })
      .catch((error) => {
        console.log('errorpost: ' + error);
      });
  };

  // Оновлює списки документів
  updateLists = (seat_id) => {
    this.state.my_docs = [];
    window.my_docs.map((doc) => {
      if (doc.author_seat_id === seat_id) {
        // сортування по посаді
        this.setState((prevState) => ({
          my_docs: [...prevState.my_docs, doc]
        }));
      }
    });

    this.state.work_docs = [];
    window.work_docs.map((doc) => {
      if (doc.emp_seat_id === seat_id) {
        // сортування по посаді
        this.setState((prevState) => ({
          work_docs: [...prevState.work_docs, doc]
        }));
      }
    });
  };

  // шукає обрану посаду або обирає першу зі списку і показує відповідні їй документи, керівники, підлеглі
  componentDidMount() {
    const seat_id = parseInt(
      localStorage.getItem('my_seat') ? localStorage.getItem('my_seat') : window.my_seats[0].id
    );
    this.getDirectSubs(seat_id);
    this.updateLists(seat_id);

    // Визначаємо, чи відкриваємо просто список документів, чи це посилання на конкретний документ:
    const arr = window.location.href.split('/');
    const last_href_piece = parseInt(arr[arr.length - 1]);
    const is_link = !isNaN(last_href_piece);
    if (is_link) {
      this.setState({
        open_doc_id: last_href_piece
      });
    }
  }

  // Показ чернеток або документів
  onReturnClick = (e) => {
    e.preventDefault();
    this.setState((prevState) => ({
      draft_view: !prevState.draft_view
    }));
  };

  // отримує нову посаду з компоненту SeatChooser і відповідно змінює списки
  onSeatChange = (new_seat_id) => {
    this.getDirectSubs(new_seat_id);
    this.updateLists(new_seat_id);
  };

  // Додає новий документ, створений у компоненті NewDoc, у список
  addDoc = (id, type, date, type_id) => {
    const new_doc = {
      author_seat_id: parseInt(localStorage.getItem('my_seat')),
      date: date,
      emp_seat_id: parseInt(localStorage.getItem('my_seat')),
      id: id,
      type: type,
      type_id: type_id
    };

    this.setState((prevState) => ({
      my_docs: [...prevState.my_docs, new_doc]
    }));

    window.my_docs.push(new_doc);
  };

  // Видаляє документ зі списку створених користувачем
  removeMyDoc = (id, author_id) => {
    // якщо автор я, видаляємо документ зі списку створених:
    if (author_id === parseInt(localStorage.getItem('my_seat'))) {
      this.setState((prevState) => ({
        my_docs: prevState.my_docs.filter((doc) => doc.id !== id)
      }));
      window.my_docs = window.my_docs.filter((doc) => doc.id !== id);
    }
    
    // В будь-якому разі видаляємо документ зі списку отриманих
    this.setState((prevState) => ({
      work_docs: prevState.work_docs.filter((doc) => doc.id !== id)
    }));
    window.work_docs = window.work_docs.filter((doc) => doc.id !== id);
  };
  
  // Видаляє документ зі списку отриманих документів
  
  removeWorkDoc = (id, author_id) => {
    // якщо автор я, видаляємо документ зі списку створених:
    if (author_id === parseInt(localStorage.getItem('my_seat'))) {
      this.setState((prevState) => ({
        my_docs: prevState.my_docs.filter((doc) => doc.id !== id)
      }));
      window.my_docs = window.my_docs.filter((doc) => doc.id !== id);
    }
    
    // В будь-якому разі видаляємо документ зі списку отриманих
    this.setState((prevState) => ({
      work_docs: prevState.work_docs.filter((doc) => doc.id !== id)
    }));
    window.work_docs = window.work_docs.filter((doc) => doc.id !== id);
  };

  render() {
    return (
      <Fragment>
        <Choose>
          <When condition={!this.state.draft_view}>
            <div className='d-flex justify-content-between'>
              <div className='d-flex'>
                <NewDoc addDoc={this.addDoc} />
                <button type='button' className='btn btn-link pb-2' onClick={this.onReturnClick}>
                  Чернетки
                </button>
              </div>
              <SeatChooser onSeatChange={this.onSeatChange} />
            </div>
            <Docs
              my_seat_id={this.state.seat_id}
              my_docs={this.state.my_docs}
              work_docs={this.state.work_docs}
              acting_docs={this.state.acting_docs}
              removeDoc={this.removeDoc}
              directSubs={this.state.direct_subs}
              openDocId={this.state.open_doc_id}
            />
          </When>
          <Otherwise>
            <div className='d-flex justify-content-between'>
              <button type='button' className='btn btn-link pb-2' onClick={this.onReturnClick}>
                Назад
              </button>
              <SeatChooser onSeatChange={this.onSeatChange} />
            </div>
            <Drafts addDoc={this.addDoc} />
          </Otherwise>
        </Choose>
      </Fragment>
    );
  }
}

ReactDOM.render(<MyDocs />, document.getElementById('my_docs'));
