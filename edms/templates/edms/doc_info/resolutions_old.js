'use strict';
import React, {Fragment} from 'react';
import axios from "axios";
import querystring from "querystring";
import { ToastContainer, toast } from 'react-toastify'; // спливаючі повідомлення:
import 'react-toastify/dist/ReactToastify.min.css';


class Resolutions extends React.Component {
  // отримує список користувачів в масиві flow, рендерить її для doc_info

  state = {
    direct_subs: [],
    resolution_text: '',
    resolutions: [],
    sub_id: '0',
    sub: '',
  };

  // коли отримує ід нового path - записує у бд резолюції
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.new_path_id !== '' && this.props.new_path_id !== prevProps.new_path_id) {
        this.postResolutions(this.props.new_path_id);
    }
  }
  
  // запит списку підлеглих для резолюцій
  componentDidMount() {
    axios({
    method: 'get',
    url: 'get_direct_subs/' + localStorage.getItem('my_seat') + '/',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    }).then((response) => {
      // Передаємо список у state, якщо він є
      if (response.data) {
        this.setState({
          direct_subs: response.data
        })
      }
    }).catch((error) => {
        console.log('errorpost: ' + error);
    });
  }

  onChange = (event) => {
    if (event.target.name === 'sub') { // беремо ід керівника із <select>
      const selectedIndex = event.target.options.selectedIndex;
      this.setState({
        sub_id: event.target.options[selectedIndex].getAttribute('data-key'),
        sub: event.target.options[selectedIndex].getAttribute('value'),
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

  // заставляє батьківський компонент запостити позначку
  onClick = (e) => {
    e.preventDefault();
    this.props.postMark(10)
  };

  // постить резолюції у бд
  postResolutions = (new_path_id) => {
    // const new_path_id = await this.props.postMark(10);
    axios({
      method: 'post',
      url: 'resolution/',
      data: querystring.stringify({
        document: this.props.doc_id,
        document_path: new_path_id,
        resolutions: JSON.stringify(this.state.resolutions),
        mark: 11,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }).then((response) => {
    }).catch((error) => {
      console.log('errorpost: ' + error);
    });
  };

  // додає резолюцію у список резолюцій
  addResolution = () => {
    if (this.state.sub_id !== '0' && this.state.resolution_text !== '') {
      const new_resolution = {
        recipient_id: this.state.sub_id,
        sub: this.state.sub,
        comment: this.state.resolution_text,
      };
      this.setState(prevState => ({
        resolutions: [...prevState.resolutions, new_resolution],
        sub_id: '0',
        sub: '',
        resolution_text: '',
      }));
    }
    else {
      this.props.notify('Оберіть адресата та введіть текст резолюції.')
    }
  };

  // видаляє резолюцію зі списку
  delResolution = (index) => {
    let resolutions = this.state.resolutions;
    resolutions.splice(index, 1);
    this.setState({resolutions: resolutions});
  };

  render() {
    // TODO розібратись, чому в цьому компоненті не працюють Select i Textarea з react-validation
    const { sub, resolution_text, resolutions, direct_subs } = this.state;
    return <Choose>
      <When condition={direct_subs.length > 0}>
        <div>Додати резолюцію:</div>
        <div>Кому:</div>
        <select className='full_width' id='sub-select' name='sub' value={sub} onChange={this.onChange}>
          <option data-key={0} value='Не внесено'>------------</option>
          {
            direct_subs.map(sub => {
              if (sub.is_active === true) {
                return <option key={sub.id} data-key={sub.id}
                  value={sub.name + ', ' + sub.seat}>{sub.name}, {sub.seat}</option>;
              }
            })
          }
        </select>
        <label className='css_full_width'>Текст:
          <textarea className='css_full_width' value={resolution_text} name='resolution_text' onChange={this.onChange} maxLength={1000}/>
        </label>
        <button className="btn btn-outline-secondary" onClick={this.addResolution}>Додати</button>
        <If condition={resolutions.length > 0}>
          <div className='mt-1'>Створені резолюції:</div>
          <ol>
           {resolutions.map((res, index) => {
             return <li key={index}>
               <button type="button" className="close" aria-label="Close" onClick={this.delResolution.bind(undefined, index)}>
                 <span aria-hidden="true">&times;</span>
               </button>
               <div className="font-italic">{res.sub}</div>
               <div>{res.comment}</div>
               <hr/>
               </li>;
            })}
          </ol>
          <button className="btn btn-success" onClick={this.onClick}>Відправити</button>
        </If>
      </When>
      <Otherwise>
        <div className="css_loader">
          <div className="loader" id="loader-1" > </div>
        </div>
      </Otherwise>
    </Choose>
  }
}

export default Resolutions;