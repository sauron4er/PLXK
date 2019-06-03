'use strict';
import React from 'react';
import { toast } from 'react-toastify'; // спливаючі повідомлення:
import 'react-toastify/dist/ReactToastify.min.css';


class NewResolutions extends React.Component {

  state = {
    resolution_text: '',
    resolutions: [],
    emp_seat_id: '0',
    emp_seat: '',
  };

  onChange = (event) => {
    if (event.target.name === 'emp_seat') { // беремо ід керівника із <select>
      const selectedIndex = event.target.options.selectedIndex;
      this.setState({
        emp_seat_id: event.target.options[selectedIndex].getAttribute('data-key'),
        emp_seat: event.target.options[selectedIndex].getAttribute('value'),
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
    this.props.onClick(this.state.resolutions);
  };

  // додає резолюцію у список резолюцій
  addResolution = () => {
    if (this.state.semp_seat_id !== '0' && this.state.resolution_text !== '') {
      const new_resolution = {
        recipient_id: this.state.emp_seat_id,
        emp_seat: this.state.emp_seat,
        comment: this.state.resolution_text,
      };
      this.setState(({resolutions}) => ({
        resolutions: [...resolutions, new_resolution],
        emp_seat_id: '0',
        emp_seat: '',
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
    this.setState({acquaints: resolutions});
  };

  render() {
    // TODO розібратись, чому в цьому компоненті не працюють Select i Textarea з react-validation
    const { emp_seat, resolution_text, resolutions } = this.state;
    const {directSubs} = this.props;
    return <Choose>
      <When condition={directSubs.length > 0}>
        <div>Додати резолюцію:</div>
        <div>Кому:</div>
        <select className='full_width' id='emp_seat_select' name='emp_seat' value={emp_seat} onChange={this.onChange}>
          <option data-key={0} value='Не внесено'>------------</option>
          {
            directSubs.map(sub => {
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
               <div className="font-italic">{res.emp_seat}</div>
               <div>{res.comment}</div>
               <hr/>
               </li>;
            })}
          </ol>
          <button className="btn btn-success" onClick={this.onClick}>Відправити</button>
        </If>
      </When>
      <Otherwise>
          <div className="mt-3 loader-small" id="loader-1" > </div>
      </Otherwise>
    </Choose>
  }
  
  static defaultProps = {
    // resolutions: [],
  }
}

export default NewResolutions;