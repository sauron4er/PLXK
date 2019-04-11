'use strict';
import React, {Fragment} from 'react';
import Paper from '@material-ui/core/Paper';
import Form from 'react-validation/build/form';
import Button from 'react-validation/build/button';
import Select from 'react-validation/build/select';
import {required} from '../_else/validations';
import axios from 'axios';
import querystring from 'querystring'; // for axios
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

import '../_else/loader_style.css';
import '../_else/my_styles.css';

class DocType extends React.Component {
  state = {
    loading: true
  };

  getModules = () => {};

  getPhases = () => {};

  getInfo = () => {
      this.getModules();
      this.getPhases();
    
    this.setState({
      loading: false
    });
  };

  componentDidMount() {
    this.getInfo();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.docType !== prevProps.docType) {
      this.getInfo();
    }
  }

  onChange = (event) => {};

  render() {
    const {loading} = this.state;
    const {docType} = this.props;
    return (
      <Choose>
        <When condition={loading === false}>
          <div>Loaded!</div>
        </When>
        <Otherwise>
          <div className='css_loader'>
            <div className='loader' id='loader-1'>
              {' '}
            </div>
          </div>
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    docType: []
  };
}

export default DocType;
