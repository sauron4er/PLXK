'use strict';
import React from 'react';
import axios from 'axios';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class CorrTable extends React.Component {

  // static context = Context;

  state = {
    data_received: false
  };

  componentDidMount() {
    this.setState({
      data_received: true
    })
  }

  render() {
    const {data_received} = this.state;

    if (data_received) {
      return <>
        <div>Таблиця</div>
        {/*<div>{this.context}</div>*/}
      </>;
    } else {
      return (
        <div className='css_loader'>
          <div className='loader' id='loader-1'>
            {' '}
          </div>
        </div>
      );
    }
  }

  static defaultProps = {};
}

export default CorrTable;
