'use strict';
import * as React from 'react';
import axios from 'axios';

class RecipientChief extends React.Component {
  state = {
    is_loading: true,
    chiefs: ''
  };

  // отримуємо з бд список шефів
  componentDidMount() {
    axios({
      method: 'get',
      url: 'get_chiefs/' + localStorage.getItem('my_seat') + '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        this.setState({
          chiefs: response.data,
          is_loading: false
        });
      })
      .catch((error) => {
        console.log('errorpost: ' + error);
      });
  }

  render() {
    const {chiefs, is_loading} = this.state;
    const {name, seat, id} = this.props.recipientChief;
    const {module_info, onChange} = this.props;
    return (
      <Choose>
        <When condition={is_loading === true}> </When>
        <When condition={chiefs && chiefs.length > 0}>
          <label className='full_width' htmlFor='recipient_chief_select'>
            <If condition={module_info.required}>{'* '}</If>{module_info.field_name}:
            <select
              id='recipient_chief_select'
              name='recipient_chief'
              className='form-control full_width'
              value={name}
              onChange={onChange}
            >
              <option key={-1} data-key={0} value='0'>
                ------------
              </option>
              {chiefs.map((chief) => {
                return (
                  <option key={chief.id} data-key={chief.id} value={chief.name}>
                    {chief.name + ', ' + chief.seat}
                  </option>
                );
              })}
            </select>
          </label>
        </When>
        <Otherwise>
          <small className='text-danger'>
            У базу даних не внесено посаду Вашого керівника. Зверніться до адміністратора.
          </small>
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    recipientChief: {},
    module_info: {
      field_name: 'Кому',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export default RecipientChief;
