'use strict';
import * as React from 'react';
import axios from 'axios';

class Recipient extends React.Component {
  state = {
    recipients: []
  };

  // отримуємо з бд список шефів
  componentDidMount() {
    // TODO !!! Переробити на отримання всього списку співробітників
    axios({
      method: 'get',
      url: 'get_chiefs/' + localStorage.getItem('my_seat') + '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        this.setState({
          recipients: response.data
        });
      })
      .catch((error) => {
        console.log('errorpost: ' + error);
      });
  }

  render() {
    const {recipients} = this.state;
    const {name, seat, id} = this.props.recipient;
    const {fieldName, onChange} = this.props;
    return (
      <If condition={recipients.length > 0}>
        <label className='full_width' htmlFor='recipient_select'>
          {fieldName}:
          <select
            id='recipient_select'
            name='recipient'
            className='form-control full_width'
            value={name}
            onChange={onChange}
          >
            <option key={0} data-key={0} value='0'>
              ------------
            </option>
            {recipients.map((recipient) => {
              return (
                <option key={recipient.id} data-key={recipient.id} value={recipient.name}>
                  {recipient.name + ', ' + recipient.seat}
                </option>
              );
            })}
          </select>
        </label>
      </If>
    );
  }

  static defaultProps = {
    recipient: [],
    fieldName: 'Кому'
  };
}

export default Recipient;
